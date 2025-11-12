
import React, { useState } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Toggle from '../components/Toggle';

interface SettingsProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Settings: React.FC<SettingsProps> = ({ addAlert }) => {
    const commonInputClasses = "mt-1 w-full p-2.5 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-background dark:bg-black/20 text-light-text dark:text-white placeholder-gray-500";
    const commonLabelClasses = "text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary";
    
    const [notifications, setNotifications] = useState({ email: true, inApp: true });

    const handleSubmit = (e: React.FormEvent, type: string) => {
        e.preventDefault();
        addAlert(`${type} updated successfully!`, 'success');
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Profile Information</h3>
                <form onSubmit={(e) => handleSubmit(e, 'Profile')} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={commonLabelClasses}>Full Name</label>
                            <input type="text" defaultValue="Analyst User" className={commonInputClasses} />
                        </div>
                        <div>
                            <label className={commonLabelClasses}>Email Address</label>
                            <input type="email" defaultValue="analyst@company.com" disabled className={`${commonInputClasses} bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed`} />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors">Save Changes</button>
                    </div>
                </form>
            </Card>

             <Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Change Password</h3>
                <form onSubmit={(e) => handleSubmit(e, 'Password')} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={commonLabelClasses}>New Password</label>
                            <input type="password" placeholder="••••••••" className={commonInputClasses} />
                        </div>
                        <div>
                            <label className={commonLabelClasses}>Confirm New Password</label>
                            <input type="password" placeholder="••••••••" className={commonInputClasses} />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors">Update Password</button>
                    </div>
                </form>
            </Card>
            
            <Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Notifications</h3>
                 <div className="space-y-4 max-w-sm">
                    <Toggle 
                      label="Email Notifications" 
                      enabled={notifications.email} 
                      onToggle={() => setNotifications(n => ({...n, email: !n.email}))} 
                    />
                    <Toggle 
                      label="In-App Notifications" 
                      enabled={notifications.inApp} 
                      onToggle={() => setNotifications(n => ({...n, inApp: !n.inApp}))} 
                    />
                </div>
            </Card>
        </div>
    );
};

export default Settings;