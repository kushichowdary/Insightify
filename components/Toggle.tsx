
import React from 'react';

interface ToggleProps {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ label, enabled, onToggle, disabled = false }) => (
    <label className={`flex items-center justify-between ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
        <span className="text-light-text dark:text-dark-text">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={enabled} onChange={onToggle} disabled={disabled} />
            <div className={`block w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-6' : ''}`}></div>
        </div>
    </label>
);

export default Toggle;