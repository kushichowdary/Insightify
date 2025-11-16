
import React, { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import { analyzeReviewFile } from '../services/geminiService';
import { FileAnalysisResult } from '../types';

const FileUpload: React.FC<{ addAlert: (message: string, type: 'success' | 'error' | 'info') => void }> = ({ addAlert }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [results, setResults] = useState<FileAnalysisResult | null>(null);

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
    { name: 'Positive', value: results.sentimentDistribution.positive, fill: '#10B981' },
    { name: 'Negative', value: results.sentimentDistribution.negative, fill: '#EF4444' },
    { name: 'Neutral', value: results.sentimentDistribution.neutral, fill: '#F59E0B' },
  ] : [];

  return (
    <div className="space-y-6">
      {isLoading && <Loader message="Processing file... This might take a while for large files." />}
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
      
      {results && (
        <div className="animate-fade-in-up space-y-6">
            <Card>
                <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Analysis Summary</h3>
                <div className="flex items-center justify-around text-center">
                    <div>
                        <p className="text-3xl font-bold text-brand-primary" style={{ textShadow: '0 0 10px rgba(240, 56, 209, 0.5)' }}>{results.totalReviews.toLocaleString()}</p>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">Total Reviews</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Sentiment Distribution</h3>
                     <div className="w-full h-80">
                        <ResponsiveContainer>
                            <BarChart data={sentimentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--light-border)" className="dark:stroke-dark-border" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--light-text-secondary)', fontSize: 12 }} className="dark:tick-fill-dark-text-secondary"/>
                                <YAxis unit="%" tick={{ fill: 'var(--light-text-secondary)', fontSize: 12 }} className="dark:tick-fill-dark-text-secondary"/>
                                <Tooltip cursor={{fill: 'rgba(100, 116, 139, 0.1)'}} contentStyle={{ backgroundColor: 'var(--light-surface)', color: 'var(--light-text)', border: '1px solid var(--light-border)' }} wrapperClassName="dark:!bg-dark-surface/80 dark:!text-dark-text dark:!border-dark-border" />
                                <Bar dataKey="value" name="Percentage" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Top Keywords</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Positive</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.topKeywords.positive.map(kw => <span key={kw} className="bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Negative</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.topKeywords.negative.map(kw => <span key={kw} className="bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
