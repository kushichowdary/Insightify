
import React, { useState } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import { compareProducts } from '../services/geminiService';
import { CompetitiveAnalysisResult, ProductAnalysisResult, Sentiment } from '../types';

const ProductResultCard: React.FC<{ result: ProductAnalysisResult }> = ({ result }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text">{result.productName}</h3>
            <div className="flex items-center gap-4 text-light-text-secondary dark:text-dark-text-secondary">
                <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400"><Icon name="star" /> <span className="font-semibold text-light-text dark:text-dark-text">{result.overallRating}/5</span></div>
                <div className="flex items-center gap-1"><Icon name="comments" /> {result.reviewCount.toLocaleString()} reviews</div>
            </div>
            <div className="flex justify-around text-center p-2 bg-slate-100 dark:bg-black/30 border border-light-border dark:border-dark-border rounded-lg">
                <div><p className="font-bold text-green-600 dark:text-green-400">{result.sentiment.positive}%</p><p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Positive</p></div>
                <div><p className="font-bold text-red-600 dark:text-red-400">{result.sentiment.negative}%</p><p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Negative</p></div>
                <div><p className="font-bold text-yellow-600 dark:text-yellow-400">{result.sentiment.neutral}%</p><p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Neutral</p></div>
            </div>
             <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2 text-sm">Top Positive Keywords</h4>
                <div className="flex flex-wrap gap-2">
                    {result.topPositiveKeywords.slice(0, 3).map(kw => <span key={kw} className="bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2 text-sm">Top Negative Keywords</h4>
                <div className="flex flex-wrap gap-2">
                    {result.topNegativeKeywords.slice(0, 3).map(kw => <span key={kw} className="bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
                </div>
            </div>
        </div>
    )
};

const CompetitiveAnalysis: React.FC<{ addAlert: (message: string, type: 'success' | 'error' | 'info') => void }> = ({ addAlert }) => {
    const [url1, setUrl1] = useState('');
    const [url2, setUrl2] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<CompetitiveAnalysisResult | null>(null);

    const handleAnalyze = async () => {
        if (!url1.trim() || !url1.startsWith('http') || !url2.trim() || !url2.startsWith('http')) {
            addAlert('Please enter two valid product URLs.', 'error');
            return;
        }
        setIsLoading(true);
        setResults(null);
        try {
            const data = await compareProducts(url1, url2);
            setResults(data);
            addAlert('Competitive analysis completed successfully!', 'success');
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during competitive analysis.";
            addAlert(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {isLoading && <Loader message="Performing competitive analysis... This might take some time." />}
            <Card>
                <h3 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text">Competitor Analysis</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Enter two product URLs to compare their customer sentiment and key features side-by-side.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="url" value={url1} onChange={(e) => setUrl1(e.target.value)} placeholder="Product URL 1" className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-background dark:bg-black/20 text-light-text dark:text-white placeholder-gray-500" />
                    <input type="url" value={url2} onChange={(e) => setUrl2(e.target.value)} placeholder="Product URL 2" className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-background dark:bg-black/20 text-light-text dark:text-white placeholder-gray-500" />
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="w-full px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-slate-500 dark:disabled:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Icon name="balance-scale" /> Compare Products
                </button>
            </Card>

            {results && (
                <div className="animate-fade-in-up space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card><ProductResultCard result={results.productOne} /></Card>
                        <Card><ProductResultCard result={results.productTwo} /></Card>
                    </div>
                    <Card>
                        <h3 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text">
                            <Icon name="info-circle" className="mr-2" />
                            Comparative Summary
                        </h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{results.comparisonSummary}</p>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CompetitiveAnalysis;
