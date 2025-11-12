
import React, { useState } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { sampleDatasets, sampleUsers, Dataset, User } from '../types';

interface AdminProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-down">
      <div className="bg-light-surface dark:bg-slate-900/70 backdrop-blur-xl border border-light-border dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md m-4">
        <div className="p-4 border-b border-light-border dark:border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200"><Icon name="times" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Admin: React.FC<AdminProps> = ({ addAlert }) => {
  const [activeTab, setActiveTab] = useState('datasets');
  const [datasets, setDatasets] = useState<Dataset[]>(sampleDatasets);
  const [users, setUsers] = useState<User[]>(sampleUsers);

  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const commonInputClasses = "w-full p-2.5 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-background dark:bg-black/20 text-light-text dark:text-white placeholder-gray-500";
  const commonLabelClasses = "block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1";

  const handleAddDataset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDataset: Dataset = {
      id: Date.now(),
      name: formData.get('name') as string,
      reviewCount: parseInt(formData.get('reviews') as string, 10) || 0,
      lastUpdated: 'Just now',
    };
    setDatasets([newDataset, ...datasets]);
    setIsDatasetModalOpen(false);
    addAlert('New dataset added successfully!', 'success');
    e.currentTarget.reset();
  };

  const handleDeleteDataset = (id: number) => {
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      setDatasets(datasets.filter(d => d.id !== id));
      addAlert('Dataset deleted.', 'info');
    }
  };

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: Date.now(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as 'Admin' | 'Analyst',
      status: 'Active',
      preferences: { notifications: { email: true, inApp: true }}
    };
    setUsers([newUser, ...users]);
    setIsUserModalOpen(false);
    addAlert('New user added successfully!', 'success');
    e.currentTarget.reset();
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
      addAlert('User deleted.', 'info');
    }
  };

  const AdminTabButton: React.FC<{ tabId: string, label: string }> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 font-semibold rounded-lg transition-colors text-sm ${
        activeTab === tabId
          ? 'bg-brand-primary text-white shadow-lg shadow-magenta-500/30'
          : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Admin Panel</h3>
      <div className="flex items-center gap-2 p-1 bg-light-surface dark:bg-black/20 rounded-xl self-start border border-light-border dark:border-dark-border">
        <AdminTabButton tabId="datasets" label="Datasets" />
        <AdminTabButton tabId="models" label="Models" />
        <AdminTabButton tabId="users" label="Users" />
        <AdminTabButton tabId="settings" label="Settings" />
      </div>

      <Card>
        {activeTab === 'datasets' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">Dataset Management</h4>
                <button onClick={() => setIsDatasetModalOpen(true)} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center gap-2 text-sm">
                    <Icon name="plus"/> Add New
                </button>
            </div>
            <div className="space-y-3">
              {datasets.map(dataset => (
                  <div key={dataset.id} className="flex justify-between items-center p-3 border border-light-border dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div>
                      <h5 className="font-semibold text-light-text dark:text-dark-text">{dataset.name}</h5>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{dataset.reviewCount.toLocaleString()} reviews • Last updated: {dataset.lastUpdated}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDeleteDataset(dataset.id)} className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30">Delete</button>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">User Management</h4>
                <button onClick={() => setIsUserModalOpen(true)} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center gap-2 text-sm">
                    <Icon name="user-plus"/> Add New
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-black/30">
                        <tr>
                            <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">Name</th>
                            <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">Role</th>
                            <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">Status</th>
                            <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-3">
                                    <p className="font-medium text-light-text dark:text-dark-text">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </td>
                                <td className="p-3 text-light-text-secondary dark:text-dark-text-secondary">{user.role}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-gray-300'}`}>{user.status}</span>
                                </td>
                                <td className="p-3">
                                    <button onClick={() => handleDeleteUser(user.id)} className="px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}
        {activeTab === 'models' && (
          <div className="animate-fade-in">
            <h4 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">ML Model Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                <div className="p-4 bg-slate-100 dark:bg-black/30 border border-light-border dark:border-dark-border rounded-lg">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Accuracy</p>
                    <p className="text-2xl font-bold text-brand-primary">94.2%</p>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-black/30 border border-light-border dark:border-dark-border rounded-lg">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Precision</p>
                    <p className="text-2xl font-bold text-brand-primary">91.8%</p>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-black/30 border border-light-border dark:border-dark-border rounded-lg">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Recall</p>
                    <p className="text-2xl font-bold text-brand-primary">93.1%</p>
                </div>
                 <div className="p-4 bg-slate-100 dark:bg-black/30 border border-light-border dark:border-dark-border rounded-lg">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">F1-Score</p>
                    <p className="text-2xl font-bold text-brand-primary">92.4%</p>
                </div>
            </div>
             <button className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center gap-2">
                <Icon name="sync"/> Retrain Model
            </button>
          </div>
        )}
        {activeTab === 'settings' && (
            <div className="animate-fade-in max-w-md">
                 <h4 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">System Settings</h4>
                 <div className="space-y-4">
                    <div>
                        <label className={commonLabelClasses}>API Rate Limit</label>
                        <input type="number" defaultValue="1000" className={commonInputClasses}/>
                    </div>
                     <div>
                        <label className={commonLabelClasses}>Default Model</label>
                        <select className={commonInputClasses}>
                            <option>Gemini 2.5 Pro</option>
                            <option>Gemini 2.5 Flash</option>
                        </select>
                    </div>
                    <div className="pt-2">
                        <button className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors">
                            Save Settings
                        </button>
                    </div>
                 </div>
            </div>
        )}
      </Card>
      
      <Modal isOpen={isDatasetModalOpen} onClose={() => setIsDatasetModalOpen(false)} title="Add New Dataset">
        <form onSubmit={handleAddDataset} className="space-y-4">
          <div>
            <label className={commonLabelClasses}>Dataset Name</label>
            <input name="name" type="text" required className={commonInputClasses}/>
          </div>
          <div>
            <label className={commonLabelClasses}>Number of Reviews</label>
            <input name="reviews" type="number" required className={commonInputClasses}/>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsDatasetModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-gray-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover">Add Dataset</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Add New User">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className={commonLabelClasses}>Full Name</label>
            <input name="name" type="text" required className={commonInputClasses}/>
          </div>
          <div>
            <label className={commonLabelClasses}>Email</label>
            <input name="email" type="email" required className={commonInputClasses}/>
          </div>
          <div>
            <label className={commonLabelClasses}>Role</label>
            <select name="role" defaultValue="Analyst" required className={commonInputClasses}>
                <option value="Analyst">Analyst</option>
                <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-gray-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover">Add User</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Admin;