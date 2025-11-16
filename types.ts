
export type Sentiment = 'Positive' | 'Negative' | 'Neutral';

// FIX: Add and export the 'Theme' type.
export type Theme = 'light' | 'dark';
export type Verdict = 'Recommended' | 'Consider' | 'Not Recommended';

export type AccentColor = {
  name: string;
  main: string;
  hover: string;
  glow: string;
};

export interface ProductAnalysisResult {
  productName: string;
  overallRating: number;
  reviewCount: number;
  summary: string;
  verdict: Verdict;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topPositiveKeywords: string[];
  topNegativeKeywords: string[];
  sampleReviews: {
    text: string;
    sentiment: Sentiment;
  }[];
}

export interface FileAnalysisResult {
  totalReviews: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topKeywords: {
    positive: string[];
    negative: string[];
  }
}

export interface SingleReviewResult {
  sentiment: Sentiment;
  confidence: number;
  explanation: string;
}

export interface CompetitiveAnalysisResult {
  productOne: ProductAnalysisResult;
  productTwo: ProductAnalysisResult;
  comparisonSummary: string;
}

export type AlertType = 'success' | 'error' | 'info';

export interface AlertMessage {
  id: number;
  message: string;
  type: AlertType;
}

export interface Dataset {
  id: number;
  name: string;
  reviewCount: number;
  lastUpdated: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Analyst';
  status: 'Active' | 'Inactive';
  preferences: {
    notifications: {
      email: boolean;
      inApp: boolean;
    }
  }
}

export const sampleDatasets: Dataset[] = [
    { id: 1, name: 'Amazon Electronics Reviews Q2', reviewCount: 45632, lastUpdated: '2 days ago' },
    { id: 2, name: 'Flipkart Fashion Customer Feedback', reviewCount: 10245, lastUpdated: '1 week ago' },
    { id: 3, name: 'Myntra Home & Living Dataset', reviewCount: 5890, lastUpdated: '3 weeks ago' },
];

export const sampleUsers: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@company.com', role: 'Admin', status: 'Active', preferences: { notifications: { email: true, inApp: false } } },
    { id: 2, name: 'Analyst User', email: 'analyst@company.com', role: 'Analyst', status: 'Active', preferences: { notifications: { email: true, inApp: true } } },
    { id: 3, name: 'John Doe', email: 'john.doe@company.com', role: 'Analyst', status: 'Inactive', preferences: { notifications: { email: false, inApp: false } } },
];


export const sampleAnalyticsData = {
    totalProductsAnalyzed: 1247,
    totalReviewsProcessed: 45632,
    averageSentimentScore: 72.5,
    trendsData: [
      { month: "Jan", positive: 65, negative: 25, neutral: 10 },
      { month: "Feb", positive: 68, negative: 22, neutral: 10 },
      { month: "Mar", positive: 72, negative: 18, neutral: 10 },
      { month: "Apr", positive: 75, negative: 15, neutral: 10 },
      { month: "May", positive: 78, negative: 12, neutral: 10 },
      { month: "Jun", positive: 80, negative: 11, neutral: 9 },
    ],
    sampleProducts: [
        {
          name: "iPhone 15 Pro",
          reviewCount: 1247,
          sentiment: { positive: 78, negative: 15 },
          overallRating: 4.7
        },
        {
          name: "Samsung Galaxy S24 Ultra",
          reviewCount: 892,
          sentiment: { positive: 72, negative: 18 },
          overallRating: 4.5
        },
        {
          name: "MacBook Pro M3",
          reviewCount: 634,
          sentiment: { positive: 85, negative: 10 },
          overallRating: 4.8
        }
      ]
  };