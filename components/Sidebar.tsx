

import React from 'react';
import Icon from './Icon';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
  isExpanded: boolean;
  onHoverChange: (isExpanded: boolean) => void;
  isPinned: boolean;
  onPinToggle: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'tachometer-alt' },
  { id: 'url-analysis', label: 'URL Analysis', icon: 'link' },
  { id: 'file-upload', label: 'File Upload', icon: 'upload' },
  { id: 'single-review', label: 'Single Review', icon: 'edit' },
  { id: 'competitive-analysis', label: 'Competitor Analysis', icon: 'balance-scale' },
  { id: 'brand-reputation', label: 'Brand Reputation', icon: 'bullhorn' },
  { id: 'dataset-qa', label: 'Dataset Q&A', icon: 'question-circle' },
  { id: 'analytics', label: 'Analytics', icon: 'chart-bar' },
  { id: 'reporting', label: 'Reporting', icon: 'file-invoice' },
  { id: 'admin', label: 'Admin Panel', icon: 'cogs' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout, isExpanded, onHoverChange, isPinned, onPinToggle }) => {
  const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => (
    <li className="relative group mb-3">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onTabChange(item.id);
        }}
        className={`flex items-center relative overflow-hidden transition-all duration-500 rounded-xl py-3 ${
          isExpanded ? 'px-5' : 'justify-center'
        } ${
          activeTab === item.id
            ? 'text-magenta-400 font-semibold'
            : 'text-white/70 hover:text-white'
        }`}
        style={{
          background:
            activeTab === item.id
              ? 'rgba(255, 0, 180, 0.1)'
              : 'rgba(255, 255, 255, 0.02)',
          boxShadow:
            activeTab === item.id
              ? '0 0 25px rgba(255, 0, 180, 0.5), inset 0 0 10px rgba(255, 0, 180, 0.3)'
              : '0 0 8px rgba(255, 0, 255, 0.06)',
          border: '1px solid rgba(255, 0, 200, 0.15)',
        }}
      >
        {/* Glow Border on Hover */}
        <span
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-700"
          style={{
            boxShadow:
              '0 0 25px 4px rgba(255, 0, 200, 0.45), inset 0 0 15px rgba(255, 0, 200, 0.3)',
            filter: 'drop-shadow(0 0 8px rgba(255, 0, 200, 0.4))',
          }}
        ></span>

        <Icon
          name={item.icon}
          className={`w-5 relative z-10 text-center transition-all duration-500 ${
            isExpanded ? 'mr-3' : ''
          } group-hover:scale-125 group-hover:text-magenta-300`}
        />
        {isExpanded && (
          <span className="relative z-10 whitespace-nowrap group-hover:text-magenta-200 transition-all duration-300">
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
      className={`fixed top-0 left-0 h-full flex flex-col justify-between z-50 transition-all duration-700 ease-in-out overflow-hidden ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      style={{
        background: '#000000', // 🔥 Pure Black Background
        borderRight: '1px solid rgba(255, 0, 200, 0.1)',
        boxShadow: isExpanded
          ? '0 0 30px rgba(255, 0, 200, 0.2)'
          : '0 0 15px rgba(255, 0, 200, 0.05)',
      }}
    >
      {/* Header */}
      <div
        className={`py-5 border-b border-white/10 transition-all duration-500 flex items-center ${
          isExpanded ? 'px-6 justify-between' : 'px-0 justify-center'
        }`}
      >
        <h2
          className={`text-xl font-bold text-magenta-300 flex items-center gap-2 ${
            isExpanded ? '' : 'justify-center'
          }`}
          style={{ textShadow: '0 0 15px rgba(255, 0, 200, 0.7)' }}
        >
          <Icon name="chart-line" />
          {isExpanded && <span>Insightify</span>}
        </h2>
        {isExpanded && (
           <button 
            onClick={onPinToggle} 
            className="p-1 text-white/60 hover:text-white transition-all duration-300" 
            title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
          >
            <Icon 
              name="thumbtack" 
              className={`transform transition-transform duration-300 ${isPinned ? 'rotate-45 text-magenta-300' : 'rotate-0'}`} 
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <ul className="flex-grow pt-4 px-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-magenta-500/30 scrollbar-track-transparent">
        {navItems.map((item) => (
          <NavLink key={item.id} item={item} />
        ))}
      </ul>

      {/* Footer */}
      <div className="border-t border-white/10 p-4 flex flex-col items-center space-y-5">
        {isExpanded && (
          <div className="text-center text-xs text-white/70 font-light tracking-wide animate-fade-in">
            Built by <span className="text-magenta-300 font-medium">Kushwanth</span>
          </div>
        )}

        {/* Social Icons */}
        <div className="flex justify-center gap-6 mt-2">
          <a
            href="https://www.linkedin.com/in/kushichowdary/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-magenta-300 transform hover:scale-110 transition-all duration-500"
          >
            <Icon type="brands" name="linkedin" className="text-lg" />
          </a>
          <a
            href="https://github.com/kushichowdary"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-magenta-300 transform hover:scale-110 transition-all duration-500"
          >
            <Icon type="brands" name="github" className="text-lg" />
          </a>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center text-white/70 hover:text-magenta-300 transition-all duration-500 hover:shadow-[0_0_15px_rgba(255,0,200,0.4)] px-4 py-2.5 rounded-lg ${
            isExpanded ? 'justify-start' : ''
          }`}
          style={{
            background: 'rgba(255,255,255,0.03)',
          }}
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