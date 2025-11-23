
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { useData } from '../contexts/DataContext';
import { ProductAnalysisResult } from '../types';

type SortKey = 'productName' | 'reviewCount' | 'positive' | 'negative' | 'overallRating' | 'date';

interface AnalyticsProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ addAlert }) => {
  const { records, getAnalytics } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  const stats = getAnalytics();

  // Extract products from records for the table
  const products = useMemo(() => {
    return records
      .filter(r => r.type === 'url')
      .map(r => ({
          ...(r.data as ProductAnalysisResult),
          date: r.date,
          id: r.id
      }));
  }, [records]);

  const sortedAndFilteredProducts = useMemo(() => {
    let filtered = [...products];

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
              aValue = a.overallRating; bValue = b.overallRating; break;
          case 'positive':
              aValue = a.sentiment.positive; bValue = b.sentiment.positive; break;
          case 'negative':
              aValue = a.sentiment.negative; bValue = b.sentiment.negative; break;
          case 'date':
              aValue = new Date(a.date).getTime(); bValue = new Date(b.date).getTime(); break;
          default:
              return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchQuery, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const SortIcon: React.FC<{ column: SortKey }> = ({ column }) => {
    if (sortConfig.key !== column) return <Icon name="sort" className="ml-1 text-xs opacity-30" />;
    return <Icon name={sortConfig.direction === 'asc' ? 'sort-up' : 'sort-down'} className="ml-1 text-xs text-brand-primary" />;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
             <Icon name="search" className="text-xl" />
           </div>
           <div>
             <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Analyzed</p>
             <p className="text-2xl font-bold text-light-text dark:text-dark-text">{stats.totalAnalyzed}</p>
           </div>
        </Card>
        <Card className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
             <Icon name="comments" className="text-xl" />
           </div>
           <div>
             <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total Reviews</p>
             <p className="text-2xl font-bold text-light-text dark:text-dark-text">{stats.totalReviews.toLocaleString()}</p>
           </div>
        </Card>
        <Card className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
             <Icon name="smile" className="text-xl" />
           </div>
           <div>
             <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Avg Sentiment</p>
             <p className="text-2xl font-bold text-light-text dark:text-dark-text">{stats.averageSentiment}% Positive</p>
           </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-6 text-light-text dark:text-dark-text">Sentiment Trends (Last 6 Months)</h3>
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
                        contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--color-text-primary)' }}
                    />
                    <Area type="monotone" dataKey="positive" stroke="#10B981" fillOpacity={1} fill="url(#colorPos)" strokeWidth={3} />
                    <Area type="monotone" dataKey="negative" stroke="#EF4444" fillOpacity={1} fill="url(#colorNeg)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Recent Product Analyses</h3>
            <div className="relative w-full md:w-64">
                <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-light-background dark:bg-black/20 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none text-light-text dark:text-white placeholder-gray-500"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-light-border dark:border-dark-border">
                        <th className="p-4 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('productName')}>
                            Product Name <SortIcon column="productName" />
                        </th>
                         <th className="p-4 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('reviewCount')}>
                            Reviews <SortIcon column="reviewCount" />
                        </th>
                        <th className="p-4 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('positive')}>
                            Sentiment <SortIcon column="positive" />
                        </th>
                        <th className="p-4 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('overallRating')}>
                            Rating <SortIcon column="overallRating" />
                        </th>
                        <th className="p-4 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary cursor-pointer hover:text-brand-primary transition-colors" onClick={() => handleSort('date')}>
                            Date <SortIcon column="date" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAndFilteredProducts.length > 0 ? (
                        sortedAndFilteredProducts.map(product => (
                            <tr key={product.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-light-text dark:text-dark-text">{product.productName}</td>
                                <td className="p-4 text-light-text-secondary dark:text-dark-text-secondary">{product.reviewCount.toLocaleString()}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden w-24">
                                            <div className="h-full bg-green-500" style={{ width: `${product.sentiment.positive}%` }}></div>
                                        </div>
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">{product.sentiment.positive}%</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <span className="text-light-text dark:text-dark-text font-medium">{product.overallRating}</span>
                                        <Icon name="star" className="text-xs" />
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                    {new Date(product.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-light-text-secondary dark:text-dark-text-secondary">
                                No data available. Analyze some product URLs to see them here!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
