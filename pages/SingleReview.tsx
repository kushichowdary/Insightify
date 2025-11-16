
import React, { useState } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import { analyzeSingleReview } from '../services/geminiService';
import { SingleReviewResult, Sentiment } from '../types';

const SingleReview: React.FC<{ addAlert: (message: string, type: 'success' | 'error' | 'info') => void }> = ({ addAlert }) => {
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SingleReviewResult | null>(null);

  const handleAnalyze = async () => {
    if (!reviewText.trim()) {
      addAlert('Please enter a review to analyze.', 'error');
      return;
    }
    setIsLoading(true);
    setResults(null);
    try {
      const data = await analyzeSingleReview(reviewText);
      setResults(data);
      addAlert('Review analysis completed!', 'success');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addAlert(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sentimentStyles: Record<Sentiment, { glow: string; iconBg: string; icon: string; text: string; }> = {
    Positive: {
      glow: 'shadow-glow-green',
      iconBg: 'bg-green-500',
      icon: 'check-circle',
      text: 'text-green-600 dark:text-green-400'
    },
    Negative: {
      glow: 'shadow-glow-red',
      iconBg: 'bg-red-500',
      icon: 'times-circle',
      text: 'text-red-600 dark:text-red-400'
    },
    Neutral: {
      glow: 'shadow-glow-yellow',
      iconBg: 'bg-yellow-500',
      icon: 'minus-circle',
      text: 'text-yellow-600 dark:text-yellow-400'
    }
  };
  
  const currentStyle = results ? sentimentStyles[results.sentiment] : null;

  return (
    <div className="space-y-6">
      {isLoading && <Loader message="Analyzing sentiment..." />}
      <Card>
        <h3 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text">Analyze Single Review</h3>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Enter any review text to get an instant sentiment analysis.</p>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={5}
          placeholder="This product is amazing! I love the quality and fast shipping."
          className="w-full p-2.5 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-background dark:bg-black/20 text-light-text dark:text-white placeholder-gray-500"
        />
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="mt-4 w-full px-6 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-slate-500 dark:disabled:bg-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="search" /> Analyze Sentiment
        </button>
      </Card>
      
      {results && currentStyle && (
        <Card className={`animate-fade-in-up ${currentStyle.glow}`}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-6 rounded-lg text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${currentStyle.iconBg}`}>
                      <Icon name={currentStyle.icon} className="text-4xl text-white"/>
                  </div>
                  <h4 className={`text-xl font-bold ${currentStyle.text}`}>{results.sentiment}</h4>
                  <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary">Confidence: {Math.round(results.confidence * 100)}%</p>
              </div>
              <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2 text-light-text dark:text-dark-text">Analysis Explanation</h4>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">{results.explanation}</p>
              </div>
            </div>
        </Card>
      )}
    </div>
  );
};

export default SingleReview;