
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
import Reporting from './pages/Reporting';
import { AlertContainer } from './components/Alert';
import { AlertMessage, Theme } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');

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
    admin: 'Admin Panel',
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
      case 'admin': return <Admin addAlert={addAlert} />;
      case 'settings': return <Settings addAlert={addAlert} />;
      case 'app-settings': return <AppSettings addAlert={addAlert} theme={theme} onToggleTheme={toggleTheme} />;
      default: return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    addAlert('Login successful! Welcome back.', 'success');
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    addAlert('You have been logged out.', 'info');
  }

  if (!isAuthenticated) {
    return (
        <>
            <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
            <Login onLogin={handleLogin} />
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