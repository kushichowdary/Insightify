
import React from 'react';
import MagicBento from '../components/MagicBento';
import { User as FirebaseUser } from 'firebase/auth';
import { sampleAnalyticsData } from '../types';
import Card from '../components/Card';
import Icon from '../components/Icon';

interface DashboardProps {
    onTabChange: (tabId: string) => void;
    user: FirebaseUser | null;
}

const StatCard: React.FC<{ icon: string; label: string; value: string; className?: string }> = ({ icon, label, value, className }) => (
    <Card className={`text-center transition-all hover:shadow-lg ${className}`}>
        <Icon name={icon} className="text-3xl mb-2" />
        <p className="text-2xl font-bold text-light-text dark:text-dark-text">{value}</p>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
    </Card>
);


const Dashboard: React.FC<DashboardProps> = ({ onTabChange, user }) => {
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="w-full min-h-full p-4 sm:p-8 flex flex-col items-center justify-center space-y-8 animate-fade-in">
        <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text">Welcome back, {userName}!</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2 max-w-2xl">Here's a quick overview of your workspace. What would you like to analyze today?</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
            <StatCard 
                icon="box-open" 
                label="Products Analyzed" 
                value={sampleAnalyticsData.totalProductsAnalyzed.toLocaleString()} 
                className="[&_i]:text-brand-primary hover:!border-brand-primary dark:hover:shadow-glow-magenta" 
            />
            <StatCard 
                icon="comments" 
                label="Reviews Processed" 
                value={sampleAnalyticsData.totalReviewsProcessed.toLocaleString()} 
                className="[&_i]:text-green-500 dark:[&_i]:text-green-400 hover:!border-green-400 dark:hover:shadow-glow-green" 
            />
            <StatCard 
                icon="smile-beam" 
                label="Avg. Sentiment Score" 
                value={`${sampleAnalyticsData.averageSentimentScore}%`} 
                className="[&_i]:text-yellow-500 dark:[&_i]:text-yellow-400 hover:!border-yellow-400 dark:hover:shadow-glow-yellow" 
            />
        </div>

      <MagicBento 
        onTabChange={onTabChange}
        enableStars={true}
        enableSpotlight={true}
        enableBorderGlow={true}
        enableTilt={true}
        enableMagnetism={true}
        clickEffect={true}
      />
    </div>
  );
};

export default Dashboard;