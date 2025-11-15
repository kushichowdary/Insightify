
import React, { useState } from 'react';
import Icon from '../components/Icon';
import DotGrid from '../components/DotGrid';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin(); // For both login and signup for this demo
    }, 1000);
  };

  const commonInputClasses = "mt-1 w-full p-3 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary focus:outline-none bg-light-surface/50 dark:bg-black/20 text-light-text dark:text-white placeholder-gray-400 transition-all";
  const commonLabelClasses = "text-sm font-medium text-light-text-secondary dark:text-gray-300";
  
  const AuthButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-slate-500 dark:disabled:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-magenta-500/30 hover:shadow-glow-magenta"
    >
      {children}
    </button>
  );

  const LoginForm = () => (
     <form onSubmit={handleAuthAction} className="space-y-6 animate-fade-in">
        <div>
            <label className={commonLabelClasses}>Email Address</label>
            <input 
            type="email" 
            defaultValue="analyst@company.com"
            className={commonInputClasses} 
            required 
            />
        </div>
        <div>
            <label className={commonLabelClasses}>Password</label>
            <input 
            type="password" 
            defaultValue="password"
            className={commonInputClasses} 
            required 
            />
        </div>
        <AuthButton>
            {isLoading ? 'Logging in...' : 'Login'}
        </AuthButton>
    </form>
  );

  const SignupForm = () => (
     <form onSubmit={handleAuthAction} className="space-y-6 animate-fade-in">
        <div>
            <label className={commonLabelClasses}>Full Name</label>
            <input type="text" className={commonInputClasses} required />
        </div>
        <div>
            <label className={commonLabelClasses}>Email Address</label>
            <input type="email" className={commonInputClasses} required />
        </div>
        <div>
            <label className={commonLabelClasses}>Password</label>
            <input type="password" className={commonInputClasses} required />
        </div>
        <AuthButton>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
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
            {isLoginView ? <LoginForm /> : <SignupForm />}
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