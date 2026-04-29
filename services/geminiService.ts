
import { GoogleGenAI, Type } from '@google/genai';
import { ProductAnalysisResult, FileAnalysisResult, SingleReviewResult, CompetitiveAnalysisResult, GlobalSearchResult } from '../types';

let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
    if (!aiInstance) {
        const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
        if (!apiKey) {
            throw new Error("Missing Gemini API Key. Please configure VITE_GEMINI_API_KEY in your .env file or environment variables.");
        }
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};

// Shared Sub-schemas
const aspectSchema = {
  type: Type.OBJECT,
  properties: {
    aspect: { type: Type.STRING },
    score: { type: Type.NUMBER, description: "Score from 0 to 100 representing performance in this aspect" },
    sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
  },
  required: ['aspect', 'score', 'sentiment'],
};

const wordCloudSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    value: { type: Type.NUMBER, description: "Frequency or importance of the word" },
  },
  required: ['text', 'value'],
};

// Schemas for structured responses from the AI model
const productAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING },
      price: { type: Type.STRING, description: "The price of the product, e.g., '$99.99' or '₹54,999'" },
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
      aspects: { type: Type.ARRAY, items: aspectSchema },
      wordCloud: { type: Type.ARRAY, items: wordCloudSchema },
      fakeReviewProbability: { type: Type.NUMBER, description: "Probability from 0-100 that some reviews are fake or biased" },
    },
    required: ['productName', 'overallRating', 'reviewCount', 'summary', 'verdict', 'sentiment', 'topPositiveKeywords', 'topNegativeKeywords', 'sampleReviews', 'aspects', 'wordCloud', 'fakeReviewProbability'],
};

const fileAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      totalReviews: { type: Type.INTEGER },
      datasetSummary: { type: Type.STRING, description: "A high-level summary paragraph describing the core themes, major complaints, and things people loved most across the dataset." },
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
      aspects: { type: Type.ARRAY, items: aspectSchema },
      wordCloud: { type: Type.ARRAY, items: wordCloudSchema },
      fakeReviewProbability: { type: Type.NUMBER },
    },
    required: ['totalReviews', 'datasetSummary', 'sentimentDistribution', 'topKeywords', 'aspects', 'wordCloud', 'fakeReviewProbability'],
};

const globalSearchSchema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING },
    bestPrice: { type: Type.STRING, description: "e.g., ₹54,999" },
    bestVerdict: { type: Type.STRING },
    overallSentiment: { type: Type.NUMBER },
    stores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Store name like Amazon India, Flipkart, Reliance Digital" },
          price: { type: Type.NUMBER },
          priceDisplay: { type: Type.STRING },
          rating: { type: Type.NUMBER },
          url: { type: Type.STRING },
        },
        required: ['name', 'price', 'priceDisplay', 'rating', 'url'],
      }
    },
    sentimentBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING },
          positive: { type: Type.NUMBER },
          negative: { type: Type.NUMBER },
          neutral: { type: Type.NUMBER },
        },
        required: ['platform', 'positive', 'negative', 'neutral'],
      }
    },
    priceHistory: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          price: { type: Type.NUMBER },
        },
        required: ['date', 'price'],
      }
    },
    aiInsights: { type: Type.STRING },
    indianMarketSpecifics: { type: Type.STRING, description: "Specifics like local warranty, bank offers, or BIS certification status" },
  },
  required: ['productName', 'bestPrice', 'bestVerdict', 'overallSentiment', 'stores', 'sentimentBreakdown', 'priceHistory', 'aiInsights', 'indianMarketSpecifics'],
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
        comparisonSummary: { type: Type.STRING, description: "A detailed summary comparing the two products." },
        recommendation: {
            type: Type.OBJECT,
            properties: {
                recommendedProduct: { type: Type.STRING, description: "The name of the recommended product, or 'Tie'" },
                reason: { type: Type.STRING, description: "Why this product is recommended over the other, accounting for price and reviews" }
            },
            required: ['recommendedProduct', 'reason']
        }
    },
    required: ['productOne', 'productTwo', 'comparisonSummary', 'recommendation']
};


/**
 * A generic function to call the Gemini API with a given prompt and response schema.
 * This centralizes the API call logic and error handling.
 */
const callGemini = async <T>(modelName: string, prompt: string, schema: any, useSearch: boolean = false, retries: number = 2): Promise<T> => {
    let responseText = '';
    try {
        const ai = getAi();
        const config: any = {};
        
        if (useSearch) {
            config.tools = [{ googleSearch: {} }];
            prompt += '\n\nIMPORTANT: You must output ONLY valid, raw JSON. Do NOT wrap it in markdown code blocks. Do not include any prefixed text. Your response MUST strictly adhere to this JSON Schema (ensure to resolve all types correctly):\n' + JSON.stringify(schema, null, 2);
        } else {
            config.responseMimeType = 'application/json';
            config.responseSchema = schema;
        }

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: config,
        });
        
        const text = response.text;
        responseText = text || '';
        
        if (!text) {
          throw new Error(`Received an empty response from the AI model. Candidate: ${JSON.stringify(response.candidates?.[0]) || 'undefined'}`);
        }
        
        let cleanText = text;
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            cleanText = jsonMatch[1];
        } else {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
                cleanText = text.slice(firstBrace, lastBrace + 1);
            }
        }
        
        return JSON.parse(cleanText);
    } catch (error) {
        console.error(`Error calling Gemini API (retries left: ${retries}):`, error);
        
        // Don't retry auth or quota errors
        if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('Quota exceeded') || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('Request payload size exceeds the limit'))) {
            if (error.message.includes('API key not valid')) {
                throw new Error('The provided API Key is invalid. Please ensure it is configured correctly.', { cause: error });
            }
            if (error.message.includes('Quota exceeded') || error.message.includes('RESOURCE_EXHAUSTED')) {
                throw new Error('API Quota Exceeded. Please try again later or check your API limits. If using the free tier, wait a minute before retrying.', { cause: error });
            }
             if (error.message.includes('Request payload size exceeds the limit')) {
                 throw new Error('The uploaded file is too large. Please use a smaller file.', { cause: error });
            }
            throw error;
        }

        if (retries > 0) {
            console.log(`Retrying API call in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return callGemini(modelName, prompt, schema, useSearch, retries - 1);
        }
        
        let modelText = responseText || '';
        if (modelText.length > 100) modelText = modelText.substring(0, 100) + '...';
        
        throw new Error(`The AI model returned an invalid response (not JSON). Response: "${modelText}" | Error: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
};

export const extractAsin = (url: string): string | null => {
    const match = url.match(/(?:\/dp\/|\/gp\/product\/|\/exec\/obidos\/ASIN\/|dp\/|dp%2F|gp%2Fproduct%2F)([a-zA-Z0-9]{10})/);
    return match ? match[1] : null;
};

export const analyzeProductUrl = async (url: string): Promise<ProductAnalysisResult> => {
    const asin = extractAsin(url);
    const asinDetail = asin ? `\n    AMAZON ASIN DETECTED: ${asin}. You MUST search for "Amazon ${asin}" to find the EXACT product name and details. DO NOT GUESS.` : '';
    
    const prompt = `Critically analyze the EXACT product from this URL: ${url} ${asinDetail}
    
    CRITICAL INSTRUCTION:
    1. If it's an e-commerce URL (like Amazon), extract the ASIN or unique product identifier.
    2. Since you might not be able to directly scrape the URL, you MUST search Google securely using the exact product name, brand, model number, and ASIN to find real reviews for this SPECIFIC product.
    3. Do NOT provide information for a generic, random, or alternative product. You must find actual customer reviews, specifications, and sentiment for the EXACT item linked.
    4. DO NOT refuse to answer. Output a valid JSON matching the schema.

    Provide:
    1. Exact Product name, overall rating out of 5, and total review count.
    2. Sentiment percentages (Positive, Negative, Neutral).
    3. Top 5 impactful positive and 5 negative keywords.
    4. 4 diverse sample reviews.
    5. Aspect-based sentiment: Analyze specific categories like 'Battery', 'Camera', 'Display', 'Performance', 'Value', etc. and provide a score (0-100) and sentiment for each.
    6. Word Cloud data: Provide at least 15 important words/phrases with frequency values.
    7. Fake Review Detection: Analyze patterns in language and metadata to determine the probability (0-100) that some reviews are fabricated or incentivized.
    8. A concise summary and clear verdict.`;
    return callGemini('gemini-2.5-flash', prompt, productAnalysisSchema, true);
};

export const analyzeReviewFile = async (fileContent: string): Promise<FileAnalysisResult> => {
    const prompt = `Analyze the following text which contains multiple product reviews.
    Provide:
    1. Total reviews frequency.
    2. A comprehensive dataset summary highlighting the main themes, overall user satisfaction, and notable trends observed in the provided dataset.
    3. Sentiment distribution.
    4. Top 4 positive and 4 negative keywords.
    5. Aspect-based sentiment: Analyze specific explicit categories (e.g. 'Quality', 'Price', 'Delivery', 'Customer Service', etc.) and provide a score (0-100) and sentiment for each.
    6. Word cloud data (at least 15 items).
    7. Fake review probability for the overall dataset.
    Here is the review data: \n\n${fileContent}`;
    return callGemini('gemini-2.5-flash', prompt, fileAnalysisSchema);
};

export const performGlobalSearch = async (query: string): Promise<GlobalSearchResult> => {
    const prompt = `Search for and synthesize real-time intelligence about the product: "${query}" specifically for the INDIAN MARKET.
    Provide a comprehensive comparison across major Indian e-commerce websites (Amazon.in, Flipkart, Reliance Digital, Croma, Tata CLiQ).
    
    Include:
    1. Best current price in INR (₹).
    2. A "Best Verdict" based on aggregated customer reviews from Indian verified buyers.
    3. Overall sentiment score (0-100).
    4. List of Indian stores with their specific price, rating, and placeholder URL.
    5. Sentiment breakdown per platform (Amazon vs Flipkart etc).
    6. Mock price history for the last 6 points in time to show trends.
    7. Deep AI-generated insights on Indian customer preferences for this product.
    8. Indian market-specific details like upcoming sale eligibility or bank card offers (HDFC, ICICI, etc).
    
    Return the data in the specified JSON structure. Ensure pricing reflects actual current Indian market trends.`;
    return callGemini('gemini-2.5-flash', prompt, globalSearchSchema, true);
};

export const analyzeSingleReview = async (reviewText: string): Promise<SingleReviewResult> => {
    const prompt = `Analyze the sentiment of this review: "${reviewText}". Classify it as 'Positive', 'Negative', or 'Neutral'. Provide a confidence score from 0 to 1. Give a brief, one-sentence explanation for your classification.`;
    return callGemini('gemini-2.5-flash', prompt, singleReviewSchema);
};

export const compareProducts = async (url1: string, url2: string): Promise<CompetitiveAnalysisResult> => {
    const asin1 = extractAsin(url1);
    const asin2 = extractAsin(url2);
    
    const details1 = asin1 ? `[AMAZON ASIN DETECTED: ${asin1}. Search for "Amazon ${asin1}" for EXACT product]` : '';
    const details2 = asin2 ? `[AMAZON ASIN DETECTED: ${asin2}. Search for "Amazon ${asin2}" for EXACT product]` : '';
    
    const prompt = `Perform a comprehensive competitive analysis of the EXACT products from these two URLs:
    URL 1: ${url1} ${details1}
    URL 2: ${url2} ${details2}
    
    CRITICAL INSTRUCTION:
    1. If the URLs are e-commerce URLs (like Amazon), extract their ASINs or unique product identifiers.
    2. Since you might not be able to directly scrape the URLs, you MUST search Google securely using the exact product names, brands, model numbers, and ASINs to find real reviews for these SPECIFIC products.
    3. Do NOT provide information for generic, random, or alternative products. You must find actual customer reviews and feedback for the EXACT items linked.
    4. DO NOT refuse to answer. You MUST output a valid JSON matching the schema.
    
    For each product, provide a full analysis using the provided schema (exact product name, price, overall rating, review count, sentiment breakdown, top 5 keywords, and 4 sample reviews).
    After analyzing both, provide a concise but insightful comparative summary (3-4 sentences) highlighting the key differentiators, target audiences, and relative strengths/weaknesses.
    Crucially, make a final recommendation on which product is best, and explain why (considering both price and review sentiment). Format this recommendation cleanly according to the schema.`;
    return callGemini('gemini-2.5-flash', prompt, competitiveAnalysisSchema, true);
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
