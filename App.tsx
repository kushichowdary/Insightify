
import React, { useState, useCallback, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import UrlAnalysis from './pages/UrlAnalysis';
import FileUpload from './pages/FileUpload';
import SingleReview from './pages/SingleReview';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Settings from './pages/Settings';
import AppSettings from './pages/AppSettings';
import CompetitiveAnalysis from './pages/CompetitiveAnalysis';
import Reporting from './pages/Reporting';
import { AlertContainer } from './components/Alert';
import { AlertMessage, Theme, AccentColor } from './types';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [accentColor, setAccentColor] = useState<AccentColor | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply theme from localStorage on initial load
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to user's system preference if no theme is saved
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Apply accent color from localStorage on initial load
    const savedAccent = localStorage.getItem('accentColor');
    if (savedAccent) {
      try {
        const parsedAccent: AccentColor = JSON.parse(savedAccent);
        setAccentColor(parsedAccent);
      } catch (e) {
        console.error("Failed to parse accent color from localStorage", e);
        localStorage.removeItem('accentColor');
      }
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    // Apply custom accent color or clear it to use theme default
    const root = document.documentElement;
    if (accentColor) {
      root.style.setProperty('--color-primary', accentColor.main);
      root.style.setProperty('--color-primary-hover', accentColor.hover);
      root.style.setProperty('--color-primary-glow', accentColor.glow);
    } else {
      // Clear inline styles to revert to CSS-defined theme defaults
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-primary-hover');
      root.style.removeProperty('--color-primary-glow');
    }
  }, [accentColor, theme]); // Rerun when theme changes to ensure override is re-applied if needed


  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const addAlert = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setAlerts(prevAlerts => [...prevAlerts, { id, message, type }]);
  }, []);

  const dismissAlert = useCallback((id: number) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  }, []);

  const pageTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    'url-analysis': 'Product URL Analysis',
    'file-upload': 'File Upload Analysis',
    'single-review': 'Single Review Analysis',
    'competitive-analysis': 'Competitive Analysis',
    analytics: 'Analytics Dashboard',
    reporting: 'Reporting',
    settings: 'Profile & Settings',
    'app-settings': 'Application Settings',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onTabChange={setActiveTab} />;
      case 'url-analysis': return <UrlAnalysis addAlert={addAlert} />;
      case 'file-upload': return <FileUpload addAlert={addAlert} />;
      case 'single-review': return <SingleReview addAlert={addAlert} />;
      case 'competitive-analysis': return <CompetitiveAnalysis addAlert={addAlert} />;
      case 'analytics': return <Analytics addAlert={addAlert} />;
      case 'reporting': return <Reporting addAlert={addAlert} />;
      case 'settings': return <Settings addAlert={addAlert} />;
      case 'app-settings': return <AppSettings addAlert={addAlert} theme={theme} onToggleTheme={toggleTheme} accentColor={accentColor} setAccentColor={setAccentColor} />;
      default: return <Dashboard onTabChange={setActiveTab} />;
    }
  };
  
  const handleLogout = () => {
    signOut(auth).then(() => {
        setActiveTab('dashboard');
        addAlert('You have been logged out.', 'info');
    }).catch((error) => {
        addAlert(`Logout failed: ${error.message}`, 'error');
    });
  }

  if (authLoading) {
    return (
        <>
            <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
            <Loader message="Authenticating..." />
        </>
    );
  }

  if (!user) {
    return (
        <>
            <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
            <Login addAlert={addAlert} />
        </>
    );
  }

  const isDashboard = activeTab === 'dashboard';

  return (
    <div className="flex h-screen bg-light-background dark:bg-dark-background">
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
      {!isDashboard && (
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          isExpanded={isSidebarExpanded}
          onHoverChange={setIsSidebarExpanded}
        />
       )}
      <main className={`flex-1 flex flex-col transition-all duration-700 ease-in-out ${!isDashboard ? (isSidebarExpanded ? 'ml-64' : 'ml-20') : ''}`}>
        {!isDashboard && <Header 
            user={user}
            title={pageTitles[activeTab] || 'Dashboard'} 
            onLogout={handleLogout} 
            onSettingsClick={() => setActiveTab('settings')}
            onAppSettingsClick={() => setActiveTab('app-settings')}
            theme={theme}
            onToggleTheme={toggleTheme}
        />}
        <div className={`flex-1 overflow-y-auto ${!isDashboard ? 'p-8' : ''}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;