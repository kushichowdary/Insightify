
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnalysisRecord, ProductAnalysisResult, sampleAnalyticsData } from '../types';

interface DataContextType {
  records: AnalysisRecord[];
  addRecord: (record: AnalysisRecord) => void;
  deleteRecord: (id: string) => void;
  clearHistory: () => void;
  getAnalytics: () => {
    totalAnalyzed: number;
    totalReviews: number;
    averageSentiment: number;
    trends: { month: string; positive: number; negative: number; neutral: number }[];
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Helper to generate seed data from types.ts samples so the app isn't empty on first load
const generateSeedData = (): AnalysisRecord[] => {
    const records: AnalysisRecord[] = [];
    const now = Date.now();
    const day = 86400000;

    sampleAnalyticsData.sampleProducts.forEach((p, index) => {
        records.push({
            id: `seed-${index}`,
            type: 'url',
            date: new Date(now - (index * day * 2)).toISOString(),
            timestamp: now - (index * day * 2),
            title: p.name,
            data: {
                productName: p.name,
                overallRating: p.overallRating,
                reviewCount: p.reviewCount,
                summary: `Automated seed analysis for ${p.name}.`,
                verdict: p.overallRating > 4.5 ? 'Recommended' : 'Consider',
                sentiment: {
                    positive: p.sentiment.positive,
                    negative: p.sentiment.negative,
                    neutral: 100 - p.sentiment.positive - p.sentiment.negative
                },
                topPositiveKeywords: ['Quality', 'Performance', 'Design'],
                topNegativeKeywords: ['Price', 'Availability'],
                sampleReviews: []
            } as ProductAnalysisResult
        });
    });

    return records;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('sentilytics_history');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
        setRecords(generateSeedData());
      }
    } else {
        setRecords(generateSeedData());
    }
  }, []);

  const saveToStorage = (newRecords: AnalysisRecord[]) => {
    localStorage.setItem('sentilytics_history', JSON.stringify(newRecords));
  };

  const addRecord = (record: AnalysisRecord) => {
    const updated = [record, ...records];
    setRecords(updated);
    saveToStorage(updated);
  };

  const deleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveToStorage(updated);
  };

  const clearHistory = () => {
    setRecords([]);
    saveToStorage([]);
  };

  const getAnalytics = () => {
    // Filter for meaningful analysis types (URL and File)
    const relevantRecords = records.filter(r => r.type === 'url' || r.type === 'file');
    
    const totalAnalyzed = relevantRecords.length;
    
    let totalReviews = 0;
    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;
    let count = 0;

    relevantRecords.forEach(r => {
        if (r.type === 'url') {
            const d = r.data as ProductAnalysisResult;
            totalReviews += d.reviewCount;
            totalPositive += d.sentiment.positive;
            totalNegative += d.sentiment.negative;
            totalNeutral += d.sentiment.neutral;
            count++;
        } else if (r.type === 'file') {
             // Import type locally to avoid circular dep issues if any, though types.ts is safe
             const d = r.data as any; // Cast as any for simplicity in loop, strictly it is FileAnalysisResult
             totalReviews += d.totalReviews;
             totalPositive += d.sentimentDistribution.positive;
             totalNegative += d.sentimentDistribution.negative;
             totalNeutral += d.sentimentDistribution.neutral;
             count++;
        }
    });

    const averageSentiment = count > 0 ? Math.round(totalPositive / count) : 0;

    // Generate trends based on records
    // Group by Month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = new Map<string, { pos: number, neg: number, neu: number, count: number }>();

    // Initialize last 6 months
    const today = new Date();
    for(let i=5; i>=0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = months[d.getMonth()];
        trendMap.set(key, { pos: 0, neg: 0, neu: 0, count: 0 });
    }

    records.forEach(r => {
        const date = new Date(r.timestamp);
        const key = months[date.getMonth()];
        if (trendMap.has(key)) {
            const entry = trendMap.get(key)!;
            let s = { p: 0, n: 0, u: 0 };
            
            if (r.type === 'url') {
                const d = r.data as ProductAnalysisResult;
                s = { p: d.sentiment.positive, n: d.sentiment.negative, u: d.sentiment.neutral };
            } else if (r.type === 'file') {
                 const d = r.data as any;
                 s = { p: d.sentimentDistribution.positive, n: d.sentimentDistribution.negative, u: d.sentimentDistribution.neutral };
            } else if (r.type === 'text') {
                const d = r.data as any;
                if(d.sentiment === 'Positive') s.p = 100;
                else if(d.sentiment === 'Negative') s.n = 100;
                else s.u = 100;
            }

            entry.pos += s.p;
            entry.neg += s.n;
            entry.neu += s.u;
            entry.count++;
        }
    });

    const trends = Array.from(trendMap.entries()).map(([month, data]) => ({
        month,
        positive: data.count ? Math.round(data.pos / data.count) : 0,
        negative: data.count ? Math.round(data.neg / data.count) : 0,
        neutral: data.count ? Math.round(data.neu / data.count) : 0,
    }));

    return {
        totalAnalyzed,
        totalReviews,
        averageSentiment,
        trends
    };
  };

  return (
    <DataContext.Provider value={{ records, addRecord, deleteRecord, clearHistory, getAnalytics }}>
      {children}
    </DataContext.Provider>
  );
};
