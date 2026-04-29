
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { useData } from '../contexts/DataContext';
import { ProductAnalysisResult, FileAnalysisResult, CompetitiveAnalysisResult } from '../types';

type SortKey = 'productName' | 'reviewCount' | 'positive' | 'negative' | 'overallRating' | 'date' | 'type' | 'fakeReviewProbability';

interface AnalyticsProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

const SortIcon: React.FC<{ column: SortKey, sortConfig: { key: SortKey, direction: 'asc' | 'desc' } }> = ({ column, sortConfig }) => {
    if (sortConfig.key !== column) return <Icon name="sort" className="ml-1 text-xs opacity-30" />;
    return <Icon name={sortConfig.direction === 'asc' ? 'sort-up' : 'sort-down'} className="ml-1 text-xs text-brand-primary" />;
};

const Analytics: React.FC<AnalyticsProps> = ({ addAlert }) => {
  const { records, getAnalytics } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  const stats = getAnalytics();

  // Pie chart data
  const pieData = useMemo(() => {
    let pos = 0, neg = 0, neu = 0, total = 0;
    records.forEach(r => {
        if (r.type === 'url') {
            const d = r.data as ProductAnalysisResult;
            pos += d.sentiment.positive; neg += d.sentiment.negative; neu += d.sentiment.neutral; total++;
        } else if (r.type === 'file') {
            const d = r.data as FileAnalysisResult;
            pos += d.sentimentDistribution.positive; neg += d.sentimentDistribution.negative; neu += d.sentimentDistribution.neutral; total++;
        }
    });

    if (total === 0) return [];
    return [
        { name: 'Positive', value: Math.round(pos / total) },
        { name: 'Negative', value: Math.round(neg / total) },
        { name: 'Neutral', value: Math.round(neu / total) },
    ];
  }, [records]);

  // Extract products from records for the table
  const tableData = useMemo(() => {
    const list: any[] = [];
    records.forEach(r => {
        if (r.type === 'url') {
            const d = r.data as ProductAnalysisResult;
            list.push({ id: r.id, productName: d.productName || 'Unknown Product', reviewCount: d.reviewCount || 0, sentiment: d.sentiment || { positive: 0, negative: 0, neutral: 0 }, overallRating: d.overallRating || 0, date: r.date, type: 'URL', fakeReviewProbability: d.fakeReviewProbability || 0 });
        } else if (r.type === 'file') {
            const d = r.data as FileAnalysisResult;
            list.push({ id: r.id, productName: r.title, reviewCount: d.totalReviews || 0, sentiment: d.sentimentDistribution ? { positive: d.sentimentDistribution.positive, negative: d.sentimentDistribution.negative, neutral: d.sentimentDistribution.neutral } : { positive: 0, negative: 0, neutral: 0 }, overallRating: 'N/A', date: r.date, type: 'File', fakeReviewProbability: d.fakeReviewProbability || 0 });
        }
    });
    return list;
  }, [records]);

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = [...tableData];

    if (searchQuery) {
      filtered = filtered.filter(p => p.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    filtered.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch(sortConfig.key) {
          case 'productName':
              aValue = a.productName; bValue = b.productName; break;
          case 'reviewCount':
              aValue = a.reviewCount; bValue = b.reviewCount; break;
          case 'overallRating':
              aValue = a.overallRating === 'N/A' ? 0 : a.overallRating; bValue = b.overallRating === 'N/A' ? 0 : b.overallRating; break;
          case 'positive':
              aValue = a.sentiment.positive; bValue = b.sentiment.positive; break;
          case 'negative':
              aValue = a.sentiment.negative; bValue = b.sentiment.negative; break;
          case 'date':
              aValue = new Date(a.date).getTime(); bValue = new Date(b.date).getTime(); break;
          case 'type':
              aValue = a.type; bValue = b.type; break;
          case 'fakeReviewProbability':
              aValue = a.fakeReviewProbability || 0; bValue = b.fakeReviewProbability || 0; break;
          default:
              return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tableData, searchQuery, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-10 max-w-6xl mx-auto">
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 border-l-4 border-blue-500 shadow-glow-primary/5">
           <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
             <Icon name="search" className="text-xl" />
           </div>
           <div>
             <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium">Total Analyzed</p>
             <p className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">{stats.totalAnalyzed}</p>
           </div>
        </Card>
        <Card className="flex items-center gap-4 border-l-4 border-purple-500 shadow-glow-primary/5">
           <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
             <Icon name="comments" className="text-xl" />
           </div>
           <div>
             <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium">Total Reviews</p>
             <p className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">{stats.totalReviews.toLocaleString()}</p>
           </div>
        </Card>
        <Card className="flex items-center gap-4 border-l-4 border-emerald-500 shadow-glow-primary/5">
           <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
             <Icon name="smile" className="text-xl" />
           </div>
           <div>
             <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-medium">Avg Sentiment</p>
             <p className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">{stats.averageSentiment}% Positive</p>
           </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-light-text dark:text-dark-text flex items-center gap-2">
                <Icon name="chart-line" className="text-brand-primary" />
                Sentiment Trends (Last 6 Months)
            </h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-secondary)'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-secondary)'}} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                            itemStyle={{ color: 'var(--color-text-primary)' }}
                        />
                        <Area type="monotone" dataKey="positive" stroke="#10B981" fillOpacity={1} fill="url(#colorPos)" strokeWidth={3} />
                        <Area type="monotone" dataKey="negative" stroke="#EF4444" fillOpacity={1} fill="url(#colorNeg)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>

        <Card>
            <h3 className="text-lg font-semibold mb-6 text-light-text dark:text-dark-text flex items-center gap-2">
                <Icon name="chart-pie" className="text-brand-primary" />
                Overall Sentiment Dist.
            </h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                <Icon name="history" className="text-brand-primary" />
                Recent Product Analyses
            </h3>
            <div className="relative w-full md:w-64">
                <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-light-background dark:bg-black/20 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-light-text dark:text-white placeholder-gray-500 transition-all duration-300 shadow-inner"
                />
            </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-light-border dark:border-dark-border">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-white/5 border-b border-light-border dark:border-dark-border">
                        <th className="p-4 font-semibold text-xs uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('productName')}>
                            Product Name <SortIcon column="productName" sortConfig={sortConfig} />
                        </th>
                         <th className="p-4 font-semibold text-xs uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('reviewCount')}>
                            Reviews <SortIcon column="reviewCount" sortConfig={sortConfig} />
                        </th>
                        <th className="p-4 font-semibold text-xs uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('positive')}>
                            Sentiment <SortIcon column="positive" sortConfig={sortConfig} />
                        </th>
                        <th className="p-4 font-semibold text-xs uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('overallRating')}>
                            Rating <SortIcon column="overallRating" sortConfig={sortConfig} />
                        </th>
                        <th className="p-4 font-semibold text-xs uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('date')}>
                            Date <SortIcon column="date" sortConfig={sortConfig} />
                        </th>
                        <th className="p-4 font-semibold text-xs uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('fakeReviewProbability')}>
                            Fake Risk <SortIcon column="fakeReviewProbability" sortConfig={sortConfig} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAndFilteredProducts.length > 0 ? (
                        sortedAndFilteredProducts.map(product => (
                            <tr key={product.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-slate-50 dark:hover:bg-brand-primary/5 transition-colors group">
                                <td className="p-4 font-medium text-light-text dark:text-dark-text">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${product.sentiment.positive > 70 ? 'bg-green-500' : product.sentiment.positive > 40 ? 'bg-yellow-500' : 'bg-red-500'} shadow-glow-primary/20`}></div>
                                        {product.productName}
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20">{product.type}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-light-text-secondary dark:text-dark-text-secondary font-mono">{product.reviewCount.toLocaleString()}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden w-24">
                                            <div className="h-full bg-emerald-500 shadow-glow-primary/10" style={{ width: `${product.sentiment.positive}%` }}></div>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 w-8 text-right">{product.sentiment.positive}%</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-light-text dark:text-dark-text font-semibold">{product.overallRating}</span>
                                        {product.overallRating !== 'N/A' && <Icon name="star" className="text-xs text-yellow-500" />}
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    {new Date(product.date).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    {product.fakeReviewProbability !== undefined ? (
                                        <div className="flex items-center gap-2">
                                           <div className={`w-2 h-2 rounded-full ${product.fakeReviewProbability > 60 ? 'bg-red-500' : product.fakeReviewProbability > 30 ? 'bg-yellow-500' : 'bg-green-500'} shadow-glow-primary/20`}></div>
                                           <span className={`text-xs font-semibold ${product.fakeReviewProbability > 60 ? 'text-red-500' : product.fakeReviewProbability > 30 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>{product.fakeReviewProbability}%</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">N/A</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="p-10 text-center text-light-text-secondary dark:text-dark-text-secondary">
                                <Icon name="inbox" className="text-4xl mb-3 opacity-20 block mx-auto" />
                                No data available yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;

