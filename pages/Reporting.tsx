
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { useData } from '../contexts/DataContext';
import { AnalysisRecord, ProductAnalysisResult, FileAnalysisResult, CompetitiveAnalysisResult } from '../types';

interface ReportingProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ReportDrawer: React.FC<{ selectedReport: AnalysisRecord | null, setSelectedReport: (val: AnalysisRecord | null) => void, downloadJSON: (record: any) => void }> = ({ selectedReport, setSelectedReport, downloadJSON }) => {
    if (!selectedReport) return null;

    const renderDetails = () => {
        switch(selectedReport.type) {
            case 'url': {
                const ud = selectedReport.data as ProductAnalysisResult;
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-light-border dark:border-dark-border text-center">
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase">Rating</p>
                                <p className="text-xl font-bold text-brand-primary">{ud.overallRating} / 5</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-light-border dark:border-dark-border text-center">
                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase">Verdict</p>
                                <p className="text-sm font-bold text-brand-primary">{ud.verdict}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Sentiment Summary</h4>
                            <div className="flex h-4 rounded-full overflow-hidden mb-2">
                                <div className="bg-green-500" style={{ width: `${ud.sentiment?.positive || 0}%` }}></div>
                                <div className="bg-slate-400" style={{ width: `${ud.sentiment?.neutral || 0}%` }}></div>
                                <div className="bg-red-500" style={{ width: `${ud.sentiment?.negative || 0}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-light-text-secondary dark:text-dark-text-secondary">
                                <span>Pos: {ud.sentiment?.positive || 0}%</span>
                                <span>Neu: {ud.sentiment?.neutral || 0}%</span>
                                <span>Neg: {ud.sentiment?.negative || 0}%</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-2">AI Summary</h4>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary italic leading-relaxed">
                                "{ud.summary}"
                            </p>
                        </div>
                    </div>
                );
            }
            case 'file': {
                const fd = selectedReport.data as FileAnalysisResult;
                return (
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-light-border dark:border-dark-border text-center">
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase">Total Reviews Processed</p>
                            <p className="text-xl font-bold text-brand-primary">{(fd.totalReviews || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Sentiment Distribution</h4>
                            <div className="flex h-4 rounded-full overflow-hidden mb-2">
                                <div className="bg-green-500" style={{ width: `${fd.sentimentDistribution?.positive || 0}%` }}></div>
                                <div className="bg-slate-400" style={{ width: `${fd.sentimentDistribution?.neutral || 0}%` }}></div>
                                <div className="bg-red-500" style={{ width: `${fd.sentimentDistribution?.negative || 0}%` }}></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-green-500 mb-1">Pos. Keywords</h4>
                                <ul className="text-xs space-y-1">
                                    {(fd.topKeywords?.positive || []).slice(0, 5).map((k, i) => <li key={i}>• {k}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-red-500 mb-1">Neg. Keywords</h4>
                                <ul className="text-xs space-y-1">
                                    {(fd.topKeywords?.negative || []).slice(0, 5).map((k, i) => <li key={i}>• {k}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            }
            case 'competitive': {
                const cd = selectedReport.data as CompetitiveAnalysisResult;
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                                <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">{cd.productOne?.productName || 'Product 1'}</p>
                                <p className="text-lg font-bold text-light-text dark:text-white">{cd.productOne?.sentiment?.positive || 0}% Pos</p>
                            </div>
                            <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                                <p className="text-[10px] uppercase font-bold text-purple-500 mb-1">{cd.productTwo?.productName || 'Product 2'}</p>
                                <p className="text-lg font-bold text-light-text dark:text-white">{cd.productTwo?.sentiment?.positive || 0}% Pos</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-light-border dark:border-dark-border">
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Icon name="balance-scale" className="text-brand-primary" />
                                Comparison Summary
                            </h4>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                                {cd.comparisonSummary}
                            </p>
                        </div>
                    </div>
                );
            }
            default:
                return <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary italic">Full visualization for this type is coming soon in the next update.</p>;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="w-full max-w-lg relative"
            >
            <Card className="w-full h-full border-brand-primary/20 shadow-glow-primary/20">
                <button 
                    onClick={() => setSelectedReport(null)}
                    className="absolute right-4 top-4 text-light-text-secondary hover:text-brand-primary p-2 transition-colors"
                >
                    <Icon name="times" />
                </button>
                <div className="mb-6">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary uppercase font-bold mb-2 inline-block tracking-tight">
                        {selectedReport.type} Report
                    </span>
                    <h3 className="text-xl font-bold text-light-text dark:text-white leading-tight">
                        {selectedReport.title}
                    </h3>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        Analyzed on {new Date(selectedReport.date).toLocaleString()}
                    </p>
                </div>

                {renderDetails()}

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={() => downloadJSON(selectedReport)}
                        className="flex-1 py-2.5 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-hover transition-all flex items-center justify-center gap-2"
                    >
                        <Icon name="download" /> Download Analysis
                    </button>
                    <button 
                        onClick={() => setSelectedReport(null)}
                        className="flex-1 py-2.5 bg-slate-200 dark:bg-white/10 text-light-text dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-white/20 transition-all font-mono"
                    >
                        CLOSE_SHEET
                    </button>
                </div>
            </Card>
            </motion.div>
        </motion.div>
    );
};

const Reporting: React.FC<ReportingProps> = ({ addAlert }) => {
    const { records, deleteRecord } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState<AnalysisRecord | null>(null);

    const filteredRecords = records.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadJSON = (record: any) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `sentilytics_report_${record.id}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        addAlert("Report downloaded successfully!", "success");
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-10 max-w-6xl mx-auto">
            <AnimatePresence>
                {selectedReport && <ReportDrawer selectedReport={selectedReport} setSelectedReport={setSelectedReport} downloadJSON={downloadJSON} />}
            </AnimatePresence>
            
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                   <h2 className="text-2xl font-bold tracking-tight text-light-text dark:text-white flex items-center gap-3">
                       <Icon name="file-invoice" className="text-brand-primary" />
                       Reporting Center
                   </h2>
                   <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-xl text-sm italic">
                       Access all your historical sentiment data and AI-generated insights here. Download records for offline integration or compliance audits.
                   </p>
                </div>
                <div className="relative w-full md:w-80 shadow-glow-primary/5">
                    <Icon name="search" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Filter reports by name or type..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-light-surface dark:bg-black/40 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-primary focus:outline-none text-light-text dark:text-white placeholder-gray-500 transition-all duration-300"
                    />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                {filteredRecords.length > 0 ? filteredRecords.map((report, idx) => (
                    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} key={report.id}>
                    <Card className="hover:border-brand-primary/30 transition-all duration-500 group relative overflow-hidden bg-gradient-to-r from-transparent to-transparent hover:to-brand-primary/[0.02]">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-500 ${
                                    report.type === 'url' ? 'bg-blue-500/10 text-blue-500 shadow-blue-500/10' : 
                                    report.type === 'file' ? 'bg-purple-500/10 text-purple-500 shadow-purple-500/10' :
                                    'bg-orange-500/10 text-orange-500 shadow-orange-500/10'
                                } shadow-inner border border-white/10`}>
                                    <Icon name={report.type === 'url' ? 'link' : report.type === 'file' ? 'upload' : 'balance-scale'} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-light-text dark:text-white group-hover:text-brand-primary transition-colors">{report.title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-1 font-mono">
                                            <Icon name="calendar-alt" className="text-[8px]" />
                                            {new Date(report.date).toLocaleDateString()}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tight ${
                                            report.type === 'url' ? 'bg-blue-500/10 text-blue-500' : 
                                            report.type === 'file' ? 'bg-purple-500/10 text-purple-500' :
                                            'bg-orange-500/10 text-orange-500'
                                        }`}>
                                            {report.type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setSelectedReport(report)}
                                    className="px-4 py-2 text-sm font-semibold bg-light-background dark:bg-white/5 border border-light-border dark:border-dark-border rounded-lg hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-2 shadow-inner"
                                >
                                    <Icon name="eye" /> VIEW_DATA
                                </button>
                                <button 
                                    onClick={() => downloadJSON(report)}
                                    className="p-2.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-primary bg-light-background dark:bg-white/5 border border-light-border dark:border-dark-border rounded-lg transition-all"
                                    title="Download JSON"
                                >
                                    <Icon name="download" />
                                </button>
                                <button 
                                    onClick={() => {
                                        if(window.confirm('Delete this report record permanently?')) {
                                            deleteRecord(report.id);
                                            addAlert('Report record purged.', 'info');
                                        }
                                    }}
                                    className="p-2.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 bg-light-background dark:bg-white/5 border border-light-border dark:border-dark-border rounded-lg transition-all"
                                    title="Purge Record"
                                >
                                    <Icon name="trash" />
                                </button>
                            </div>
                        </div>
                        {idx === 0 && (
                             <div className="absolute top-0 right-0 h-full w-1.5 bg-brand-primary shadow-glow-primary"></div>
                        )}
                    </Card>
                    </motion.div>
                )) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="flex flex-col items-center justify-center p-20 text-center border-dashed">
                        <Icon name="folder-open" className="text-6xl text-brand-primary/20 mb-4" />
                        <h4 className="text-lg font-bold text-light-text dark:text-white">Empty Signal History</h4>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-xs mt-1">
                            No analysis reports synchronized. Initiate a scan in URL or File analysis to generate reports.
                        </p>
                    </Card>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Reporting;

