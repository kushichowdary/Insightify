
import { GoogleGenAI, Type } from '@google/genai';
import { ProductAnalysisResult, FileAnalysisResult, SingleReviewResult, CompetitiveAnalysisResult } from '../types';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas for structured responses from the AI model
const productAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING },
      overallRating: { type: Type.NUMBER },
      reviewCount: { type: Type.INTEGER },
      summary: { type: Type.STRING, description: "A concise one-paragraph summary of the product's reception based on reviews." },
      verdict: { type: Type.STRING, enum: ['Recommended', 'Consider', 'Not Recommended'] },
      sentiment: {
        type: Type.OBJECT,
        properties: {
          positive: { type: Type.INTEGER },
          negative: { type: Type.INTEGER },
          neutral: { type: Type.INTEGER },
        },
        required: ['positive', 'negative', 'neutral'],
      },
      topPositiveKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      topNegativeKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      sampleReviews: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
          },
          required: ['text', 'sentiment'],
        },
      },
    },
    required: ['productName', 'overallRating', 'reviewCount', 'summary', 'verdict', 'sentiment', 'topPositiveKeywords', 'topNegativeKeywords', 'sampleReviews'],
};

const fileAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      totalReviews: { type: Type.INTEGER },
      sentimentDistribution: {
        type: Type.OBJECT,
        properties: {
          positive: { type: Type.INTEGER },
          negative: { type: Type.INTEGER },
          neutral: { type: Type.INTEGER },
        },
        required: ['positive', 'negative', 'neutral'],
      },
      topKeywords: {
        type: Type.OBJECT,
        properties: {
          positive: { type: Type.ARRAY, items: { type: Type.STRING } },
          negative: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['positive', 'negative'],
      },
    },
    required: ['totalReviews', 'sentimentDistribution', 'topKeywords'],
};

const singleReviewSchema = {
    type: Type.OBJECT,
    properties: {
      sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
      confidence: { type: Type.NUMBER },
      explanation: { type: Type.STRING },
    },
    required: ['sentiment', 'confidence', 'explanation'],
};

const competitiveAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        productOne: productAnalysisSchema,
        productTwo: productAnalysisSchema,
        comparisonSummary: { type: Type.STRING, description: "A detailed summary comparing the two products." }
    },
    required: ['productOne', 'productTwo', 'comparisonSummary']
};


/**
 * A generic function to call the Gemini API with a given prompt and response schema.
 * This centralizes the API call logic and error handling.
 */
const callGemini = async <T>(modelName: string, prompt: string, schema: any): Promise<T> => {
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        
        const text = response.text;
        if (!text) {
          throw new Error("Received an empty response from the AI model.");
        }
        
        return JSON.parse(text);
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error('The provided API Key is invalid. Please ensure it is configured correctly.');
            }
             if (error.message.includes('Request payload size exceeds the limit')) {
                 throw new Error('The uploaded file is too large. Please use a smaller file.');
            }
            throw error;
        }
        
        throw new Error('An unexpected error occurred while communicating with the AI model.');
    }
};

const getDefaultModels = () => {
    const savedModels = localStorage.getItem('defaultModels');
    if (savedModels) {
        try {
            const parsed = JSON.parse(savedModels);
            if (parsed.pro && parsed.flash) {
                return parsed;
            }
        } catch (e) {
            console.error("Failed to parse models from localStorage", e);
        }
    }
    return { pro: 'gemini-2.5-pro', flash: 'gemini-2.5-flash' };
};

export const analyzeProductUrl = async (url: string): Promise<ProductAnalysisResult> => {
    const models = getDefaultModels();
    const prompt = `Critically analyze the product reviews from the URL: ${url}. Provide the product name, overall rating out of 5, and total review count. Summarize the sentiment as percentages for positive, negative, and neutral (ensure they sum to 100). Extract the top 5 most impactful positive keywords and top 5 negative keywords. Also, provide 4 diverse sample reviews with their corresponding sentiment ('Positive', 'Negative', or 'Neutral'). After the analysis, provide a concise one-paragraph summary of the product's reception based on the reviews. Finally, give a clear verdict: 'Recommended', 'Consider', or 'Not Recommended'.`;
    return callGemini(models.pro, prompt, productAnalysisSchema);
};

export const analyzeReviewFile = async (fileContent: string): Promise<FileAnalysisResult> => {
    const models = getDefaultModels();
    const prompt = `Analyze the following text which contains multiple product reviews. Provide the total number of reviews found. Calculate the sentiment distribution as percentages for positive, negative, and neutral (summing to 100). Extract the top 4 most common positive and top 4 negative keywords from the entire text. Here is the review data: \n\n${fileContent}`;
    return callGemini(models.flash, prompt, fileAnalysisSchema);
};

export const analyzeSingleReview = async (reviewText: string): Promise<SingleReviewResult> => {
    const models = getDefaultModels();
    const prompt = `Analyze the sentiment of this review: "${reviewText}". Classify it as 'Positive', 'Negative', or 'Neutral'. Provide a confidence score from 0 to 1. Give a brief, one-sentence explanation for your classification.`;
    return callGemini(models.flash, prompt, singleReviewSchema);
};

export const compareProducts = async (url1: string, url2: string): Promise<CompetitiveAnalysisResult> => {
    const models = getDefaultModels();
    const prompt = `Perform a comprehensive competitive analysis of the products from two URLs.
    URL 1: ${url1}
    URL 2: ${url2}
    For each product, provide a full analysis using the provided schema (product name, overall rating, review count, sentiment breakdown, top 5 keywords, and 4 sample reviews).
    After analyzing both, provide a concise but insightful comparative summary (3-4 sentences) highlighting the key differentiators, target audiences, and relative strengths/weaknesses.`;
    return callGemini(models.pro, prompt, competitiveAnalysisSchema);
}

// Mocked service for sentiment trends, remains unchanged
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