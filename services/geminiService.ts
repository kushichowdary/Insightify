
import { ProductAnalysisResult, FileAnalysisResult, SingleReviewResult, CompetitiveAnalysisResult } from '../types';

const API_BASE_URL = '/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const analyzeProductUrl = async (url: string): Promise<ProductAnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/analyze-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return handleResponse(response);
};

export const analyzeReviewFile = async (fileContent: string): Promise<FileAnalysisResult> => {
    const response = await fetch(`${API_BASE_URL}/analyze-file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileContent }),
  });
  return handleResponse(response);
};

export const analyzeSingleReview = async (reviewText: string): Promise<SingleReviewResult> => {
  const response = await fetch(`${API_BASE_URL}/analyze-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewText }),
  });
  return handleResponse(response);
};

export const compareProducts = async (url1: string, url2: string): Promise<CompetitiveAnalysisResult> => {
    const response = await fetch(`${API_BASE_URL}/compare-products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url1, url2 }),
  });
  return handleResponse(response);
}

export const getSentimentTrends = async (): Promise<{ month: string; positive: number; negative: number; neutral: number; }[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const baseData = [
        { month: "Jan", positive: 65, negative: 25, neutral: 10 },
        { month: "Feb", positive: 68, negative: 22, neutral: 10 },
        { month: "Mar", positive: 72, negative: 18, neutral: 10 },
        { month: "Apr", positive: 75, negative: 15, neutral: 10 },
        { month: "May", positive: 78, negative: 12, neutral: 10 },
        { month: "Jun", positive: 80, negative: 11, neutral: 9 },
      ];

      const randomizedData = baseData.map(d => ({
        ...d,
        positive: parseFloat((d.positive + (Math.random() * 6 - 3)).toFixed(1)),
        negative: parseFloat((d.negative + (Math.random() * 4 - 2)).toFixed(1)),
        neutral: parseFloat((d.neutral + (Math.random() * 2 - 1)).toFixed(1)),
      }));

      resolve(randomizedData);
    }, 300);
  });
};