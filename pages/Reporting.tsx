
import React from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';

interface ReportingProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Reporting: React.FC<ReportingProps> = ({ addAlert }) => {
    const mockReports = [
        { id: 1, name: "Q2 2024 Electronics Market Analysis", date: "2024-07-15", type: "PDF", size: "2.5MB" },
        { id: 2, name: "Competitor Benchmark - Phones", date: "2024-07-12", type: "CSV", size: "800KB" },
        { id: 3, name: "Monthly Sentiment Trend - June", date: "2024-07-01", type: "PDF", size: "1.2MB" },
        { id: 4, name: "Top 10 Laptops Customer Feedback", date: "2024-06-28", type: "PDF", size: "3.1MB" },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Generated Reports</h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">View and download your generated analysis reports.</p>
                    </div>
                    <button className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center gap-2 self-start md:self-center">
                        <Icon name="plus" /> Generate New Report
                    </button>
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
                                <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">Size</th>
                                <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockReports.map(report => (
                                <tr key={report.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium text-light-text dark:text-dark-text">{report.name}</td>
                                    <td className="p-3 text-light-text-secondary dark:text-dark-text-secondary">{report.date}</td>
                                    <td className="p-3 text-light-text-secondary dark:text-dark-text-secondary">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            report.type === 'PDF' ? 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300' : 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300'
                                        }`}>{report.type}</span>
                                    </td>
                                    <td className="p-3 text-light-text-secondary dark:text-dark-text-secondary">{report.size}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 w-9 h-9 text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-white/10 hover:text-light-text dark:hover:text-white rounded-md transition-colors"><Icon name="download"/></button>
                                            <button className="p-2 w-9 h-9 text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-white/10 hover:text-light-text dark:hover:text-white rounded-md transition-colors"><Icon name="trash"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Reporting;