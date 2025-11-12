
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
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
