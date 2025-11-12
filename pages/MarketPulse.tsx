import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import { getMarketPulse } from '../services/geminiService';
import { MarketPulseResult } from '../types';

const Gauge: React.FC<{ value: number; label: string; }> = ({ value, label }) => {
  const normalizedValue = Math.max(0, Math.min(100, value));
  const rotation = (normalizedValue / 100) * 180 - 90;

  const getGradientColor = (val: number) => {
    if (val < 40) return '#ef4444'; // red-500
    if (val < 70) return '#f59e0b'; // yellow-500
    return '#22c55e'; // green-500
  };

  return (
    <div className="relative w-48 h-24 mx-auto">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
        </defs>
        <path d="M 10 50 A 40 40 0 0 1 90 50" stroke="url(#gaugeGradient)" strokeWidth="10" fill="none" strokeLinecap="round" />
      </svg>
      <div
        className="absolute bottom-0 left-1/2 w-0.5 h-[45%] bg-light-text dark:bg-dark-text origin-bottom transition-transform duration-1000 ease-out"
        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
      />
       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-light-text dark:bg-dark-text rounded-full border-2 border-light-surface dark:border-dark-surface" />
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-center">
        <p className="text-2xl font-bold" style={{color: getGradientColor(value)}}>{value.toFixed(0)}%</p>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
      </div>
    </div>
  );
};

const TagCloud: React.FC<{ title: string; tags: string[]; colorClass: string; icon: string; }> = ({ title, tags, colorClass, icon }) => (
    <div>
        <h4 className={`font-semibold ${colorClass} mb-3 flex items-center gap-2`}><Icon name={icon}/> {title}</h4>
        <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
                <span key={i} className={`text-sm font-medium px-3 py-1 rounded-full border ${colorClass.replace('text-', 'border-').replace('-400', '-500/50')} ${colorClass.replace('text-', 'bg-').replace('-400', '-500/10')}`}>
                    {tag}
                </span>
            ))}
        </div>
    </div>
);


const MarketPulse: React.FC<{ addAlert: (message: string, type: 'success' | 'error' | 'info') => void }> = ({ addAlert }) => {
    const [category, setCategory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<MarketPulseResult | null>(null);

    const handleAnalyze = async () => {
        if (!category.trim()) {
            addAlert('Please enter a product category.', 'error');
            return;
        }
        setIsLoading(true);
        setResults(null);
        try {
            const data = await getMarketPulse(category);
            setResults(data);
            addAlert('Market pulse analysis complete!', 'success');
        } catch (error) {
            console.error(error);
            addAlert('Failed to perform market analysis. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {isLoading && <Loader message={`Analyzing market for ${category}...`} />}
            
            <div className="text-center">
                <div className="inline-block p-4 bg-light-surface dark:bg-dark-surface rounded-full border border-light-border dark:border-dark-border mb-4 shadow-lg">
                    <Icon name="globe-americas" className="text-3xl text-brand-primary" />
                </div>
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Market Pulse</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-lg mx-auto mb-6">Get a real-time pulse on any product category to identify trends, opportunities, and risks.</p>
                <div className="flex gap-2 max-w-xl mx-auto">
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                        placeholder="e.g., Robot Vacuums, Smart Watches"
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
                        <Card className="text-center flex flex-col justify-center py-8">
                           <Gauge value={results.marketSentiment} label="Market Sentiment"/>
                        </Card>
                        <Card className="text-center flex flex-col justify-center">
                           <p className="text-5xl font-bold text-brand-primary">{results.opportunityScore}<span className="text-2xl text-light-text-secondary dark:text-dark-text-secondary">/100</span></p>
                           <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary">Opportunity Score</p>
                        </Card>
                         <Card className="flex flex-col justify-center">
                             <h3 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text">Market Summary</h3>
                             <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{results.summary}</p>
                        </Card>
                    </div>

                    <Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <TagCloud title="Trending Features" tags={results.trendingFeatures} colorClass="text-green-500 dark:text-green-400" icon="thumbs-up" />
                            <TagCloud title="Consumer Pain Points" tags={results.consumerPainPoints} colorClass="text-red-500 dark:text-red-400" icon="thumbs-down"/>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       <Card>
                            <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Top Brands</h3>
                             <ul className="space-y-2">
                                {results.topBrands.map((brand, i) => (
                                    <li key={i} className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-black/30 border border-light-border dark:border-dark-border rounded-lg">
                                        <Icon name="crown" className="text-yellow-500" />
                                        <span className="font-semibold text-light-text dark:text-dark-text">{brand}</span>
                                    </li>
                                ))}
                            </ul>
                       </Card>
                       <Card>
                            <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Sources</h3>
                            <div className="space-y-2">
                                {results.sources.slice(0, 4).map((source, i) => (
                                    <a href={source.uri} key={i} target="_blank" rel="noopener noreferrer" className="block p-2 border border-light-border dark:border-dark-border rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <p className="font-semibold text-brand-primary text-sm truncate group-hover:underline">{source.title}</p>
                                    </a>
                                ))}
                            </div>
                       </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketPulse;
