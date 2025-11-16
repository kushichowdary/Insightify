
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import ThemeSwitch from '../components/ThemeSwitch';
import { Theme, AccentColor } from '../types';

const accentColors: AccentColor[] = [
  { name: 'Default Blue', main: '#3b82f6', hover: '#60a5fa', glow: 'rgba(59, 130, 246, 0.4)' },
  { name: 'Cyber Magenta', main: '#f038d1', hover: '#f76de0', glow: 'rgba(240, 56, 209, 0.4)' },
  { name: 'Emerald Green', main: '#10b981', hover: '#34d399', glow: 'rgba(16, 185, 129, 0.4)' },
  { name: 'Amber Orange', main: '#f59e0b', hover: '#fbbf24', glow: 'rgba(245, 158, 11, 0.4)' },
  { name: 'Violet Purple', main: '#8b5cf6', hover: '#a78bfa', glow: 'rgba(139, 92, 246, 0.4)' },
];

interface AppSettingsProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
  theme: Theme;
  onToggleTheme: () => void;
  accentColor: AccentColor | null;
  setAccentColor: (color: AccentColor | null) => void;
}

const AppSettings: React.FC<AppSettingsProps> = ({ addAlert, theme, onToggleTheme, accentColor, setAccentColor }) => {
    const commonLabelClasses = "text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary";
    const commonSelectClasses = "mt-1 w-full p-2.5 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-background dark:bg-black/20 text-light-text dark:text-white";

    const [models, setModels] = useState({ pro: 'gemini-2.5-pro', flash: 'gemini-2.5-flash' });
    
    useEffect(() => {
        const savedModels = localStorage.getItem('defaultModels');
        if (savedModels) {
            try {
                const parsed = JSON.parse(savedModels);
                if(parsed.pro && parsed.flash) setModels(parsed);
            } catch(e) { console.error(e); }
        }
    }, []);

    const handleAccentChange = (color: AccentColor) => {
        setAccentColor(color);
        localStorage.setItem('accentColor', JSON.stringify(color));
        addAlert(`Accent color set to ${color.name}!`, 'success');
    };

    const resetAccentColor = () => {
        setAccentColor(null);
        localStorage.removeItem('accentColor');
        addAlert('Accent color reset to theme default.', 'info');
    };

    const handleModelChange = (type: 'pro' | 'flash', value: string) => {
        const newModels = { ...models, [type]: value };
        setModels(newModels);
        localStorage.setItem('defaultModels', JSON.stringify(newModels));
        addAlert('Default model settings updated!', 'success');
    };

    const handleClearCache = () => {
        localStorage.removeItem('defaultModels');
        localStorage.removeItem('accentColor');
        addAlert('Local application cache cleared!', 'info');
        window.location.reload(); 
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Application Settings</h2>
            
            <Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Appearance</h3>
                <div className="space-y-6">
                    <div>
                        <label className={commonLabelClasses}>Theme</label>
                        <div className="mt-2">
                             <ThemeSwitch theme={theme} onToggle={onToggleTheme} />
                        </div>
                    </div>
                     <div>
                        <label className={commonLabelClasses}>Accent Color</label>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            {accentColors.map(color => (
                                <button
                                    key={color.name}
                                    title={color.name}
                                    onClick={() => handleAccentChange(color)}
                                    className={`w-8 h-8 rounded-full transition-all duration-200 ring-offset-2 dark:ring-offset-slate-800 ring-2 ${accentColor?.main === color.main ? 'ring-slate-900 dark:ring-white scale-110' : 'ring-transparent hover:scale-110'}`}
                                    style={{ backgroundColor: color.main }}
                                >
                                    {accentColor?.main === color.main && <Icon name="check" className="text-white text-sm" />}
                                </button>
                            ))}
                            <button
                                onClick={resetAccentColor}
                                className="text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-primary underline transition-colors ml-2"
                            >
                                Reset to Default
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Model Configuration</h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">Select the default models for different analysis tasks.</p>
                <div className="space-y-4">
                    <div>
                        <label className={commonLabelClasses}>URL & Competitive Analysis Model</label>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Recommended: Gemini 2.5 Pro for higher quality analysis.</p>
                        <select 
                            value={models.pro} 
                            onChange={(e) => handleModelChange('pro', e.target.value)}
                            className={commonSelectClasses}
                        >
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        </select>
                    </div>
                    <div>
                        <label className={commonLabelClasses}>File & Single Review Model</label>
                         <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">Recommended: Gemini 2.5 Flash for faster processing.</p>
                        <select
                            value={models.flash}
                            onChange={(e) => handleModelChange('flash', e.target.value)}
                            className={commonSelectClasses}
                        >
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Data & Cache</h3>
                <div className="space-y-4">
                    <div>
                        <label className={commonLabelClasses}>Clear Local Settings</label>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">This will reset your model and appearance preferences to their defaults. Your theme preference will be kept.</p>
                        <button 
                            onClick={handleClearCache}
                            className="px-4 py-2 bg-brand-error/20 text-brand-error font-semibold rounded-lg hover:bg-brand-error/30 transition-colors flex items-center gap-2"
                        >
                            <Icon name="trash-alt" /> Clear and Reload
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AppSettings;