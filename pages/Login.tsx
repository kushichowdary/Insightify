import React, { useState } from 'react';
import Icon from '../components/Icon';
import DotGrid from '../components/DotGrid';
import { auth } from '../firebase';
// FIX: Import firebase compat to get auth providers and methods
import firebase from 'firebase/compat/app';
import { AlertType, AccentColor, Theme } from '../types';
import ScrambledText from '../components/ScrambledText';

interface LoginProps {
  addAlert: (message: string, type: AlertType) => void;
  accentColor: AccentColor | null;
  theme: Theme;
}

// Firebase error handler
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

// 🔹 Reusable AuthForm component (moved outside main component to fix typing issue)
const AuthForm: React.FC<{
  isLoginView: boolean;
  isLoading: boolean;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}> = ({
  isLoginView,
  isLoading,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  handleSubmit,
}) => {
  const commonInputClasses =
    'mt-1 w-full p-3 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:outline-none bg-light-surface/50 dark:bg-black/30 text-light-text dark:text-white placeholder-gray-400 transition-all';
  const commonLabelClasses =
    'text-sm font-medium text-light-text-secondary dark:text-gray-300';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {!isLoginView && (
        <div>
          <label className={commonLabelClasses}>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={commonInputClasses}
            required
          />
        </div>
      )}
      <div>
        <label className={commonLabelClasses}>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={commonInputClasses}
          required
        />
      </div>
      <div>
        <label className={commonLabelClasses}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={commonInputClasses}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="relative w-full py-3 bg-brand-primary text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 
        disabled:bg-slate-600 dark:disabled:bg-slate-700 
        hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] 
        before:absolute before:inset-0 before:rounded-lg before:blur-xl before:bg-brand-primary before:opacity-30 before:transition-all before:duration-300 hover:before:opacity-50"
      >
        {isLoading
          ? isLoginView
            ? 'Logging in...'
            : 'Creating Account...'
          : isLoginView
          ? 'Login'
          : 'Sign Up'}
      </button>
    </form>
  );
};

const Login: React.FC<LoginProps> = ({ addAlert, accentColor, theme }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Handle Email + Password Auth
  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLoginView) {
        // FIX: Use compat syntax for signInWithEmailAndPassword
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        // FIX: Use compat syntax for createUserWithEmailAndPassword
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        if (userCredential.user) {
          // FIX: Use compat syntax for updateProfile
          await userCredential.user.updateProfile({ displayName: fullName });
        }
      }
    } catch (error: any) {
      addAlert(getFirebaseErrorMessage(error.code), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Auth
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // FIX: Use compat syntax for GoogleAuthProvider
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      // FIX: Use compat syntax for signInWithPopup
      await auth.signInWithPopup(provider);
    } catch (error: any) {
      addAlert(getFirebaseErrorMessage(error.code), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const titleStyle: React.CSSProperties = {
    color: 'var(--color-primary)',
    textShadow: '0 0 25px var(--color-primary-glow)'
  };
  
  const lightActiveColor = accentColor?.main || '#3b82f6';
  const darkActiveColor = accentColor?.main || '#f038d1';

  // UI Elements
  const OrSeparator = () => (
    <div className="flex items-center my-4">
      <hr className="flex-grow border-light-border dark:border-dark-border" />
      <span className="mx-4 text-xs text-light-text-secondary dark:text-dark-text-secondary">
        OR
      </span>
      <hr className="flex-grow border-light-border dark:border-dark-border" />
    </div>
  );

  return (
    <div className="min-h-screen bg-light-background dark:bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Dot Grid */}
      <div className="dark:hidden absolute inset-0 w-full h-full z-0">
        <DotGrid
          dotSize={3}
          gap={30}
          baseColor="#d1d5db"
          activeColor={lightActiveColor}
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
          activeColor={darkActiveColor}
          proximity={120}
          shockStrength={3}
          className="w-full h-full"
        />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm z-10 group animate-float">
        <div className="text-center mb-8">
          <ScrambledText 
            className="!m-0 !max-w-full !font-sans !text-4xl !font-bold text-center justify-center"
            radius={150}
            style={titleStyle}
          >
            Sentilytics
          </ScrambledText>
          <p className="text-light-text-secondary dark:text-gray-400 mt-2">
            Welcome back
          </p>
        </div>

        <div className="p-8 border border-light-border dark:border-dark-border rounded-2xl 
          transition-all duration-300 group-hover:shadow-glow-primary
          group-hover:bg-light-surface/50 dark:group-hover:bg-black/20 
          group-hover:backdrop-blur-md bg-light-surface/30 dark:bg-black/30 shadow-inner shadow-black/5">
          
          {/* Auth Form */}
          <AuthForm
            isLoginView={isLoginView}
            isLoading={isLoading}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            fullName={fullName}
            setFullName={setFullName}
            handleSubmit={handleEmailPasswordAuth}
          />

          <OrSeparator />

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 bg-white dark:bg-slate-800 text-light-text dark:text-dark-text font-semibold rounded-lg 
            hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-all duration-300 
            flex items-center justify-center gap-3 border border-light-border dark:border-dark-border 
            hover:shadow-glow-primary"
          >
            <Icon type="brands" name="google" />
            Sign in with Google
          </button>

          {/* Toggle Text */}
          <p className="text-center text-sm text-light-text-secondary dark:text-gray-400 mt-6">
            {isLoginView ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLoginView(!isLoginView)}
              className="font-semibold text-brand-primary hover:underline transition-colors"
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