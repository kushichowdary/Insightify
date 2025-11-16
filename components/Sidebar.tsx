
import React from 'react';
import Icon from './Icon';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
  isExpanded: boolean;
  onHoverChange: (isExpanded: boolean) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'tachometer-alt' },
  { id: 'url-analysis', label: 'URL Analysis', icon: 'link' },
  { id: 'file-upload', label: 'File Upload', icon: 'upload' },
  { id: 'single-review', label: 'Single Review', icon: 'edit' },
  { id: 'competitive-analysis', label: 'Competitor Analysis', icon: 'balance-scale' },
  { id: 'analytics', label: 'Analytics', icon: 'chart-bar' },
  { id: 'reporting', label: 'Reporting', icon: 'file-invoice' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout, isExpanded, onHoverChange }) => {
  const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => (
    <li className="relative group mb-3">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onTabChange(item.id);
        }}
        className={`flex items-center relative overflow-hidden transition-all duration-500 rounded-xl py-3 border ${
          isExpanded ? 'px-5' : 'justify-center'
        } ${
          activeTab === item.id
            ? 'text-brand-primary font-semibold bg-brand-primary/10 shadow-glow-primary border-brand-primary/30'
            : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text bg-black/5 dark:bg-white/5 border-transparent hover:border-brand-primary/20 hover:shadow-glow-primary'
        }`}
      >
        <Icon
          name={item.icon}
          className={`w-5 relative z-10 text-center transition-all duration-500 ${
            isExpanded ? 'mr-3' : ''
          } group-hover:scale-110 group-hover:text-brand-primary`}
        />
        {isExpanded && (
          <span className="relative z-10 whitespace-nowrap transition-all duration-300">
            {item.label}
          </span>
        )}
      </a>
    </li>
  );

  return (
    <div
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={`fixed top-0 left-0 h-full flex flex-col justify-between z-50 transition-all duration-700 ease-in-out overflow-hidden bg-light-surface dark:bg-black border-r border-light-border dark:border-dark-border ${
        isExpanded ? 'w-64 shadow-2xl' : 'w-20 shadow-lg'
      }`}
    >
      {/* Header */}
      <div
        className={`py-5 border-b border-light-border dark:border-dark-border transition-all duration-500 ${
          isExpanded ? 'px-6' : 'px-0'
        }`}
      >
        <h2
          className={`text-xl font-bold text-brand-primary flex items-center gap-2 ${
            isExpanded ? '' : 'justify-center'
          }`}
          style={{ textShadow: '0 0 15px var(--color-primary-glow)' }}
        >
          <Icon name="chart-line" />
          {isExpanded && <span>Sentilytics</span>}
        </h2>
      </div>

      {/* Navigation */}
      <ul className="flex-grow pt-4 px-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-brand-primary/30 scrollbar-track-transparent">
        {navItems.map((item) => (
          <NavLink key={item.id} item={item} />
        ))}
      </ul>

      {/* Footer */}
      <div className={`border-t border-light-border dark:border-dark-border p-4 flex flex-col items-center space-y-4`}>
        {isExpanded && (
          <div className="text-center text-xs text-light-text-secondary dark:text-dark-text-secondary font-light tracking-wide animate-fade-in">
            Built by <span className="text-brand-primary font-medium">Kushwanth</span>
          </div>
        )}

        {/* Social Icons */}
        <div className="flex justify-center gap-6">
          <a
            href="https://www.linkedin.com/in/kushichowdary/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-primary transform hover:scale-110 transition-all duration-500"
          >
            <Icon type="brands" name="linkedin" className="text-lg" />
          </a>
          <a
            href="https://github.com/kushichowdary"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-primary transform hover:scale-110 transition-all duration-500"
          >
            <Icon type="brands" name="github" className="text-lg" />
          </a>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-primary transition-all duration-500 hover:shadow-glow-primary bg-black/5 dark:bg-white/5 px-4 py-2.5 rounded-lg ${
            isExpanded ? 'justify-start' : ''
          }`}
        >
          <Icon
            name="sign-out-alt"
            className={`w-5 text-center ${isExpanded ? 'mr-3' : ''}`}
          />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;