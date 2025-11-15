const express = require('express');
const { GoogleGenAI, Type } = require('@google/genai');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const productAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING },
    overallRating: { type: Type.NUMBER },
    reviewCount: { type: Type.INTEGER },
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
  required: ['productName', 'overallRating', 'reviewCount', 'sentiment', 'topPositiveKeywords', 'topNegativeKeywords', 'sampleReviews'],
};

const callGemini = async (res, modelName, prompt, schema) => {
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });
        const parsed = JSON.parse(response.text);
        res.json(parsed);
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to get response from AI model.' });
    }
};

app.post('/analyze-url', (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required.' });

    const prompt = `Critically analyze the product reviews from the URL: ${url}. Provide the product name, overall rating out of 5, and total review count. Summarize the sentiment as percentages for positive, negative, and neutral (ensure they sum to 100). Extract the top 5 most impactful positive keywords and top 5 negative keywords. Also, provide 4 diverse sample reviews with their corresponding sentiment ('Positive', 'Negative', or 'Neutral').`;
    
    callGemini(res, 'gemini-2.5-pro', prompt, productAnalysisSchema);
});

app.post('/analyze-file', (req, res) => {
    const { fileContent } = req.body;
    if (!fileContent) return res.status(400).json({ error: 'File content is required.' });

    const prompt = `Analyze the following text which contains multiple product reviews. Provide the total number of reviews found. Calculate the sentiment distribution as percentages for positive, negative, and neutral (summing to 100). Extract the top 4 most common positive and top 4 negative keywords from the entire text. Here is the review data: \n\n${fileContent}`;
    
    const schema = {
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

    callGemini(res, 'gemini-2.5-flash', prompt, schema);
});

app.post('/analyze-review', (req, res) => {
    const { reviewText } = req.body;
    if (!reviewText) return res.status(400).json({ error: 'Review text is required.' });

    const prompt = `Analyze the sentiment of this review: "${reviewText}". Classify it as 'Positive', 'Negative', or 'Neutral'. Provide a confidence score from 0 to 1. Give a brief, one-sentence explanation for your classification.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
          sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
        },
        required: ['sentiment', 'confidence', 'explanation'],
    };

    callGemini(res, 'gemini-2.5-flash', prompt, schema);
});

app.post('/compare-products', (req, res) => {
    const { url1, url2 } = req.body;
    if (!url1 || !url2) return res.status(400).json({ error: 'Two URLs are required.' });

    const prompt = `Perform a comprehensive competitive analysis of the products from two URLs.
    URL 1: ${url1}
    URL 2: ${url2}
    For each product, provide a full analysis using the provided schema (product name, overall rating, review count, sentiment breakdown, top 5 keywords, and 4 sample reviews).
    After analyzing both, provide a concise but insightful comparative summary (3-4 sentences) highlighting the key differentiators, target audiences, and relative strengths/weaknesses.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            productOne: productAnalysisSchema,
            productTwo: productAnalysisSchema,
            comparisonSummary: { type: Type.STRING, description: "A detailed summary comparing the two products." }
        },
        required: ['productOne', 'productTwo', 'comparisonSummary']
    };

    callGemini(res, 'gemini-2.5-pro', prompt, schema);
});


module.exports = app;