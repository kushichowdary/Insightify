
import React, { useState } from 'react';
import Icon from '../components/Icon';
import DotGrid from '../components/DotGrid';
import { auth } from '../services/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { AlertType } from '../types';

interface LoginProps {
  addAlert: (message: string, type: AlertType) => void;
}

const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

const Login: React.FC<LoginProps> = ({ addAlert }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
        // App.tsx's onAuthStateChanged will handle UI updates
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: fullName });
        }
        // App.tsx's onAuthStateChanged will handle UI updates
      }
    } catch (error: any) {
      addAlert(getFirebaseErrorMessage(error.code), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // App.tsx's onAuthStateChanged will handle UI updates
    } catch (error: any) {
      addAlert(getFirebaseErrorMessage(error.code), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const commonInputClasses = "mt-1 w-full p-3 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:outline-none bg-light-surface/50 dark:bg-black/20 text-light-text dark:text-white placeholder-gray-400 transition-all";
  const commonLabelClasses = "text-sm font-medium text-light-text-secondary dark:text-gray-300";
  
  const AuthButton: React.FC<{ children: React.ReactNode, onClick?: () => void, type?: 'submit' | 'button' }> = ({ children, onClick, type = 'submit' }) => (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className="w-full py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-slate-500 dark:disabled:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-magenta-500/30 hover:shadow-glow-magenta"
    >
      {children}
    </button>
  );

  const OrSeparator = () => (
    <div className="flex items-center my-4">
      <hr className="flex-grow border-light-border dark:border-dark-border" />
      <span className="mx-4 text-xs text-light-text-secondary dark:text-dark-text-secondary">OR</span>
      <hr className="flex-grow border-light-border dark:border-dark-border" />
    </div>
  );

  const AuthForm = () => (
     <form onSubmit={handleEmailPasswordAuth} className="space-y-6 animate-fade-in">
        {!isLoginView && (
            <div>
                <label className={commonLabelClasses}>Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={commonInputClasses} required />
            </div>
        )}
        <div>
            <label className={commonLabelClasses}>Email Address</label>
            <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={commonInputClasses} 
                required 
            />
        </div>
        <div>
            <label className={commonLabelClasses}>Password</label>
            <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={commonInputClasses} 
                required 
            />
        </div>
        <AuthButton>
            {isLoading ? (isLoginView ? 'Logging in...' : 'Creating Account...') : (isLoginView ? 'Login' : 'Sign Up')}
        </AuthButton>
    </form>
  );

  return (
    <div className="min-h-screen bg-light-background dark:bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <div className="dark:hidden absolute inset-0 w-full h-full z-0">
             <DotGrid
                dotSize={3}
                gap={30}
                baseColor="#d1d5db" // gray-300
                activeColor="#c026d3" // fuchsia-600
                proximity={120}
                shockStrength={3}
                className="w-full h-full"
            />
        </div>
         <div className="hidden dark:block absolute inset-0 w-full h-full z-0">
             <DotGrid
                dotSize={3}
                gap={30}
                baseColor="#392e4e"
                activeColor="#ff00ff"
                proximity={120}
                shockStrength={3}
                className="w-full h-full"
            />
        </div>
      <div className="w-full max-w-md z-10 group">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-light-text dark:text-white flex items-center justify-center gap-2">
                <Icon name="chart-line" />
                Insightify
            </h1>
            <p className="text-light-text-secondary dark:text-gray-400 mt-2">
                {isLoginView ? 'Welcome back! Please login to your account.' : 'Create an account to get started.'}
            </p>
        </div>
        <div className="p-8 border border-light-border dark:border-dark-border rounded-2xl transition-all duration-300 group-hover:shadow-glow-magenta group-hover:bg-light-surface/50 dark:group-hover:bg-black/20 group-hover:backdrop-blur-md">
            <AuthForm />
            <OrSeparator />
             <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 bg-white dark:bg-slate-800 text-light-text dark:text-dark-text font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-3 border border-light-border dark:border-dark-border"
            >
                <Icon type="brands" name="google" />
                Sign in with Google
            </button>
            <p className="text-center text-sm text-light-text-secondary dark:text-gray-400 mt-6">
                {isLoginView ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLoginView(!isLoginView)} 
                  className="font-semibold text-brand-primary hover:text-magenta-400 hover:underline transition-colors"
                >
                    {isLoginView ? 'Sign Up' : 'Login'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;