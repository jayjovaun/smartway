/**
 * SmartWay AI Study Companion - Serverless Production Server
 * Fixed for Vercel deployment - resolves path-to-regexp route errors
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Dynamic imports for serverless compatibility
let pdfParse, mammoth;
try {
  pdfParse = require('pdf-parse');
  mammoth = require('mammoth');
  console.log('[INFO] Document processing packages loaded successfully');
} catch (error) {
  console.error('[ERROR] Failed to load document processing packages:', error.message);
}

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Enhanced logging
const logger = {
  info: (message, data = {}) => console.log(`[INFO] ${message}`, data),
  error: (message, error = {}) => console.error(`[ERROR] ${message}`, error),
  debug: (message, data = {}) => IS_PRODUCTION ? null : console.log(`[DEBUG] ${message}`, data)
};

logger.info('🚀 Starting SmartWay AI Study Companion Server', {
  nodeEnv: NODE_ENV,
  port: PORT,
  apiKeyPresent: !!process.env.GEMINI_API_KEY
});

// Validate environment variables
if (!process.env.GEMINI_API_KEY) {
  logger.error('GEMINI_API_KEY is not set. The application will not work without it.');
  if (IS_PRODUCTION) {
    process.exit(1);
  }
}

logger.info('Environment variables validated successfully');

// Middleware
app.use(cors({
  origin: IS_PRODUCTION ? true : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    apiKeyPresent: !!process.env.GEMINI_API_KEY
  });
});

// Utility functions
const generateRequestId = () => Math.random().toString(36).substring(2, 9);

const extractTextFromBuffer = async (buffer, contentType) => {
  logger.debug('Processing document...', { contentType });
  
  try {
    if (contentType === 'application/pdf') {
      if (!pdfParse) throw new Error('PDF processing not available');
      logger.debug('Processing PDF document...');
      const pdfData = await pdfParse(buffer);
      logger.debug('PDF text extracted successfully', { textLength: pdfData.text.length });
      return pdfData.text;
    }
    
    if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        contentType === 'application/msword') {
      if (!mammoth) throw new Error('Word document processing not available');
      logger.debug('Processing Word document...');
      const result = await mammoth.extractRawText({ buffer });
      logger.debug('Word text extracted successfully', { textLength: result.value.length });
      return result.value;
    }
    
    if (contentType && contentType.startsWith('text/')) {
      const text = buffer.toString('utf-8');
      logger.debug('Text file processed successfully', { textLength: text.length });
      return text;
    }
    
    throw new Error(`Unsupported file type: ${contentType}`);
  } catch (error) {
    logger.error('Text extraction failed:', error);
    throw new Error(`Failed to extract text from document: ${error.message}`);
  }
};

const processFileUrl = async (fileUrl) => {
  const downloadTimeout = 120000; // 2 minutes for large files
  
  try {
    logger.debug('Downloading file from URL:', fileUrl);
    
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: downloadTimeout,
      headers: {
        'User-Agent': 'SmartWay-AI-Study-Companion/1.0'
      }
    });

    const buffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    logger.debug('Downloaded file successfully', {
      contentType,
      size: buffer.length,
      url: fileUrl.substring(0, 80) + '...'
    });

    const extractedText = await extractTextFromBuffer(buffer, contentType);
    logger.debug('Text extraction completed', {
      textLength: extractedText.length,
      wordCount: extractedText.split(/\s+/).length
    });

    return extractedText;
  } catch (error) {
    logger.error('File processing failed:', error);
    if (error.code === 'ENOTFOUND') {
      throw new Error('File URL not accessible. Please check the link.');
    }
    if (error.code === 'ETIMEDOUT') {
      throw new Error('File download timed out. Please try with a smaller file.');
    }
    throw new Error(`Failed to process file: ${error.message}`);
  }
};

// Generation endpoint
app.post('/api/generate', async (req, res) => {
  const requestId = generateRequestId();
  logger.info(`[${requestId}] New generation request`);

  try {
    let content = '';
    const { text, fileUrl } = req.body;

    if (fileUrl) {
      logger.debug(`[${requestId}] Processing file URL`);
      content = await processFileUrl(fileUrl);
    } else if (text) {
      logger.debug(`[${requestId}] Processing text input`);
      content = text;
    } else {
      return res.status(400).json({
        error: 'No content provided. Please provide either text or fileUrl.',
        requestId
      });
    }

    // Content validation and optimization
    const wordCount = content.split(/\s+/).length;
    logger.debug(`[${requestId}] Content validated`, {
      length: content.length,
      wordCount
    });

    // Smart content optimization for very large content
    let processedContent = content;
    let contentNote = '';

    if (content.length > 100000) {
      processedContent = content.substring(0, 100000);
      contentNote = `Note: Content was truncated from ${content.length} to 100,000 characters for processing. Full content analysis may require splitting into smaller sections.`;
      logger.debug(`[${requestId}] Content truncated for processing`, {
        originalLength: content.length,
        processedLength: processedContent.length
      });
    }

    // Gemini API call
    const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    
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

    const response = await axios.post(
      `${geminiApiUrl}?key=${process.env.GEMINI_API_KEY}`,
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
        timeout: 120000 // 2 minutes
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    // Parse JSON response
    let studyPack;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      studyPack = JSON.parse(jsonMatch[0]);
      
      // Add content note if content was truncated
      if (contentNote) {
        studyPack.contentNote = contentNote;
      }
      
    } catch (parseError) {
      logger.error(`[${requestId}] JSON parse failed:`, parseError);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    logger.info('AI response processed successfully', {
      flashcardCount: studyPack.flashcards?.length || 0,
      quizCount: studyPack.quiz?.length || 0
    });

    logger.info(`[${requestId}] Study pack generated successfully`, {
      flashcards: studyPack.flashcards?.length || 0,
      questions: studyPack.quiz?.length || 0
    });

    res.json(studyPack);

  } catch (error) {
    logger.error(`[${requestId}] Generation failed`, { error: error.message });
    
    if (error.response?.status === 503) {
      logger.error('Gemini API error', {
        status: error.response.status,
        data: error.response.data
      });
      return res.status(503).json({
        error: 'AI service error. Please try again.',
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

// Serve static files in production
if (IS_PRODUCTION) {
  const frontendPath = path.join(__dirname, 'dist');
  app.use(express.static(frontendPath));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Start server
if (!IS_PRODUCTION) {
  app.listen(PORT, () => {
    logger.info('🚀 SmartWay Server started successfully', {
      port: PORT,
      environment: NODE_ENV,
      frontendPath: IS_PRODUCTION ? path.join(__dirname, 'dist') : 'Development mode',
      apiHealth: `http://localhost:${PORT}/api/health`
    });
  });
}

// Export for Vercel
module.exports = app; 