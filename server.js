/**
 * SmartWay AI Study Companion - Production Server
 * Enhanced for Vercel serverless deployment with error handling
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load environment variables first
dotenv.config();

// Initialize app early for error handling
const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Enhanced logging
const logger = {
  info: (message, data = {}) => console.log(`[INFO] ${message}`, data),
  error: (message, error = {}) => console.error(`[ERROR] ${message}`, error),
  debug: (message, data = {}) => {
    if (!IS_PRODUCTION) console.log(`[DEBUG] ${message}`, data);
  }
};

// Check critical environment variables
const checkEnvironment = () => {
  const requiredEnvVars = ['GEMINI_API_KEY'];
  const missing = requiredEnvVars.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    logger.error('Missing critical environment variables:', { missing });
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  logger.info('Environment variables validated successfully');
};

// Dynamic package loading with fallbacks
let pdfParse, mammoth;
let documentsSupported = true;

const loadDocumentProcessingPackages = async () => {
  try {
    pdfParse = require('pdf-parse');
    mammoth = require('mammoth');
    logger.info('Document processing packages loaded successfully');
    documentsSupported = true;
  } catch (error) {
    logger.error('Document processing packages not available in this environment:', error.message);
    documentsSupported = false;
    // Create fallback functions
    pdfParse = null;
    mammoth = null;
  }
};

logger.info('🚀 Starting SmartWay AI Study Companion Server', {
  nodeEnv: NODE_ENV,
  port: PORT,
  apiKeyPresent: !!process.env.GEMINI_API_KEY
});

// Check environment and load packages
try {
  checkEnvironment();
  loadDocumentProcessingPackages();
} catch (error) {
  logger.error('Startup failed:', error.message);
  if (IS_PRODUCTION) {
    // In production, continue with limited functionality
    documentsSupported = false;
  } else {
    process.exit(1);
  }
}

// Middleware
app.use(cors({
  origin: IS_PRODUCTION ? 
    ['https://smartway-mvp-version.vercel.app', 'https://smartway-ai.vercel.app'] : 
    ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
const buildPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath, {
    maxAge: IS_PRODUCTION ? '1d' : '0'
  }));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: NODE_ENV,
    documentsSupported,
    timestamp: new Date().toISOString()
  });
});

// Validation functions
const validateInput = {
  text: (text) => {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input');
    }
    const sanitized = text.trim();
    if (sanitized.length < 20) {
      throw new Error('Text input too short. Please provide at least 20 characters.');
    }
    if (sanitized.length > 200000) {
      throw new Error('Text input too long. Please limit to 200,000 characters.');
    }
    return sanitized;
  },
  
  fileUrl: (url) => {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid file URL');
    }
    try {
      new URL(url);
      return url;
    } catch (error) {
      throw new Error('Invalid file URL format');
    }
  }
};

// Content optimization for large texts
const optimizeContentForProcessing = (content) => {
  const maxTokens = 100000; // Conservative limit for token processing
  
  if (content.length <= maxTokens) {
    return content;
  }
  
  // For very large content, take the first portion and summarize the rest
  const mainContent = content.substring(0, maxTokens * 0.7);
  const remainingContent = content.substring(maxTokens * 0.7);
  
  // Add a note about the additional content
  const optimized = mainContent + 
    `\n\n[Note: This document contains additional content (${remainingContent.length} more characters) ` +
    `that has been truncated for processing. The study materials above represent the main content.]`;
    
  return optimized;
};

// AI Processing with Gemini
const processWithGemini = async (content) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please check environment variables.');
  }

  // Optimize content for processing
  const processedContent = optimizeContentForProcessing(content);
  const wordCount = processedContent.split(/\s+/).length;
  const flashcardCount = Math.max(5, Math.min(20, Math.floor(wordCount / 40)));
  const questionCount = Math.max(3, Math.min(12, Math.floor(wordCount / 80)));

  const prompt = `You are an expert educational content creator. Analyze the following study material and create a comprehensive study pack with exactly ${flashcardCount} flashcards and ${questionCount} quiz questions.

STUDY MATERIAL:
${processedContent}

Create a JSON response with this EXACT structure:
{
  "summary": {
    "overview": "A clear, concise overview of the main topic (2-3 sentences)",
    "keyPoints": [
      "Key concept 1",
      "Key concept 2", 
      "Key concept 3",
      "Key concept 4",
      "Key concept 5"
    ],
    "definitions": {
      "Term 1": "Clear definition",
      "Term 2": "Clear definition"
    }
  },
  "flashcards": [
    {
      "front": "Question or concept to test",
      "back": "Clear, comprehensive answer"
    }
  ],
  "quiz": [
    {
      "question": "Multiple choice question text",
      "options": [
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
      ],
      "correct": 0,
      "explanation": "Clear explanation of why this answer is correct"
    }
  ]
}

REQUIREMENTS:
- Generate exactly ${flashcardCount} flashcards and ${questionCount} quiz questions
- Use ONLY information from the provided material
- Make flashcards test key concepts and understanding
- Ensure quiz questions test comprehension, not just memorization
- All quiz questions must have exactly 4 options
- Provide detailed explanations for quiz answers
- Use clear, educational language
- Ensure JSON is valid and properly formatted`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await axios.post(geminiUrl, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.7,
        maxOutputTokens: 6000,
        topP: 0.9,
        topK: 40
      }
    }, {
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'SmartWay/1.0'
      },
      timeout: 120000 // 2 minutes for serverless environment
    });
    
    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('AI service returned empty response');
    }

    // Parse response
    let cleanText = generatedText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanText);
      
      // Validate structure
      if (!parsed.summary || !parsed.flashcards || !parsed.quiz) {
        throw new Error('Invalid response structure from AI service');
      }

      return parsed;
    } catch (parseError) {
      logger.error('Failed to parse AI response:', parseError);
      throw new Error('AI service returned invalid JSON response');
    }
    
  } catch (error) {
    if (error.response?.status === 503) {
      logger.error('Gemini API error', { 
        status: error.response.status,
        data: error.response.data 
      });
      throw new Error('AI service is temporarily unavailable. Please try again in a few moments.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again with shorter content.');
    } else {
      logger.error('Unexpected error calling Gemini API:', error);
      throw new Error('AI service error. Please try again.');
    }
  }
};

// Enhanced text extraction with fallbacks
const extractTextFromBuffer = async (buffer, contentType, fileUrl = '') => {
  if (!documentsSupported) {
    throw new Error('Document processing is not available in this environment. Please use text input instead.');
  }

  const getFileType = (contentType, url) => {
    if (contentType?.includes('pdf') || url.toLowerCase().includes('.pdf')) return 'pdf';
    if (contentType?.includes('word') || contentType?.includes('document') || 
        url.toLowerCase().match(/\.(docx?|rtf)$/)) return 'word';
    if (contentType?.includes('text') || url.toLowerCase().includes('.txt')) return 'text';
    return 'unknown';
  };

  const fileType = getFileType(contentType, fileUrl);
  
  try {
    switch (fileType) {
      case 'pdf':
        if (!pdfParse) {
          throw new Error('PDF processing not available');
        }
        logger.debug('Processing PDF document...', {});
        const pdfData = await pdfParse(buffer);
        const text = pdfData.text?.trim();
        if (!text || text.length < 50) {
          throw new Error('PDF appears to be empty, corrupted, or contains only images. Please ensure the PDF has extractable text content.');
        }
        logger.debug('PDF text extracted successfully', { textLength: text.length });
        return text;

      case 'word':
        if (!mammoth) {
          throw new Error('Word document processing not available');
        }
        logger.debug('Processing Word document...', {});
        const result = await mammoth.extractRawText({ buffer });
        const wordText = result.value?.trim();
        if (!wordText || wordText.length < 50) {
          throw new Error('Word document appears to be empty or corrupted. Please check the file and try again.');
        }
        logger.debug('Word text extracted successfully', { textLength: wordText.length });
        return wordText;

      case 'text':
        logger.debug('Processing text file...', {});
        const textContent = buffer.toString('utf-8').trim();
        if (!textContent || textContent.length < 50) {
          throw new Error('Text file appears to be empty. Please provide a file with content.');
        }
        logger.debug('Text file processed successfully', { textLength: textContent.length });
        return textContent;

      default:
        throw new Error(`Unsupported file type: ${contentType || 'unknown'}. Please upload a PDF, Word document (.docx/.doc), or text file (.txt).`);
    }
  } catch (error) {
    if (error.message.includes('not available')) {
      throw error; // Pass through availability errors
    }
    
    // Enhanced error messages based on common issues
    if (error.message.includes('Invalid PDF') || error.message.includes('PDF syntax')) {
      throw new Error('This PDF file appears to be corrupted or uses an unsupported format. Please try a different PDF file.');
    }
    if (error.message.includes('password') || error.message.includes('encrypted')) {
      throw new Error('This document is password-protected or encrypted. Please provide an unlocked version.');
    }
    
    logger.error('Text extraction failed:', error);
    throw new Error(`Failed to extract text from ${fileType} file: ${error.message}`);
  }
};

// File URL processing with enhanced error handling
const processFileUrl = async (fileUrl) => {
  try {
    logger.debug('Downloading file from URL:', fileUrl);
    
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 120000, // 2 minutes for large files
      maxContentLength: 52428800, // 50MB
      headers: {
        'User-Agent': 'SmartWay-FileProcessor/1.0'
      }
    });

    const buffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || '';
    
    logger.debug('Downloaded file successfully', {
      contentType,
      size: buffer.length,
      url: fileUrl.substring(0, 100) + '...'
    });

    const extractedText = await extractTextFromBuffer(buffer, contentType, fileUrl);
    const wordCount = extractedText.split(/\s+/).length;
    
    logger.debug('Text extraction completed', { 
      textLength: extractedText.length, 
      wordCount 
    });
    
    return extractedText;
    
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('File download timed out. The file may be too large or the connection is slow. Please try with a smaller file.');
    }
    if (error.response?.status === 404) {
      throw new Error('File not found. The file may have been deleted or the URL is incorrect.');
    }
    if (error.response?.status === 403) {
      throw new Error('Access denied. The file may be private or require authentication.');
    }
    if (error.message.includes('maxContentLength')) {
      throw new Error('File too large. Please upload files smaller than 50MB.');
    }
    
    logger.error('File processing failed:', error);
    throw new Error('Failed to download or process file. Please check the file URL and try again.');
  }
};

// Main generation endpoint with comprehensive error handling
app.post('/api/generate1', async (req, res) => {
  const requestId = Math.random().toString(36).substring(2, 15);
  
  try {
    logger.info(`[${requestId}] New generation request`, {});
    
    const { text, fileUrl } = req.body;
    let content;

    if (text) {
      logger.debug(`[${requestId}] Processing text input`, {});
      content = validateInput.text(text);
    } else if (fileUrl) {
      if (!documentsSupported) {
        return res.status(503).json({
          error: 'File processing is not available in this environment. Please use text input instead.',
          supportedMethods: ['text']
        });
      }
      
      logger.debug(`[${requestId}] Processing file URL`, {});
      const validatedUrl = validateInput.fileUrl(fileUrl);
      content = await processFileUrl(validatedUrl);
    } else {
      return res.status(400).json({
        error: 'Either text or fileUrl is required'
      });
    }

    // Validate content length
    logger.debug(`[${requestId}] Content validated`, { 
      length: content.length, 
      wordCount: content.split(/\s+/).length 
    });

    // Process with AI
    const result = await processWithGemini(content);
    
    logger.info('AI response processed successfully', { 
      flashcardCount: result.flashcards?.length || 0,
      quizCount: result.quiz?.length || 0
    });

    logger.info(`[${requestId}] Study pack generated successfully`, {
      flashcards: result.flashcards?.length || 0,
      questions: result.quiz?.length || 0
    });

    res.json(result);

  } catch (error) {
    logger.error(`[${requestId}] Generation failed`, { error: error.message });
    
    // Return appropriate error codes
    if (error.message.includes('not configured') || error.message.includes('environment variables')) {
      res.status(500).json({ error: 'Server configuration error. Please contact support.' });
    } else if (error.message.includes('temporarily unavailable')) {
      res.status(503).json({ error: error.message });
    } else if (error.message.includes('too large') || error.message.includes('too long')) {
      res.status(413).json({ error: error.message });
    } else if (error.message.includes('Invalid') || error.message.includes('required')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Catch-all route for frontend
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Application not found' });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: IS_PRODUCTION ? 'Please try again later' : error.message
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info('🚀 SmartWay Server started successfully', {
    port: PORT,
    environment: NODE_ENV,
    frontendPath: buildPath,
    apiHealth: `http://localhost:${PORT}/api/health`,
    documentsSupported
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app; 