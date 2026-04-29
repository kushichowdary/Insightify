
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import { analyzeReviewFile } from '../services/geminiService';
import { FileAnalysisResult } from '../types';
import { useData } from '../contexts/DataContext';
import { useUser } from '../contexts/UserContext';
import AspectChart from '../components/AspectChart';
import WordCloud from '../components/WordCloud';
import FakeReviewGauge from '../components/FakeReviewGauge';

const FileUpload: React.FC<{ addAlert: (message: string, type: 'success' | 'error' | 'info') => void }> = ({ addAlert }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [results, setResults] = useState<FileAnalysisResult | null>(null);
  const { addRecord } = useData();
  const { addNotification } = useUser();

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      const allowedExtensions = /\.(csv|xlsx|xls|txt)$/i;

      if (!selectedFile.name.match(allowedExtensions)) {
        addAlert('Invalid file type. Please upload a CSV, Excel, or TXT file.', 'error');
        return;
      }
      setFile(selectedFile);
      setResults(null);
    }
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, over: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(over);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      addAlert('Please select a file to analyze.', 'error');
      return;
    }
    setIsLoading(true);
    setResults(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        if (!text) {
            addAlert('Could not read file content.', 'error');
            setIsLoading(false);
            return;
        }
        try {
            // Only send the first 50000 characters to avoid overly long prompts
            const data = await analyzeReviewFile(text.substring(0, 50000)); 
            setResults(data);
            addAlert('File analysis completed successfully!', 'success');
            
            // Save to history
            addRecord({
              id: Date.now().toString(),
              type: 'file',
              date: new Date().toISOString(),
              timestamp: Date.now(),
              title: `File: ${file.name}`,
              data: data
            });

            // Trigger Notification
            addNotification({
                title: 'Bulk Processing Done',
                message: `Analyzed ${data.totalReviews} reviews from ${file.name}.`,
                type: 'success'
            });

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addAlert(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    reader.onerror = () => {
        addAlert('Failed to read the file.', 'error');
        setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const sentimentData = results ? [
    { name: 'Positive', value: results.sentimentDistribution?.positive || 0, fill: '#10B981' },
    { name: 'Negative', value: results.sentimentDistribution?.negative || 0, fill: '#EF4444' },
    { name: 'Neutral', value: results.sentimentDistribution?.neutral || 0, fill: '#F59E0B' },
  ] : [];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-6xl mx-auto">
      <AnimatePresence>
        {isLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Loader message="Processing file... This might take a while for large files." /></motion.div>}
      </AnimatePresence>
      <motion.div variants={itemVariants}>
      <Card>
        <h3 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text">Upload Review Dataset</h3>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Upload a CSV, Excel, or TXT file containing product reviews for bulk analysis.</p>
        <div 
          onDragOver={(e) => handleDragEvents(e, true)}
          onDragLeave={(e) => handleDragEvents(e, false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragOver ? 'border-brand-primary bg-magenta-500/10' : 'border-light-border dark:border-dark-border'}`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Icon name="cloud-upload-alt" className="text-4xl text-brand-primary mb-4" />
          <p className="text-light-text dark:text-dark-text font-semibold">
            {file ? `Selected: ${file.name}` : 'Drag & drop your file here, or click to select'}
          </p>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Supported formats: .csv, .xlsx, .xls, .txt</p>
          <input 
            id="file-input" 
            type="file" 
            className="hidden" 
            accept=".csv,.xlsx,.xls,.txt"
            onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
          />
        </div>
        {file && (
             <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="mt-4 w-full px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-slate-500 dark:disabled:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
                <Icon name="cogs" /> Analyze File
            </button>
        )}
      </Card>
      </motion.div>
      
      <AnimatePresence>
      {results && (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }}
            className="space-y-6"
        >
            <motion.div variants={itemVariants}><Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Analysis Summary</h3>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center md:w-1/3 shrink-0">
                        <p className="text-4xl font-bold text-brand-primary" style={{ textShadow: '0 0 10px rgba(240, 56, 209, 0.5)' }}>{results.totalReviews.toLocaleString()}</p>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">Total Reviews Analyzed</p>
                    </div>
                    <div className="md:w-2/3 md:border-l md:border-light-border md:dark:border-dark-border md:pl-8">
                        <h4 className="font-semibold text-light-text dark:text-dark-text mb-2 flex items-center gap-2"><Icon name="file-alt" /> Dataset Insights</h4>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{results.datasetSummary}</p>
                    </div>
                </div>
            </Card></motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}><Card className="border-l-4 border-brand-primary">
                    <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                        <Icon name="chart-bar" /> Sentiment Distribution
                    </h3>
                     <div className="w-full h-80">
                        <ResponsiveContainer>
                            <BarChart data={sentimentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--light-border)" className="dark:stroke-dark-border" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--light-text-secondary)', fontSize: 12 }} className="dark:tick-fill-dark-text-secondary"/>
                                <YAxis unit="%" tick={{ fill: 'var(--light-text-secondary)', fontSize: 12 }} className="dark:tick-fill-dark-text-secondary"/>
                                <Tooltip cursor={{fill: 'rgba(100, 116, 139, 0.1)'}} contentStyle={{ backgroundColor: 'var(--light-surface)', color: 'var(--light-text)', border: '1px solid var(--light-border)' }} wrapperClassName="dark:!bg-dark-surface/80 dark:!text-dark-text dark:!border-dark-border" />
                                <Bar dataKey="value" name="Percentage" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card></motion.div>

                <motion.div variants={itemVariants}><Card className="border-l-4 border-indigo-500">
                    <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                        <Icon name="layer-group" /> Aggregate Aspects
                    </h3>
                    <AspectChart aspects={results.aspects} />
                </Card></motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                    <FakeReviewGauge probability={results.fakeReviewProbability} />
                    <Card className="border-l-4 border-amber-500">
                        <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                            <Icon name="cloud" /> Dataset Word Cloud
                        </h3>
                        <WordCloud words={results.wordCloud} />
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}><Card className="border-l-4 border-emerald-500">
                    <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                        <Icon name="key" /> Key Terms
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Positive</h4>
                            <div className="flex flex-wrap gap-2">
                                {(results.topKeywords?.positive || []).map(kw => <span key={kw} className="bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Negative</h4>
                            <div className="flex flex-wrap gap-2">
                                {(results.topKeywords?.negative || []).map(kw => <span key={kw} className="bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
                            </div>
                        </div>
                    </div>
                </Card></motion.div>
            </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FileUpload;