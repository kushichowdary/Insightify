const express = require('express');
const { GoogleGenAI, Type } = require('@google/genai');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("FATAL ERROR: API_KEY environment variable is not set.");
  // In a real production app, you might want to `process.exit(1)`
}

const ai = new GoogleGenAI({ apiKey: apiKey });

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

const sampleDatasetContent = `review,rating,product
"The camera is fantastic, but the battery life is a bit disappointing.",3,Smartphone A
"Incredible performance and a beautiful screen. Best laptop I've ever owned!",5,Laptop B
"It's okay. Does the job but feels a bit cheap for the price.",3,Headphones C
"Battery lasts all day and more! The software is also very smooth.",5,Smartphone A
"Constantly disconnects from Bluetooth. Very frustrating experience.",1,Headphones C
"Great for productivity, but not for gaming. The keyboard is amazing.",4,Laptop B
"Sound quality is mediocre. I expected more from this brand.",2,Headphones C
"The portrait mode on this camera is simply stunning. Highly recommend.",5,Smartphone A
"Heats up way too much when running multiple applications.",2,Laptop B
`;

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

const callGeminiWithSearch = async (res, modelName, prompt) => {
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const text = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map(chunk => chunk.web && { title: chunk.web.title, uri: chunk.web.uri })
            .filter(Boolean) || [];
        
        const parseSection = (header, content) => {
            const regex = new RegExp(`### ${header}\\n([\\s\\S]*?)(?:\\n###|$)`);
            const match = content.match(regex);
            return match ? match[1].trim() : '';
        };

        const parseList = (rawText) => rawText.split('\n').map(s => s.replace(/^-|\*|•/,'').trim()).filter(Boolean);

        const parseSubList = (rawText, subheader) => {
            const regex = new RegExp(`- \\*\\*${subheader}:\\*\\*([\\s\\S]*?)(?:\\n- \\*\\*|$)`);
            const match = rawText.match(regex);
            return match ? parseList(match[1]) : [];
        };
        
        const scoreText = parseSection('Overall Score', text);
        const overallScore = parseFloat(scoreText.match(/(\d+(\.\d+)?)/)?.[0] || '0');
        const sentiment = scoreText.includes('Positive') ? 'Positive' : scoreText.includes('Negative') ? 'Negative' : 'Neutral';

        const summary = parseSection('Summary', text);
        
        const themesText = parseSection('Key Themes', text);
        const positiveThemes = parseSubList(themesText, 'Positive');
        const negativeThemes = parseSubList(themesText, 'Negative');
        const neutralThemes = parseSubList(themesText, 'Neutral');
        
        const recentNews = parseList(parseSection('Recent News', text));
        
        const swotText = parseSection('SWOT Analysis', text);
        const strengths = parseSubList(swotText, 'Strengths');
        const weaknesses = parseSubList(swotText, 'Weaknesses');
        const opportunities = parseSubList(swotText, 'Opportunities');
        const threats = parseSubList(swotText, 'Threats');

        const result = {
            overallScore,
            sentiment,
            summary,
            keyThemes: {
                positive: positiveThemes,
                negative: negativeThemes,
                neutral: neutralThemes,
            },
            recentNews,
            swot: {
                strengths,
                weaknesses,
                opportunities,
                threats,
            },
            sources,
        };
        
        res.json(result);

    } catch (error) {
        console.error('Error calling Gemini API with search:', error);
        res.status(500).json({ error: 'Failed to get response from AI model with search grounding.' });
    }
};

app.post('/api/analyze-url', (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required.' });

    const prompt = `Critically analyze the product reviews from the URL: ${url}. Provide the product name, overall rating out of 5, and total review count. Summarize the sentiment as percentages for positive, negative, and neutral (ensure they sum to 100). Extract the top 5 most impactful positive keywords and top 5 negative keywords. Also, provide 4 diverse sample reviews with their corresponding sentiment ('Positive', 'Negative', or 'Neutral').`;
    
    callGemini(res, 'gemini-2.5-pro', prompt, productAnalysisSchema);
});

app.post('/api/analyze-file', (req, res) => {
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

app.post('/api/analyze-review', (req, res) => {
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

app.post('/api/compare-products', (req, res) => {
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

app.post('/api/analyze-brand', (req, res) => {
    const { brandName } = req.body;
    if (!brandName) return res.status(400).json({ error: 'Brand name is required.' });

    const prompt = `Perform a comprehensive brand reputation analysis for the brand "${brandName}" using up-to-date information from the web. Structure your response in Markdown with the following exact headers:\n\n### Overall Score\nProvide a score out of 10 and a one-word sentiment (Positive, Negative, or Neutral). Example: 8.5/10 (Positive)\n\n### Summary\nProvide a 2-3 sentence summary of the brand's current reputation.\n\n### Key Themes\n- **Positive:** (3-5 bullet points)\n- **Negative:** (3-5 bullet points)\n- **Neutral:** (2-3 bullet points)\n\n### Recent News\nSummarize 3-4 recent significant news events or public discussions in bullet points.\n\n### SWOT Analysis\n- **Strengths:** (2-3 bullet points)\n- **Weaknesses:** (2-3 bullet points)\n- **Opportunities:** (2-3 bullet points)\n- **Threats:** (2-3 bullet points)`;
    
    callGeminiWithSearch(res, 'gemini-2.5-pro', prompt);
});

app.post('/api/dataset-qa', async (req, res) => {
    const { datasetId, question } = req.body; // datasetId is for future use
    if (!question) return res.status(400).json({ error: 'Question is required.' });

    // In a real app, you'd fetch dataset content from a DB based on datasetId
    const contextData = sampleDatasetContent; 

    const prompt = `You are an expert data analyst for an e-commerce intelligence platform. Your task is to answer questions based *only* on the provided dataset of product reviews. Be concise and helpful. If the answer cannot be found in the data, say so.

    --- DATASET (CSV format) ---
    ${contextData}
    --------------------------

    --- USER'S QUESTION ---
    ${question}
    -----------------------

    Your Answer:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        res.json({ answer: response.text });
    } catch (error) {
        console.error('Error in /api/dataset-qa:', error);
        res.status(500).json({ error: 'Failed to get response from AI model for dataset Q&A.' });
    }
});


app.listen(port, () => {
  console.log(`Insightify backend listening at http://localhost:${port}`);
});