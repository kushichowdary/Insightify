import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
        onTabChange('global-search');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center overflow-y-auto overflow-x-hidden bg-light-background dark:bg-dark-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="fixed inset-0 w-full h-full opacity-70">
          <Squares theme={theme} direction="diagonal" speed={0.4} squareSize={50} />
        </div>
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-light-background/20 to-light-background dark:via-dark-background/20 dark:to-dark-background"></div>
        {/* Floating gradient blobs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="fixed -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-brand-primary/10 blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="fixed top-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[100px]"
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 space-y-12"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-8 py-10 relative">
            <ScrambledText 
              className="!text-5xl md:!text-7xl !font-black !m-0 tracking-tighter"
              style={titleStyle}
              radius={200}
              scrambleChars='*<>/'
            >
              SENTILYTICS
            </ScrambledText>
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl font-medium"
            >
                Advanced AI Sentiment Intelligence.
            </motion.p>

            <motion.form 
                variants={itemVariants}
                onSubmit={handleSearch} 
                className="w-full max-w-2xl relative group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
                <input 
                    type="text" 
                    placeholder="Search global products, brands, or analysis IDs..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="relative w-full px-8 py-5 bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-light-border/50 dark:border-white/10 rounded-2xl text-xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-2xl placeholder:opacity-50 text-light-text dark:text-white"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-brand-primary text-white rounded-xl shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] hover:scale-105 active:scale-95 transition-all">
                    <Icon name="search" />
                </button>
            </motion.form>
            
            {/* Floating badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mt-8 opacity-70">
              {['Amazon', 'Flipkart', 'CSV Upload', 'Real-time Trends'].map((tag, i) => (
                <div key={tag} className="flex items-center gap-2 px-3 py-1 rounded-full bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border text-sm">
                  <Icon name="check-circle" className="text-brand-primary text-xs" />
                  {tag}
                </div>
              ))}
            </motion.div>
        </motion.div>

        {/* Action Grid */}
        <motion.div variants={itemVariants} className="flex justify-center w-full">
            <MagicBento 
              onTabChange={onTabChange}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
            />
        </motion.div>

        {/* Stats & Trends Section */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
            <motion.div variants={itemVariants} className="md:col-span-2 h-full">
              <Card className="border-t-4 border-t-brand-primary h-full flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex justify-between items-center mb-6 relative z-10">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-light-text dark:text-white">
                          <div className="p-2 bg-brand-primary/10 rounded-lg">
                            <Icon name="chart-area" className="text-brand-primary" />
                          </div>
                          Platform Sentiment Velocity
                      </h3>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-green-500/10 text-green-500 flex items-center gap-1">
                        <Icon name="arrow-up" /> Live
                      </span>
                  </div>
                  <div className="h-64 w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.trends}>
                              <defs>
                                  <linearGradient id="colorPosDash" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.1} />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-secondary)', fontSize: 12}} />
                              <YAxis hide />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px', color: 'var(--color-text)' }}
                                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                              />
                              <Area type="monotone" dataKey="positive" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorPosDash)" strokeWidth={4} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-primary)' }} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
            </motion.div>
            
            <div className="space-y-6 flex flex-col justify-between">
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20 backdrop-blur-sm shadow-lg overflow-hidden relative">
                      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 scale-150 text-brand-primary">
                        <Icon name="file-alt" className="text-8xl" />
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                          <div className="p-4 bg-white dark:bg-black/50 shadow-sm rounded-xl text-brand-primary border border-brand-primary/20">
                              <Icon name="file-alt" className="text-2xl" />
                          </div>
                          <div>
                              <p className="text-xs text-brand-primary dark:text-brand-primary/80 uppercase font-bold tracking-wider">Total Reports</p>
                              <p className="text-4xl font-black text-light-text dark:text-white drop-shadow-sm">{stats.totalAnalyzed}</p>
                          </div>
                      </div>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 backdrop-blur-sm shadow-lg overflow-hidden relative">
                      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 scale-150 text-blue-500">
                        <Icon name="users" className="text-8xl" />
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                          <div className="p-4 bg-white dark:bg-black/50 shadow-sm rounded-xl text-blue-500 border border-blue-500/20">
                              <Icon name="users" className="text-2xl" />
                          </div>
                          <div>
                              <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">Reviews Processed</p>
                              <p className="text-4xl font-black text-light-text dark:text-white drop-shadow-sm">{stats.totalReviews.toLocaleString()}</p>
                          </div>
                      </div>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 backdrop-blur-sm shadow-lg overflow-hidden relative">
                      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 scale-150 text-green-500">
                        <Icon name="smile" className="text-8xl" />
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                          <div className="p-4 bg-white dark:bg-black/50 shadow-sm rounded-xl text-green-500 border border-green-500/20">
                              <Icon name="smile" className="text-2xl" />
                          </div>
                          <div>
                              <p className="text-xs text-green-600 dark:text-green-400 uppercase font-bold tracking-wider">Avg Positive Sent</p>
                              <p className="text-4xl font-black text-light-text dark:text-white drop-shadow-sm">{stats.averageSentiment}%</p>
                          </div>
                      </div>
                  </Card>
                </motion.div>
            </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
