
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Toggle from '../components/Toggle';
import { useUser } from '../contexts/UserContext';
import { auth } from '../firebase';

interface SettingsProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Settings: React.FC<SettingsProps> = ({ addAlert }) => {
    const { profile, updateProfile } = useUser();
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };
    const commonInputClasses = "mt-1 w-full p-2.5 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-background dark:bg-black/20 text-light-text dark:text-white placeholder-gray-500";
    const commonLabelClasses = "text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary";
    
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setAvatar(profile.avatar || '');
            setNotificationsEnabled(profile.notificationsEnabled !== false);
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({ 
                name, 
                avatar, 
                notificationsEnabled 
            });
            addAlert(`Profile updated successfully!`, 'success');
        } catch (error: any) {
            addAlert(error.message || 'Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.email) return;
        try {
            await auth.sendPasswordResetEmail(profile.email);
            addAlert('Password reset email sent!', 'success');
        } catch (error: any) {
            addAlert(error.message || 'Failed to send reset email', 'error');
        }
    }

    return (
        <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            className="space-y-8 max-w-4xl mx-auto"
        >
            <motion.div variants={itemVariants}>
            <Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Profile Information</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={commonLabelClasses}>Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={commonInputClasses} placeholder="Your Name" />
                        </div>
                        <div>
                            <label className={commonLabelClasses}>Email Address</label>
                            <input type="email" value={profile?.email || ''} disabled className={`${commonInputClasses} bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed`} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={commonLabelClasses}>Avatar URL</label>
                            <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} className={commonInputClasses} placeholder="https://example.com/avatar.png" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary-hover shadow-glow-primary/20 transition-all disabled:opacity-50">
                            {isSaving ? 'Saving...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
            <Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Security</h3>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Need to change your password? We will send a secure reset link to your email.</p>
                    <button onClick={handlePasswordReset} className="px-6 py-2 bg-brand-primary/10 text-brand-primary font-bold rounded-xl hover:bg-brand-primary/20 transition-all border border-brand-primary/20">
                        Send Reset Email
                    </button>
                </div>
            </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
            <Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Global Notifications</h3>
                 <div className="space-y-4 max-w-sm">
                    <Toggle 
                      label="In-App Intelligence Alerts" 
                      enabled={notificationsEnabled} 
                      onToggle={() => setNotificationsEnabled(!notificationsEnabled)} 
                    />
                </div>
            </Card>
            </motion.div>
        </motion.div>
    );
};

export default Settings;