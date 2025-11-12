
import React, { useState } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import { analyzeBrandReputation } from '../services/geminiService';
import { BrandReputationResult, Sentiment } from '../types';

const sentimentStyles: Record<Sentiment, { glow: string; icon: string; text: string; }> = {
    Positive: { glow: 'shadow-glow-green', icon: 'smile-beam', text: 'text-green-400' },
    Negative: { glow: 'shadow-glow-red', icon: 'frown', text: 'text-red-400' },
    Neutral: { glow: 'shadow-glow-yellow', icon: 'meh', text: 'text-yellow-400' },
};

const ThemedList: React.FC<{ title: string, items: string[], icon: string, colorClass: string }> = ({ title, items, icon, colorClass }) => (
    <div>
        <h4 className={`font-semibold ${colorClass} mb-2 flex items-center gap-2`}><Icon name={icon} /> {title}</h4>
        <ul className="space-y-1 list-disc list-inside text-light-text-secondary dark:text-dark-text-secondary text-sm">
            {items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
    </div>
);

const SwotCard: React.FC<{ swot: BrandReputationResult['swot'] }> = ({ swot }) => (
    <Card>
        <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">SWOT Analysis</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ThemedList title="Strengths" items={swot.strengths} icon="thumbs-up" colorClass="text-green-500 dark:text-green-400" />
            <ThemedList title="Weaknesses" items={swot.weaknesses} icon="thumbs-down" colorClass="text-red-500 dark:text-red-400" />
            <ThemedList title="Opportunities" items={swot.opportunities} icon="lightbulb" colorClass="text-blue-500 dark:text-blue-400" />
            <ThemedList title="Threats" items={swot.threats} icon="exclamation-triangle" colorClass="text-yellow-500 dark:text-yellow-400" />
        </div>
    </Card>
);

const BrandReputation: React.FC<{ addAlert: (message: string, type: 'success' | 'error' | 'info') => void }> = ({ addAlert }) => {
    const [brandName, setBrandName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<BrandReputationResult | null>(null);

    const handleAnalyze = async () => {
        if (!brandName.trim()) {
            addAlert('Please enter a brand name to analyze.', 'error');
            return;
        }
        setIsLoading(true);
        setResults(null);
        try {
            const data = await analyzeBrandReputation(brandName);
            setResults(data);
            addAlert('Brand reputation analysis completed!', 'success');
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? "Failed to analyze brand. The model may be busy." : "An unknown error occurred.";
            addAlert(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {isLoading && <Loader message={`Analyzing ${brandName}'s reputation... This may take a moment.`} />}
            
            <div className="text-center">
                <div className="inline-block p-4 bg-light-surface dark:bg-dark-surface rounded-full border border-light-border dark:border-dark-border mb-4 shadow-lg">
                    <Icon name="bullhorn" className="text-3xl text-brand-primary" />
                </div>
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Brand Reputation Analysis</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-lg mx-auto mb-6">Enter a brand to get a real-time analysis of its public reputation using Google Search.</p>
                <div className="flex gap-2 max-w-xl mx-auto">
                    <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                        placeholder="e.g., Apple, Nike, Tesla"
                        className="flex-grow p-3 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-surface/50 dark:bg-black/20 text-light-text dark:text-white placeholder-gray-500 transition-all"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-slate-500 dark:disabled:bg-slate-700 transition-all flex items-center gap-2 shadow-lg shadow-magenta-500/30 hover:shadow-glow-magenta"
                    >
                        <Icon name="search" /> Analyze
                    </button>
                </div>
            </div>

            {results && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className={`lg:col-span-1 text-center flex flex-col justify-center ${sentimentStyles[results.sentiment].glow}`}>
                             <Icon name={sentimentStyles[results.sentiment].icon} className={`text-5xl mb-3 ${sentimentStyles[results.sentiment].text}`} />
                             <p className="text-5xl font-bold text-light-text dark:text-dark-text">{results.overallScore}<span className="text-2xl text-light-text-secondary dark:text-dark-text-secondary">/10</span></p>
                             <p className={`text-lg font-semibold ${sentimentStyles[results.sentiment].text}`}>{results.sentiment} Reputation</p>
                        </Card>
                        <Card className="lg:col-span-2">
                             <h3 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text">Reputation Summary</h3>
                             <p className="text-light-text-secondary dark:text-dark-text-secondary">{results.summary}</p>
                        </Card>
                    </div>

                    <Card>
                        <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Key Discussion Themes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ThemedList title="Positive" items={results.keyThemes.positive} icon="plus-circle" colorClass="text-green-500 dark:text-green-400" />
                            <ThemedList title="Negative" items={results.keyThemes.negative} icon="minus-circle" colorClass="text-red-500 dark:text-red-400" />
                            <ThemedList title="Neutral" items={results.keyThemes.neutral} icon="info-circle" colorClass="text-yellow-500 dark:text-yellow-400" />
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                             <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Recent News & Mentions</h3>
                            <ul className="space-y-2 list-disc list-inside text-light-text-secondary dark:text-dark-text-secondary text-sm">
                                {results.recentNews.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </Card>
                        <SwotCard swot={results.swot} />
                    </div>

                    <Card>
                        <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Information Sources</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {results.sources.map((source, i) => (
                                <a href={source.uri} key={i} target="_blank" rel="noopener noreferrer" className="block p-3 border border-light-border dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <p className="font-semibold text-brand-primary text-sm truncate group-hover:underline">{source.title}</p>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">{source.uri}</p>
                                </a>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default BrandReputation;
