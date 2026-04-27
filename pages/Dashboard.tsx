import React, { useState, useEffect } from 'react';
import MagicBento from '../components/MagicBento';
import ScrambledText from '../components/ScrambledText';
import Squares from '../components/Squares';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AccentColor, Theme } from '../types';
import { useData } from '../contexts/DataContext';

interface DashboardProps {
    onTabChange: (tabId: string) => void;
    accentColor: AccentColor | null;
    theme: Theme;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange, accentColor, theme }) => {
  const { getAnalytics, records } = useData();
  const [showSearch, setShowSearch] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  
  // Debounce the input value to update searchValue safely without excessive updates
  useEffect(() => {
      const handler = setTimeout(() => {
          setSearchValue(inputValue);
      }, 400);
      return () => clearTimeout(handler);
  }, [inputValue]);
  
  const stats = getAnalytics();
  
  const titleStyle: React.CSSProperties = {
    color: accentColor ? accentColor.main : 'var(--color-primary)',
    textShadow: `0 0 25px ${accentColor ? accentColor.glow : 'var(--color-primary-glow)'}`
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
        // Here we could simulate a search or pass it to some global state
        onTabChange('global-search');
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center overflow-y-auto overflow-x-hidden bg-light-background dark:bg-dark-background">
      <div className="absolute inset-0 z-0 h-[50vh]">
        <Squares theme={theme} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-light-background dark:to-dark-background"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 py-10">
            <ScrambledText 
              className="!text-4xl md:!text-6xl !font-black !m-0 tracking-tighter"
              style={titleStyle}
              radius={200}
              scrambleChars='*<>/'
            >
              SENTILYTICS
            </ScrambledText>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl animate-fade-in font-medium italic">
                Advanced AI Sentiment Intelligence. Deciphering customer emotions with BERT-powered precision.
            </p>

            <form onSubmit={handleSearch} className="w-full max-w-2xl relative group animate-fade-in-up">
                <input 
                    type="text" 
                    placeholder="Search global products, brands, or analysis IDs..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-8 py-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border-2 border-brand-primary/20 rounded-2xl text-xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-2xl placeholder:opacity-50"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-brand-primary text-white rounded-xl shadow-glow-primary/40 hover:scale-105 active:scale-95 transition-all">
                    <Icon name="arrow-right" />
                </button>
            </form>
        </div>

        {/* Action Grid */}
        <div className="animate-fade-in-up flex justify-center w-full">
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

        {/* Stats & Trends Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in w-full">
            <div className="md:col-span-2">
              <Card className="border-l-4 border-brand-primary h-full flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                          <Icon name="chart-area" className="text-brand-primary" />
                          Platform Sentiment Velocity
                      </h3>
                  </div>
                  <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.trends}>
                              <defs>
                                  <linearGradient id="colorPosDash" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.1} />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-secondary)', fontSize: 12}} />
                              <YAxis hide />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                              />
                              <Area type="monotone" dataKey="positive" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorPosDash)" strokeWidth={4} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
            </div>
            
            <div className="space-y-6 flex flex-col justify-between">
                <Card className="bg-brand-primary/5 border-brand-primary/20 hover:-translate-y-1 transition-transform">
                     <div className="flex items-center gap-4">
                         <div className="p-4 bg-brand-primary/20 rounded-xl text-brand-primary">
                             <Icon name="file-alt" className="text-2xl" />
                         </div>
                         <div>
                             <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase font-bold tracking-wider">Total Reports</p>
                             <p className="text-3xl font-black text-light-text dark:text-white">{stats.totalAnalyzed}</p>
                         </div>
                     </div>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20 hover:-translate-y-1 transition-transform">
                     <div className="flex items-center gap-4">
                         <div className="p-4 bg-blue-500/20 rounded-xl text-blue-500">
                             <Icon name="users" className="text-2xl" />
                         </div>
                         <div>
                             <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase font-bold tracking-wider">Reviews Processed</p>
                             <p className="text-3xl font-black text-light-text dark:text-white">{stats.totalReviews.toLocaleString()}</p>
                         </div>
                     </div>
                </Card>
                <Card className="bg-green-500/5 border-green-500/20 hover:-translate-y-1 transition-transform">
                     <div className="flex items-center gap-4">
                         <div className="p-4 bg-green-500/20 rounded-xl text-green-500">
                             <Icon name="smile" className="text-2xl" />
                         </div>
                         <div>
                             <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary uppercase font-bold tracking-wider">Avg Positive Sent</p>
                             <p className="text-3xl font-black text-light-text dark:text-white">{stats.averageSentiment}%</p>
                         </div>
                     </div>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
