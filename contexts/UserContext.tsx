
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, collection, query, orderBy, limit, deleteField, writeBatch, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, Notification, Theme, AccentColor } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface UserContextType {
  profile: UserProfile | null;
  notifications: Notification[];
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
  updateAccent: (accent: AccentColor | null) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setNotifications([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Real-time Profile Listener
    const profilePath = `users/${user.uid}`;
    const profileRef = doc(db, 'users', user.uid);
    const profileUnsubscribe = onSnapshot(profileRef, async (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        // Initialize profile if it doesn't exist
        const initialProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || 'Analyst',
          email: user.email || '',
          avatar: user.photoURL || '',
          role: 'Analyst',
          theme: 'dark',
          notificationsEnabled: true,
          createdAt: Date.now()
        };
        try {
          await setDoc(profileRef, initialProfile);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, profilePath);
        }
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, profilePath);
      setLoading(false);
    });

    // Real-time Notifications Listener
    const notifPath = `users/${user.uid}/notifications`;
    const notifQuery = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const notificationsUnsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Notification));
      setNotifications(items);
    }, (error) => {
       handleFirestoreError(error, OperationType.LIST, notifPath);
    });

    return () => {
      profileUnsubscribe();
      notificationsUnsubscribe();
    };
  }, [user]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const updateTheme = async (theme: Theme) => {
    await updateProfile({ theme });
  };

  const updateAccent = async (accentColor: AccentColor | null) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      if (accentColor === null) {
        await updateDoc(doc(db, 'users', user.uid), { accentColor: deleteField() });
      } else {
        await updateProfile({ accentColor });
      }
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/notifications/${id}`;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const clearNotifications = async () => {
    if (!user) return;
    const path = `users/${user.uid}/notifications`;
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, 'users', user.uid, 'notifications', n.id));
      });
      await batch.commit();
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addNotification = async (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!user) return;
    const path = `users/${user.uid}/notifications`;
    try {
      await addDoc(collection(db, 'users', user.uid, 'notifications'), {
        ...n,
        timestamp: Date.now(),
        read: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return (
    <UserContext.Provider value={{ 
      profile, notifications, loading, updateProfile, 
      updateTheme, updateAccent, markAsRead, clearNotifications, addNotification 
    }}>
      {children}
    </UserContext.Provider>
  );
};

