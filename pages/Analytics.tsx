
import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import { sampleAnalyticsData } from '../types';
import Icon from '../components/Icon';
import { getSentimentTrends } from '../services/geminiService';

type SortKey = 'name' | 'reviewCount' | 'positive' | 'negative' | 'overallRating';

interface AnalyticsProps {
  addAlert: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ addAlert }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' } | null>(null);
  const [trendsData, setTrendsData] = useState(sampleAnalyticsData.trendsData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchTrends = async () => {
      setIsRefreshing(true);
      try {
        const data = await getSentimentTrends();
        setTrendsData(data);
      } catch (error) {
        console.error("Failed to refresh sentiment trends:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchTrends(); // Initial fetch
    const intervalId = setInterval(fetchTrends, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const sortedAndFilteredProducts = useMemo(() => {
    let products = [...sampleAnalyticsData.sampleProducts];

    if (searchQuery) {
      products = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (sortConfig !== null) {
      products.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortConfig.key === 'positive' || sortConfig.key === 'negative') {
            aValue = a.sentiment[sortConfig.key];
            bValue = b.sentiment[sortConfig.key];
        } else {
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return products;
  }, [searchQuery, sortConfig]);
  
  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <Icon name="sort" className="text-gray-500" />;
    }
    return sortConfig.direction === 'asc' ? <Icon name="sort-up" /> : <Icon name="sort-down" />;
  };

  const exportToCsv = () => {
    if (sortedAndFilteredProducts.length === 0) {
      addAlert('No data to export.', 'info');
      return;
    }

    const headers = ["Product", "Reviews", "Positive %", "Negative %", "Rating"];
    const rows = sortedAndFilteredProducts.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.reviewCount,
      p.sentiment.positive,
      p.sentiment.negative,
      p.overallRating
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    rows.forEach(rowArray => {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "product_comparison.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAlert('Product comparison data exported successfully!', 'success');
  };

  const SortableHeader: React.FC<{ sortKey: SortKey, children: React.ReactNode }> = ({ sortKey, children }) => (
    <th className="p-3 font-semibold text-sm text-light-text-secondary dark:text-dark-text-secondary">
      <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2">
        {children} {getSortIcon(sortKey)}
      </button>
    </th>
  );
    
  return (
    <div className="space-y-8">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">Sentiment Trends Over Time</h4>
          {isRefreshing && (
            <div className="flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary animate-pulse">
                <Icon name="sync" className="animate-spin" />
                <span>Refreshing...</span>
            </div>
          )}
        </div>
        <div className="w-full h-80">
          <ResponsiveContainer>
            <LineChart data={trendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--light-border)" className="dark:stroke-dark-border" />
              <XAxis dataKey="month" tick={{ fill: 'var(--light-text-secondary)', fontSize: 12 }} className="dark:tick-fill-dark-text-secondary"/>
              <YAxis unit="%" tick={{ fill: 'var(--light-text-secondary)', fontSize: 12 }} className="dark:tick-fill-dark-text-secondary"/>
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'var(--light-surface)', 
                    border: '1px solid var(--light-border)',
                    color: 'var(--light-text)',
                 }}
                 wrapperClassName="dark:!bg-dark-surface/80 dark:!text-dark-text dark:!border-dark-border"
                 labelStyle={{ color: 'var(--light-text)' }}
              />
              <Legend wrapperStyle={{fontSize: "14px", color: "var(--light-text-secondary)"}} className="dark:!text-dark-text-secondary"/>
              <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} name="Positive" dot={{ r: 4 }} activeDot={{ r: 6 }}/>
              <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} name="Negative" dot={{ r: 4 }} activeDot={{ r: 6 }}/>
              <Line type="monotone" dataKey="neutral" stroke="#F59E0B" strokeWidth={2} name="Neutral" dot={{ r: 4 }} activeDot={{ r: 6 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h4 className="text-lg font-semibold text-light-text dark:text-dark-text">Product Comparison</h4>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                    <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 p-2.5 pl-10 border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-light-background dark:bg-black/20 text-light-text dark:text-white placeholder-gray-500"
                    />
                </div>
                <button onClick={exportToCsv} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center gap-2">
                    <Icon name="download"/> Export CSV
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-black/30">
                    <tr>
                        <SortableHeader sortKey="name">Product</SortableHeader>
                        <SortableHeader sortKey="reviewCount">Reviews</SortableHeader>
                        <SortableHeader sortKey="positive">Positive %</SortableHeader>
                        <SortableHeader sortKey="negative">Negative %</SortableHeader>
                        <SortableHeader sortKey="overallRating">Rating</SortableHeader>
                    </tr>
                </thead>
                <tbody>
                    {sortedAndFilteredProducts.map(product => (
                        <tr key={product.name} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-3 font-medium text-light-text dark:text-dark-text">{product.name}</td>
                            <td className="p-3 text-light-text-secondary dark:text-dark-text-secondary">{product.reviewCount.toLocaleString()}</td>
                            <td className="p-3 text-green-600 dark:text-green-400 font-semibold">{product.sentiment.positive}%</td>
                            <td className="p-3 text-red-600 dark:text-red-400 font-semibold">{product.sentiment.negative}%</td>
                            <td className="p-3 text-yellow-500 dark:text-yellow-400 font-semibold flex items-center gap-1">
                                <Icon name="star"/> {product.overallRating}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;