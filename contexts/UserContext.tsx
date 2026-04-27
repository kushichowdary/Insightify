
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, collection, query, orderBy, limit, deleteField, writeBatch, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, Notification, Theme, AccentColor } from '../types';

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
    const profileRef = doc(db, 'users', user.uid);
    const profileUnsubscribe = onSnapshot(profileRef, (snap) => {
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
        setDoc(profileRef, initialProfile);
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile listener error:", error);
      setLoading(false);
    });

    // Real-time Notifications Listener
    const notifQuery = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const notificationsUnsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const items = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Notification));
      setNotifications(items);
    });

    return () => {
      profileUnsubscribe();
      notificationsUnsubscribe();
    };
  }, [user]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), data);
  };

  const updateTheme = async (theme: Theme) => {
    await updateProfile({ theme });
  };

  const updateAccent = async (accentColor: AccentColor | null) => {
    if (!user) return;
    if (accentColor === null) {
      await updateDoc(doc(db, 'users', user.uid), { accentColor: deleteField() });
    } else {
      await updateProfile({ accentColor });
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true });
  };

  const clearNotifications = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
      batch.delete(doc(db, 'users', user.uid, 'notifications', n.id));
    });
    await batch.commit();
  };

  const addNotification = async (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'notifications'), {
      ...n,
      timestamp: Date.now(),
      read: false
    });
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
