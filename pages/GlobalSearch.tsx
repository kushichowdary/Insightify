
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie, Legend
} from 'recharts';
import Card from '../components/Card';
import Icon from '../components/Icon';
import Loader from '../components/Loader';
import { performGlobalSearch } from '../services/geminiService';
import { GlobalSearchResult } from '../types';
import { useUser } from '../contexts/UserContext';

interface GlobalSearchProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const COLORS = ['#3b82f6', '#f038d1', '#10b981', '#f59e0b', '#6366f1'];

const GlobalSearch: React.FC<GlobalSearchProps> = ({ addAlert }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GlobalSearchResult | null>(null);
  const { addNotification } = useUser();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    // Smooth transition between results
    if (result) {
        setResult(null);
        await new Promise(r => setTimeout(r, 400));
    }
    
    try {
      const data = await performGlobalSearch(query);
      setResult(data);
      addAlert('Intelligence report generated!', 'success');
      
      addNotification({
        title: 'Market Scan Ready',
        message: `Intelligence scan for "${query}" completed. Best price: ${data.bestPrice}.`,
        type: 'success'
      });
    } catch (error: any) {
      addAlert(error.message || 'Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-t-4 border-brand-primary overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon name="globe-asia" className="text-8xl" />
            </div>
            <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                <Icon name="search-location" className="text-brand-primary" />
                Bharat Intelligence Engine
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8 italic">
              Aggregating pricing, sentiment, and local availability across Indian retail platforms.
            </p>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Product name (e.g., iPhone 15 Pro, Noise Evolve 3)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-black/20 border-2 border-light-border dark:border-dark-border rounded-2xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-lg shadow-inner"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="px-10 py-4 bg-brand-primary text-white font-black rounded-2xl hover:bg-brand-primary-hover disabled:opacity-50 transition-all shadow-glow-primary/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                    <><Icon name="spinner" className="animate-spin" /> SCANNING</>
                ) : (
                    <><Icon name="bolt" /> ANALYZE MARKET</>
                )}
              </button>
            </form>
        </Card>
      </motion.div>

      {loading && (
        <div className="py-12">
            <Loader message="Tapping into Indian retail APIs and synthesizing data..." />
        </div>
      )}

      <AnimatePresence mode="wait">
      {result && (
        <motion.div 
            key={result.productName}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
          {/* Header Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3 border-l-4 border-brand-primary bg-gradient-to-r from-brand-primary/[0.03] to-transparent">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-4xl font-black text-light-text dark:text-white tracking-tight">{result.productName}</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                             <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase border border-green-500/20">Indian Market</span>
                             <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded uppercase border border-blue-500/20">Verified Info</span>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Best Price Points</p>
                        <p className="text-4xl font-black text-brand-primary animate-pulse">{result.bestPrice}</p>
                    </div>
                </div>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center border-b-4 border-amber-500">
                <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">Overall Score</h4>
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-white/5" />
                        <motion.circle 
                            cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={263.8}
                            initial={{ strokeDashoffset: 263.8 }}
                            animate={{ strokeDashoffset: 263.8 - (263.8 * result.overallSentiment) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="text-brand-primary"
                        />
                    </svg>
                    <span className="absolute text-2xl font-black">{result.overallSentiment}%</span>
                </div>
            </Card>
          </motion.div>

          {/* Verdict & Insights */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="bg-slate-50 dark:bg-white/5 border border-dashed border-brand-primary/30">
                <h4 className="text-sm font-bold uppercase tracking-widest text-brand-primary mb-4 flex items-center gap-2">
                    <Icon name="balance-scale" /> Aggregated Indian Verdict
                </h4>
                <p className="text-2xl font-bold leading-tight mb-4">{result.bestVerdict}</p>
                <div className="p-4 bg-white dark:bg-black/20 rounded-xl border border-light-border dark:border-dark-border text-sm italic text-light-text-secondary dark:text-dark-text-secondary">
                    "{result.aiInsights}"
                </div>
             </Card>
             <Card className="border-l-4 border-indigo-500">
                <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2">
                    <Icon name="tags" /> Local Market Specifics
                </h4>
                <div className="space-y-4">
                    <p className="text-sm leading-relaxed">{result.indianMarketSpecifics}</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">EMI Schemes</span>
                            <span className="text-xs font-semibold">Available No-Cost</span>
                        </div>
                        <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Service Status</span>
                            <span className="text-xs font-semibold">High Accessibility</span>
                        </div>
                    </div>
                </div>
             </Card>
          </motion.div>

          {/* Graphs Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card>
                <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
                    <Icon name="chart-bar" className="text-brand-primary" />
                    Price Comparison (₹)
                </h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.stores}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                cursor={{fill: 'var(--color-primary)', opacity: 0.05}}
                            />
                            <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                                {result.stores.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </Card>

             <Card>
                <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
                    <Icon name="history" className="text-brand-primary" />
                    Price Trend (Estimated)
                </h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.priceHistory}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} hide />
                            <Tooltip />
                            <Area type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
             </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <Card className="lg:col-span-2">
                <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
                    <Icon name="comments" className="text-brand-primary" />
                    Platform Sentiment Breakdown
                </h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.sentimentBreakdown} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="platform" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 10}} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="positive" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="neutral" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="negative" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </Card>

             <Card className="p-0 overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-light-border dark:border-dark-border">
                    <h4 className="text-xs font-bold uppercase tracking-widest">Pricing Matrix</h4>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-light-border dark:divide-dark-border">
                    {result.stores.map((store, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-brand-primary/5 transition-colors group"
                        >
                            <div className="flex-1 min-w-0 pr-3">
                                <p className="font-bold truncate group-hover:text-brand-primary transition-colors">{store.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs font-black text-brand-primary font-mono">{store.priceDisplay}</span>
                                    <span className="flex items-center text-[10px] text-yellow-500 font-bold">
                                        {store.rating} <Icon name="star" className="ml-0.5" />
                                    </span>
                                </div>
                            </div>
                            <a href={store.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-brand-primary hover:text-white transition-all shadow-inner">
                                <Icon name="external-link-alt" />
                            </a>
                        </motion.div>
                    ))}
                </div>
             </Card>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
