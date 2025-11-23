
import React, { useState } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { useData } from '../contexts/DataContext';

interface ReportingProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Reporting: React.FC<ReportingProps> = ({ addAlert }) => {
    const { records, deleteRecord } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRecords = records.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadJSON = (record: any) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record.data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `sentilytics_report_${record.id}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        addAlert("Report downloaded successfully!", "success");
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Generated Analysis Reports</h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">View, download, or manage your analysis history.</p>
                    </div>
                    <div className="relative">
                        <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                        <input 
                            type="text" 
                            placeholder="Filter reports..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-light-background dark:bg-black/20 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-light-text dark:text-white"
                        />
                    </div>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 dark:bg-black/30">
                            <tr>
                                <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">Report Name</th>
                                <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">Date</th>
                                <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">Type</th>
                                <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length > 0 ? filteredRecords.map(report => (
                                <tr key={report.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium text-light-text dark:text-dark-text">
                                        <div className="flex items-center gap-2">
                                            <Icon name="file-alt" className="text-brand-primary opacity-70" />
                                            {report.title}
                                        </div>
                                    </td>
                                    <td className="p-3 text-light-text-secondary dark:text-dark-text-secondary">{new Date(report.date).toLocaleDateString()} {new Date(report.date).toLocaleTimeString()}</td>
                                    <td className="p-3 text-light-text-secondary dark:text-dark-text-secondary">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase ${
                                            report.type === 'url' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300' : 
                                            report.type === 'file' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300' :
                                            report.type === 'competitive' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300' :
                                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                        }`}>
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => downloadJSON(report)}
                                                className="p-2 w-9 h-9 text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-white/10 hover:text-brand-primary rounded-md transition-colors"
                                                title="Download JSON"
                                            >
                                                <Icon name="download"/>
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm('Are you sure you want to delete this report?')) {
                                                        deleteRecord(report.id);
                                                        addAlert('Report deleted', 'info');
                                                    }
                                                }}
                                                className="p-2 w-9 h-9 text-light-text-secondary dark:text-dark-text-secondary hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                                                title="Delete"
                                            >
                                                <Icon name="trash"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-light-text-secondary dark:text-dark-text-secondary">
                                        No reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Reporting;
