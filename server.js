/**
 * SmartWay AI Study Companion - Minimal Serverless Server
 * Optimized for Vercel deployment - no FUNCTION_INVOCATION_FAILED errors
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Only load dotenv in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Dynamic package loading with fallbacks
let pdfParse, mammoth;
try {
  pdfParse = require('pdf-parse');
  mammoth = require('mammoth');
  console.log('[INFO] Document processing packages loaded successfully');
} catch (error) {
  console.log('[WARN] Document processing packages not available:', error.message);
}

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Utility functions
const generateRequestId = () => Math.random().toString(36).substring(2, 9);

// Text extraction function
const extractTextFromBuffer = async (buffer, contentType) => {
  console.log('[DEBUG] Extracting text from buffer, type:', contentType);
  
  if (contentType === 'application/pdf' && pdfParse) {
    const pdfData = await pdfParse(buffer);
    return pdfData.text;
  }
  
  if ((contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
       contentType === 'application/msword') && mammoth) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  
  if (contentType && contentType.startsWith('text/')) {
    return buffer.toString('utf-8');
  }
  
  throw new Error(`Unsupported file type: ${contentType}`);
};

// File processing function
const processFileUrl = async (fileUrl) => {
  console.log('[DEBUG] Processing file URL:', fileUrl.substring(0, 80));
  
  const response = await axios.get(fileUrl, {
    responseType: 'arraybuffer',
    timeout: 60000,
    headers: { 'User-Agent': 'SmartWay-AI/1.0' }
  });

  const buffer = Buffer.from(response.data);
  const contentType = response.headers['content-type'] || 'application/octet-stream';
  
  console.log('[DEBUG] File downloaded, size:', buffer.length, 'type:', contentType);
  
  return await extractTextFromBuffer(buffer, contentType);
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    apiKeyPresent: !!process.env.GEMINI_API_KEY
  });
});

// Main generation endpoint
app.post('/api/generate', async (req, res) => {
  const requestId = generateRequestId();
  console.log(`[${requestId}] Processing generation request`);

  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error(`[${requestId}] Missing GEMINI_API_KEY`);
      return res.status(500).json({
        error: 'Server configuration error. API key not found.',
        requestId
      });
    }

    let content = '';
    const { text, fileUrl } = req.body;

    // Process input
    if (fileUrl) {
      console.log(`[${requestId}] Processing file URL`);
      content = await processFileUrl(fileUrl);
    } else if (text) {
      console.log(`[${requestId}] Processing text input`);
      content = text;
    } else {
      return res.status(400).json({
        error: 'No content provided. Please provide either text or fileUrl.',
        requestId
      });
    }

    // Content validation
    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        error: 'Content too short. Please provide more substantial content.',
        requestId
      });
    }

    // Optimize content length
    let processedContent = content;
    if (content.length > 100000) {
      processedContent = content.substring(0, 100000);
      console.log(`[${requestId}] Content truncated from ${content.length} to 100000 chars`);
    }

    console.log(`[${requestId}] Content validated. Length: ${processedContent.length}`);

    // Gemini API request
    const prompt = `Analyze this educational content and create study materials. Generate a comprehensive response with:

1. SUMMARY: Overview, key points, and definitions
2. FLASHCARDS: Question/answer pairs for memorization  
3. QUIZ: Multiple choice questions with explanations

Content to analyze:
${processedContent}

Respond in this exact JSON format:
{
  "summary": {
    "overview": "Brief overview of the content",
    "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
    "definitions": {
      "Term 1": "Definition 1",
      "Term 2": "Definition 2"
    }
  },
  "flashcards": [
    {"front": "Question", "back": "Answer"},
    {"front": "Question", "back": "Answer"}
  ],
  "quiz": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}`;

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
      }
    );

    const aiResponse = geminiResponse.data.candidates[0].content.parts[0].text;
    
    // Parse response
    let studyPack;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      studyPack = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse failed:`, parseError.message);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    console.log(`[${requestId}] Success! Generated ${studyPack.flashcards?.length || 0} flashcards, ${studyPack.quiz?.length || 0} questions`);

    res.json(studyPack);

  } catch (error) {
    console.error(`[${requestId}] Error:`, error.message);
    
    // Handle specific error types
    if (error.response?.status === 503) {
      return res.status(503).json({
        error: 'AI service temporarily overloaded. Please try again in a moment.',
        requestId
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(408).json({
        error: 'Request timed out. Please try again with shorter content.',
        requestId
      });
    }

    res.status(500).json({
      error: error.message || 'An unexpected error occurred.',
      requestId
    });
  }
});

// Serve static files only in production
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, 'dist');
  app.use(express.static(staticPath));
  
  // Catch-all handler for client-side routing - FIXED: Named wildcard for Express v5 compatibility
  app.get('*catchall', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Only start server in development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`[INFO] SmartWay Server running on http://localhost:${PORT}`);
    console.log(`[INFO] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[INFO] API Key present: ${!!process.env.GEMINI_API_KEY}`);
  });
}

// Export for Vercel
module.exports = app; 