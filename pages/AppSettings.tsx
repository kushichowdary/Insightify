
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import ThemeSwitch from '../components/ThemeSwitch';
import { Theme } from '../types';

interface AppSettingsProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const colorOptions = [
    { name: 'Magenta', main: '#f038d1', hover: '#f76de0' },
    { name: 'Blue', main: '#3b82f6', hover: '#60a5fa' },
    { name: 'Green', main: '#22c55e', hover: '#4ade80' },
    { name: 'Orange', main: '#f97316', hover: '#fb923c' },
];

const AppSettings: React.FC<AppSettingsProps> = ({ addAlert, theme, onToggleTheme }) => {
    const commonLabelClasses = "text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary";
    const commonSelectClasses = "mt-1 w-full p-2.5 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-background dark:bg-black/20 text-light-text dark:text-white";

    const [models, setModels] = useState({ pro: 'gemini-2.5-pro', flash: 'gemini-2.5-flash' });
    const [activeColor, setActiveColor] = useState('#f038d1');
    
    useEffect(() => {
        const savedModels = localStorage.getItem('defaultModels');
        if (savedModels) {
            setModels(JSON.parse(savedModels));
        }
        const savedColor = localStorage.getItem('brandColor');
        if (savedColor) {
            setActiveColor(savedColor);
        }
    }, []);

    const handleModelChange = (type: 'pro' | 'flash', value: string) => {
        const newModels = { ...models, [type]: value };
        setModels(newModels);
        localStorage.setItem('defaultModels', JSON.stringify(newModels));
        addAlert('Default model settings updated!', 'success');
    };
    
    const handleColorChange = (color: { main: string, hover: string }) => {
        document.documentElement.style.setProperty('--color-brand-primary', color.main);
        document.documentElement.style.setProperty('--color-brand-primary-hover', color.hover);
        localStorage.setItem('brandColor', color.main);
        localStorage.setItem('brandColorHover', color.hover);
        setActiveColor(color.main);
        addAlert('Accent color updated!', 'success');
    };

    const handleClearCache = () => {
        // A more robust implementation would selectively clear app-specific keys
        localStorage.removeItem('defaultModels');
        localStorage.removeItem('brandColor');
        localStorage.removeItem('brandColorHover');
        // We keep theme as it's a very common preference
        addAlert('Local application cache cleared!', 'info');
        window.location.reload(); // Reload to apply default settings
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
                        <div className="flex items-center gap-3 mt-2">
                            {colorOptions.map(color => (
                                <button
                                    key={color.name}
                                    onClick={() => handleColorChange(color)}
                                    className={`w-8 h-8 rounded-full transition-all ring-2 ${activeColor === color.main ? 'ring-offset-2 dark:ring-offset-dark-background ring-brand-primary scale-110' : 'ring-transparent hover:scale-110'}`}
                                    style={{ backgroundColor: color.main }}
                                    aria-label={`Set accent color to ${color.name}`}
                                />
                            ))}
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
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">This will reset accent color and model preferences to their defaults. Your theme preference will be kept.</p>
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