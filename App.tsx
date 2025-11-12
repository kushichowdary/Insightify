

import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import UrlAnalysis from './pages/UrlAnalysis';
import FileUpload from './pages/FileUpload';
import SingleReview from './pages/SingleReview';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Settings from './pages/Settings';
import AppSettings from './pages/AppSettings';
import CompetitiveAnalysis from './pages/CompetitiveAnalysis';
import BrandReputation from './pages/BrandReputation';
import MarketPulse from './pages/MarketPulse';
import Reporting from './pages/Reporting';
import DatasetQA from './pages/DatasetQA';
import { AlertContainer } from './components/Alert';
import { AlertMessage, Theme } from './types';
import { auth } from './services/firebase';
// FIX: Use Firebase compat imports
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import Loader from './components/Loader';

const App: React.FC = () => {
  // FIX: Use firebase.User type from compat library
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const isSidebarExpanded = isSidebarPinned || isHoveringSidebar;

  const [theme, setTheme] = useState<Theme>('dark');
  
  const addAlert = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setAlerts(prevAlerts => [...prevAlerts, { id, message, type }]);
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

    // Apply saved accent color
    const savedColor = localStorage.getItem('brandColor');
    const savedColorHover = localStorage.getItem('brandColorHover');
    if (savedColor && savedColorHover) {
      document.documentElement.style.setProperty('--color-brand-primary', savedColor);
      document.documentElement.style.setProperty('--color-brand-primary-hover', savedColorHover);
    }

  }, []);

  useEffect(() => {
    // FIX: Use Firebase compat API for onAuthStateChanged
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user && activeTab === 'login') {
         setActiveTab('dashboard');
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const dismissAlert = useCallback((id: number) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  }, []);

  const pageTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    'url-analysis': 'Product URL Analysis',
    'file-upload': 'File Upload Analysis',
    'single-review': 'Single Review Analysis',
    'competitive-analysis': 'Competitive Analysis',
    'brand-reputation': 'Brand Reputation Analysis',
    'market-pulse': 'Market Pulse Analysis',
    'dataset-qa': 'Dataset Q&A',
    analytics: 'Analytics Dashboard',
    reporting: 'Reporting',
    admin: 'Admin Panel',
    settings: 'Profile & Settings',
    'app-settings': 'Application Settings',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onTabChange={setActiveTab} user={currentUser} />;
      case 'url-analysis': return <UrlAnalysis addAlert={addAlert} />;
      case 'file-upload': return <FileUpload addAlert={addAlert} />;
      case 'single-review': return <SingleReview addAlert={addAlert} />;
      case 'competitive-analysis': return <CompetitiveAnalysis addAlert={addAlert} />;
      case 'brand-reputation': return <BrandReputation addAlert={addAlert} />;
      case 'market-pulse': return <MarketPulse addAlert={addAlert} />;
      case 'dataset-qa': return <DatasetQA addAlert={addAlert} />;
      case 'analytics': return <Analytics addAlert={addAlert} />;
      case 'reporting': return <Reporting addAlert={addAlert} />;
      case 'admin': return <Admin addAlert={addAlert} />;
      case 'settings': return <Settings addAlert={addAlert} />;
      case 'app-settings': return <AppSettings addAlert={addAlert} theme={theme} onToggleTheme={toggleTheme} />;
      default: return <Dashboard onTabChange={setActiveTab} user={currentUser} />;
    }
  };

  const handleLogout = async () => {
    try {
        // FIX: Use Firebase compat API for signOut
        await auth.signOut();
        setActiveTab('dashboard');
        addAlert('You have been logged out.', 'info');
    } catch (error) {
        console.error("Logout error", error);
        addAlert('Failed to log out.', 'error');
    }
  }

  if (isAuthLoading) {
    return <Loader message="Authenticating..." />;
  }

  if (!currentUser) {
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
          onHoverChange={setIsHoveringSidebar}
          isPinned={isSidebarPinned}
          onPinToggle={() => setIsSidebarPinned(prev => !prev)}
        />
       )}
      <main className={`flex-1 flex flex-col transition-all duration-700 ease-in-out ${!isDashboard ? (isSidebarExpanded ? 'ml-64' : 'ml-20') : ''}`}>
        {!isDashboard && <Header 
            title={pageTitles[activeTab] || 'Dashboard'}
            user={currentUser}
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