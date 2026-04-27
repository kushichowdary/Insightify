import React, { useState, useEffect, useRef } from 'react';
// FIX: Changed import to use firebase compat to get User type.
import firebase from 'firebase/compat/app';
import Icon from './Icon';
import ThemeSwitch from './ThemeSwitch';
import { Theme } from '../types';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
  title: string;
  // FIX: Use firebase.User for the user prop type.
  user: firebase.User;
  onLogout: () => void;
  onSettingsClick: () => void;
  onAppSettingsClick: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, user, onLogout, onSettingsClick, onAppSettingsClick, theme, onToggleTheme }) => {
  const { profile, notifications, markAsRead, clearNotifications } = useUser();
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

  const unreadCount = notifications.filter(n => !n.read).length;

  const userInitial = profile?.name ? profile.name.charAt(0).toUpperCase() : (user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'A');

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        default: return 'info-circle';
    }
  };

  return (
    <header className="relative z-20 bg-light-surface/80 dark:bg-dark-surface backdrop-blur-lg border-b border-light-border dark:border-dark-border p-5 flex justify-between items-center flex-shrink-0">
      <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">{title}</h1>
      <div className="flex items-center gap-6">
        <ThemeSwitch theme={theme} onToggle={onToggleTheme} />
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text transition-colors relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Icon name="bell" className="text-xl text-brand-primary" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-light-border dark:border-white/10 rounded-2xl shadow-2xl z-30 animate-fade-in-down overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b border-light-border dark:border-white/10">
                <span className="font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                    <button onClick={clearNotifications} className="text-[10px] uppercase tracking-widest font-black text-brand-primary hover:opacity-70 transition-opacity">Clear all</button>
                )}
              </div>
              <div className="py-2 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                    notifications.map(n => (
                        <div 
                            key={n.id} 
                            onClick={() => !n.read && markAsRead(n.id)}
                            className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors cursor-pointer ${n.read ? 'opacity-60' : 'bg-brand-primary/5 border-l-2 border-brand-primary'}`}
                        >
                            <div className={`p-2 rounded-lg bg-brand-primary/10 text-brand-primary`}>
                                <Icon name={getTypeIcon(n.type)} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs truncate">{n.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{n.message}</p>
                                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">{formatTime(n.timestamp)}</p>
                            </div>
                            {!n.read && <div className="w-2 h-2 bg-brand-primary rounded-full mt-2"></div>}
                        </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="w-10 h-10 bg-brand-primary/10 border-2 border-brand-primary rounded-xl flex items-center justify-center text-brand-primary font-black text-sm hover:scale-105 transition-all shadow-glow-primary/20 overflow-hidden">
            {profile?.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : userInitial}
          </button>
          {profileOpen && (
             <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-light-border dark:border-white/10 rounded-2xl shadow-2xl z-30 animate-fade-in-down overflow-hidden">
                <div className="p-4 bg-brand-primary/5 border-b border-light-border dark:border-white/10">
                    <p className="text-sm font-black text-light-text dark:text-dark-text truncate">{profile?.name || user.displayName || 'Analyst'}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate opacity-70 italic">{user.email}</p>
                    <div className="mt-2 text-[10px] uppercase font-bold tracking-widest text-brand-primary">{profile?.role || 'Analyst'}</div>
                </div>
                <div className="p-2 space-y-1">
                    <button onClick={() => { onSettingsClick(); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl transition-all">
                        <Icon name="user-circle" /> Account Profile
                    </button>
                    <button onClick={() => { onAppSettingsClick(); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl transition-all">
                        <Icon name="palette" /> Personalization
                    </button>
                </div>
                 <div className="border-t border-light-border dark:border-white/10 p-2">
                    <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-all whitespace-nowrap">
                        <Icon name="sign-out-alt" /> Log Out Region
                    </button>
                </div>
             </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;