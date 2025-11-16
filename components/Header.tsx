
import React, { useState, useEffect, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import Icon from './Icon';
import ThemeSwitch from './ThemeSwitch';
import { Theme } from '../types';

interface HeaderProps {
  title: string;
  user: FirebaseUser;
  onLogout: () => void;
  onSettingsClick: () => void;
  onAppSettingsClick: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, user, onLogout, onSettingsClick, onAppSettingsClick, theme, onToggleTheme }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const mockNotifications = [
    { id: 1, text: "New report 'Q2 Electronics' is ready.", time: "5m ago", icon: "file-alt" },
    { id: 2, text: "Model retraining completed successfully.", time: "2h ago", icon: "cogs" },
    { id: 3, text: "Server maintenance scheduled for tonight.", time: "1d ago", icon: "server" }
  ];

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'A';

  return (
    <header className="relative z-20 bg-light-surface/80 dark:bg-dark-surface backdrop-blur-lg border-b border-light-border dark:border-dark-border p-5 flex justify-between items-center flex-shrink-0">
      <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">{title}</h1>
      <div className="flex items-center gap-6">
        <ThemeSwitch theme={theme} onToggle={onToggleTheme} />
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors relative"
          >
            <i className="fa-regular fa-bell text-xl"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-error text-white text-xs rounded-full flex items-center justify-center">3</span>
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-light-surface/80 dark:bg-slate-900/80 backdrop-blur-xl border border-light-border dark:border-white/10 rounded-lg shadow-2xl z-30 animate-fade-in-down">
              <div className="p-3 font-semibold text-sm border-b border-light-border dark:border-white/10 text-light-text dark:text-dark-text">Notifications</div>
              <div className="py-1 max-h-64 overflow-y-auto">
                {mockNotifications.map(n => (
                  <a href="#" key={n.id} className="flex items-start gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5">
                    <Icon name={n.icon} className="text-brand-primary mt-1" />
                    <div className="flex-1">
                      <p>{n.text}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{n.time}</p>
                    </div>
                  </a>
                ))}
              </div>
              <div className="border-t border-light-border dark:border-white/10 p-2 text-center">
                 <a href="#" className="text-sm text-brand-primary font-semibold hover:underline">View all</a>
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="w-9 h-9 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent hover:ring-brand-primary-hover transition-all">
            {userInitial}
          </button>
          {profileOpen && (
             <div className="absolute right-0 mt-3 w-56 bg-light-surface/80 dark:bg-slate-900/80 backdrop-blur-xl border border-light-border dark:border-white/10 rounded-lg shadow-2xl z-30 animate-fade-in-down">
                <div className="p-2 border-b border-light-border dark:border-white/10">
                    <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate">{user.displayName || 'Analyst'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="py-1">
                    <a href="#" onClick={(e) => { e.preventDefault(); onSettingsClick(); setProfileOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"><Icon name="user-circle" /> Profile & Settings</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onAppSettingsClick(); setProfileOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"><Icon name="cog" /> App Settings</a>
                </div>
                 <div className="border-t border-light-border dark:border-white/10 p-1">
                    <button onClick={onLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-md"><Icon name="sign-out-alt" /> Logout</button>
                </div>
             </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
