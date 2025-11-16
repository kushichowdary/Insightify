
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import { analyzeProductUrl } from '../services/geminiService';
import { ProductAnalysisResult, Sentiment, Verdict } from '../types';

const COLORS = { Positive: '#10B981', Negative: '#EF4444', Neutral: '#F59E0B' };

const UrlAnalysis: React.FC<{ addAlert: (message: string, type: 'success' | 'error' | 'info') => void }> = ({ addAlert }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ProductAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim() || !url.startsWith('http')) {
      addAlert('Please enter a valid product URL.', 'error');
      return;
    }
    setIsLoading(true);
    setResults(null);
    try {
      const data = await analyzeProductUrl(url);
      setResults(data);
      addAlert('URL analysis completed successfully!', 'success');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addAlert(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCsv = () => {
    if (!results) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Value\r\n";
    csvContent += `Product Name,"${results.productName.replace(/"/g, '""')}"\r\n`;
    csvContent += `Overall Rating,${results.overallRating}/5\r\n`;
    csvContent += `Review Count,${results.reviewCount}\r\n`;
    csvContent += `Verdict,${results.verdict}\r\n\r\n`;
    csvContent += `Summary,"${results.summary.replace(/"/g, '""')}"\r\n\r\n`;
    
    csvContent += "Sentiment Analysis (%)\r\n";
    csvContent += `Positive,${results.sentiment.positive}\r\n`;
    csvContent += `Negative,${results.sentiment.negative}\r\n`;
    csvContent += `Neutral,${results.sentiment.neutral}\r\n\r\n`;

    csvContent += "Top Positive Keywords\r\n";
    csvContent += `"${results.topPositiveKeywords.join(',')}"\r\n\r\n`;
    csvContent += "Top Negative Keywords\r\n";
    csvContent += `"${results.topNegativeKeywords.join(',')}"\r\n\r\n`;

    csvContent += "Sample Reviews\r\n";
    csvContent += "Sentiment,Review Text\r\n";
    results.sampleReviews.forEach(review => {
        csvContent += `${review.sentiment},"${review.text.replace(/"/g, '""')}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sentilytics_${results.productName.replace(/\s+/g, '_')}_analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAlert('Results exported successfully!', 'success');
  }

  const sentimentData = results ? [
    { name: 'Positive', value: results.sentiment.positive },
    { name: 'Negative', value: results.sentiment.negative },
    { name: 'Neutral', value: results.sentiment.neutral },
  ] : [];

  const sentimentStyles: Record<Sentiment, { glow: string; icon: string; text: string; }> = {
    Positive: { glow: 'shadow-glow-green', icon: 'smile-beam', text: 'text-green-400' },
    Negative: { glow: 'shadow-glow-red', icon: 'frown', text: 'text-red-400' },
    Neutral: { glow: 'shadow-glow-yellow', icon: 'meh', text: 'text-yellow-400' },
  }
  
  const verdictStyles: Record<Verdict, { glow: string; icon: string; text: string; bg: string; border: string }> = {
    Recommended: { glow: 'shadow-glow-green', icon: 'thumbs-up', text: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    Consider: { glow: 'shadow-glow-yellow', icon: 'search', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    'Not Recommended': { glow: 'shadow-glow-red', icon: 'thumbs-down', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  }
  const currentVerdictStyle = results ? verdictStyles[results.verdict] : null;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {isLoading && <Loader message="Analyzing product URL... This may take a moment." />}
      
      <div className="text-center">
        <div className="inline-block p-4 bg-light-surface dark:bg-dark-surface rounded-full border border-light-border dark:border-dark-border mb-4 shadow-lg">
          <Icon name="link" className="text-3xl text-brand-primary" />
        </div>
        <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Product URL Analysis</h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-lg mx-auto mb-6">Enter a product URL from a major e-commerce site to have our AI analyze its reviews in real-time.</p>
        <div className="flex gap-2 max-w-xl mx-auto">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="https://www.amazon.com/product-name"
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
          <Card>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-24 h-24 bg-light-background dark:bg-black/30 border border-light-border dark:border-dark-border rounded-md flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary text-4xl flex-shrink-0">
                  <Icon name="image"/>
              </div>
              <div className="flex-grow">
                  <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">{results.productName}</h2>
                  <div className="flex items-center gap-4 mt-2 text-light-text-secondary dark:text-dark-text-secondary">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Icon name="star" /> 
                        <span className="font-semibold text-light-text dark:text-dark-text">{results.overallRating}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                          <Icon name="comments"/>
                          <span>{results.reviewCount.toLocaleString()} reviews</span>
                      </div>
                  </div>
                  <p className="text-sm mt-4 text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{results.summary}</p>
              </div>
              <button onClick={exportToCsv} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center gap-2 self-start sm:self-center shadow-lg hover:shadow-glow-magenta">
                <Icon name="download"/> Export CSV
              </button>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card className="flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Sentiment Overview</h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                                    {sentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />)}
                                </Pie>
                                <Legend wrapperStyle={{ fontSize: '14px' }} formatter={(value) => <span className="text-light-text-secondary dark:text-dark-text-secondary">{value}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                
                {currentVerdictStyle && (
                    <Card className={`flex flex-col items-center justify-center text-center ${currentVerdictStyle.bg} border ${currentVerdictStyle.border} ${currentVerdictStyle.glow}`}>
                        <h3 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text">Our Verdict</h3>
                        <Icon name={currentVerdictStyle.icon} className={`text-5xl mb-3 ${currentVerdictStyle.text}`} />
                        <p className={`text-xl font-bold ${currentVerdictStyle.text}`}>{results.verdict}</p>
                    </Card>
                )}

                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Top Keywords</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-green-500 dark:text-green-400 mb-2">Positive</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.topPositiveKeywords.map(kw => <span key={kw} className="border border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300 text-sm font-medium px-3 py-1 rounded-full transition-all hover:bg-green-500/20 hover:shadow-glow-green">{kw}</span>)}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-red-500 dark:text-red-400 mb-2">Negative</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.topNegativeKeywords.map(kw => <span key={kw} className="border border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300 text-sm font-medium px-3 py-1 rounded-full transition-all hover:bg-red-500/20 hover:shadow-glow-red">{kw}</span>)}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            
            <div className="lg:col-span-3">
                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Sample Reviews</h3>
                    <div className="space-y-4 max-h-[48rem] overflow-y-auto pr-2">
                    {results.sampleReviews.map((review, index) => (
                        <div key={index} className={`p-4 rounded-lg border border-light-border dark:border-dark-border bg-light-background dark:bg-black/30 relative overflow-hidden ${sentimentStyles[review.sentiment].glow}`}>
                            <Icon name={sentimentStyles[review.sentiment].icon} className={`absolute top-4 right-4 text-2xl opacity-10 ${sentimentStyles[review.sentiment].text}`} />
                            <p className="italic text-light-text dark:text-dark-text pr-8">"{review.text}"</p>
                            <p className={`text-right font-semibold mt-2 text-sm ${sentimentStyles[review.sentiment].text}`}>{review.sentiment}</p>
                        </div>
                    ))}
                    </div>
                </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlAnalysis;