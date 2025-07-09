/**
 * SmartWay AI Study Companion - Working Production Server
 * Fixed path-to-regexp issue by avoiding problematic route patterns
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Logging
const logger = {
  info: (message, data = {}) => console.log(`[INFO] ${message}`, data),
  error: (message, error = {}) => console.error(`[ERROR] ${message}`, error),
  debug: (message, data = {}) => {
    if (!IS_PRODUCTION) console.log(`[DEBUG] ${message}`, data);
  }
};

logger.info('🚀 Starting SmartWay AI Study Companion Server', {
  nodeEnv: NODE_ENV,
  port: PORT,
  apiKeyPresent: !!process.env.GEMINI_API_KEY
});

// Middleware
app.use(cors({
  origin: IS_PRODUCTION ? 
    ['https://smartway-ai.vercel.app'] : 
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
    throw new Error('Gemini API key not configured');
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
      timeout: 120000 // Increased to 2 minutes for larger content
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
    
    const parsed = JSON.parse(cleanText);
    
    // Validate structure
    if (!parsed.summary?.overview || !parsed.flashcards || !parsed.quiz) {
      throw new Error('Invalid response structure');
    }
    
    if (!Array.isArray(parsed.flashcards) || parsed.flashcards.length === 0) {
      throw new Error('No flashcards generated');
    }
    
    if (!Array.isArray(parsed.quiz) || parsed.quiz.length === 0) {
      throw new Error('No quiz questions generated');
    }
    
    logger.info('AI response processed successfully', {
      flashcardCount: parsed.flashcards.length,
      quizCount: parsed.quiz.length
    });
    
    return parsed;
    
  } catch (error) {
    if (error.response) {
      logger.error('Gemini API error', {
        status: error.response.status,
        data: error.response.data
      });
      
      if (error.response.status === 429) {
        throw new Error('AI service is temporarily busy. Please try again in a moment.');
      } else if (error.response.status === 403) {
        throw new Error('API key is invalid or has insufficient permissions.');
      } else {
        throw new Error('AI service error. Please try again.');
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Processing timed out due to large content size. The content is being processed - please wait and try again if needed.');
    } else {
      throw error;
    }
  }
};

// Extract text from buffer based on file type
const extractTextFromBuffer = async (buffer, contentType, fileUrl = '') => {
  try {
    // Determine file type from URL extension or content-type
    const isTextFile = contentType.includes('text/plain') || fileUrl.endsWith('.txt');
    const isPdf = contentType.includes('application/pdf') || fileUrl.endsWith('.pdf');
    const isWord = contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
                   contentType.includes('application/msword') || 
                   fileUrl.endsWith('.docx') || fileUrl.endsWith('.doc');

    if (isTextFile) {
      const text = buffer.toString('utf-8');
      if (!text.trim()) {
        throw new Error('Text file is empty.');
      }
      return text;
    } 
    
    if (isPdf) {
      logger.debug('Processing PDF document...');
      const pdfData = await pdfParse(buffer);
      if (!pdfData.text || pdfData.text.trim().length === 0) {
        throw new Error('No text content could be extracted from the PDF. The document may be image-based, encrypted, or corrupted.');
      }
      logger.debug('PDF text extracted successfully', { textLength: pdfData.text.length });
      return pdfData.text;
    }
    
    if (isWord) {
      logger.debug('Processing Word document...');
      let result;
      
      if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || fileUrl.endsWith('.docx')) {
        // Modern .docx format
        result = await mammoth.extractRawText({ buffer });
      } else {
        // Older .doc format - mammoth can sometimes handle these too
        try {
          result = await mammoth.extractRawText({ buffer });
        } catch (docError) {
          throw new Error('Cannot process older .doc files. Please convert to .docx format or save as PDF.');
        }
      }
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('No text content could be extracted from the Word document. The document may be empty or corrupted.');
      }
      
      logger.debug('Word document text extracted successfully', { textLength: result.value.length });
      return result.value;
    }
    
    // Try to process as text anyway (for cases where content-type is wrong)
    const text = buffer.toString('utf-8');
    if (text.length > 50 && !text.includes('\u0000')) { // Check for binary content
      logger.debug('Processing file as text despite unknown content-type');
      return text;
    }
    
    throw new Error('Unsupported file type. Please upload PDF (.pdf), Word (.docx, .doc), or text (.txt) files.');
    
  } catch (error) {
    // Re-throw specific errors
    if (error.message.includes('No text content could be extracted') || 
        error.message.includes('Cannot process older .doc files') ||
        error.message.includes('Unsupported file type')) {
      throw error;
    }
    
    // Handle parsing errors
    if (error.message.includes('Invalid PDF') || error.message.includes('PDF')) {
      throw new Error('Invalid or corrupted PDF file. Please check the file and try again.');
    }
    
    if (error.message.includes('password')) {
      throw new Error('Password-protected documents are not supported. Please remove the password and try again.');
    }
    
    throw new Error('Failed to process the uploaded file. Please check the file format and try again.');
  }
};

// File processing with full document support
const processFileUrl = async (fileUrl) => {
  try {
    logger.debug('Downloading file from URL:', fileUrl);
    
    const response = await axios.get(fileUrl, {
      timeout: 120000, // 2 minutes for large files
      maxContentLength: 50 * 1024 * 1024, // 50MB limit
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'SmartWay/1.0'
      }
    });
    
    const contentType = response.headers['content-type'] || '';
    const buffer = Buffer.from(response.data);
    
    logger.debug('Downloaded file successfully', {
      contentType,
      size: buffer.length,
      url: fileUrl.substring(0, 100) + (fileUrl.length > 100 ? '...' : '')
    });
    
    // Extract text using the dedicated function
    const extractedText = await extractTextFromBuffer(buffer, contentType, fileUrl);
    
    if (!extractedText || extractedText.trim().length < 20) {
      throw new Error('Extracted content is too short. Please provide a document with more substantial text content.');
    }
    
    logger.debug('Text extraction completed', { 
      textLength: extractedText.length,
      wordCount: extractedText.split(/\s+/).length 
    });
    
    return extractedText;
    
  } catch (error) {
    logger.error('File processing error:', {
      message: error.message,
      url: fileUrl.substring(0, 100) + (fileUrl.length > 100 ? '...' : ''),
      code: error.code,
      status: error.response?.status
    });
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('File download timed out. Please check your internet connection and try again.');
    } else if (error.response?.status === 404) {
      throw new Error('File not found. The uploaded file URL is invalid or expired. Please try uploading again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. The file URL is not accessible. Please check your upload settings and try again.');
    } else if (error.message.includes('No text content could be extracted') ||
               error.message.includes('Cannot process older .doc files') ||
               error.message.includes('Unsupported file type') ||
               error.message.includes('Password-protected') ||
               error.message.includes('Extracted content is too short')) {
      throw error; // Re-throw our custom messages
    } else {
      throw new Error('Unable to process the uploaded file. Please try uploading a PDF, Word document, or text file.');
    }
  }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    apiConfigured: !!process.env.GEMINI_API_KEY
  });
});

app.get('/api/test', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'Missing Gemini API key. Get one free at https://makersuite.google.com/app/apikey'
    });
  }
  
  res.json({
    success: true,
    message: 'API is working correctly!',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

app.post('/api/generate', async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  logger.info(`[${requestId}] New generation request`);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Request-ID', requestId);
  
  try {
    let content = '';
    
    if (req.body.fileURL) {
      const fileUrl = validateInput.fileUrl(req.body.fileURL);
      logger.debug(`[${requestId}] Processing file URL`);
      content = await processFileUrl(fileUrl);
    } else if (req.body.notes) {
      logger.debug(`[${requestId}] Processing text input`);
      content = validateInput.text(req.body.notes);
    } else {
      return res.status(400).json({
        error: 'Missing input. Please provide either text notes or a file URL.'
      });
    }
    
    if (!content || content.trim().length < 20) {
      return res.status(400).json({
        error: 'Content too short. Please provide more detailed study material.'
      });
    }
    
    logger.debug(`[${requestId}] Content validated`, {
      length: content.length,
      wordCount: content.split(/\s+/).length
    });
    
    const studyPack = await processWithGemini(content.trim());
    
    logger.info(`[${requestId}] Study pack generated successfully`, {
      flashcards: studyPack.flashcards.length,
      questions: studyPack.quiz.length
    });
    
    res.json(studyPack);
    
  } catch (error) {
    logger.error(`[${requestId}] Generation failed`, {
      error: error.message
    });
    
    if (!res.headersSent) {
      const statusCode = error.message.includes('too short') || 
                        error.message.includes('Invalid') ? 400 : 500;
      
      res.status(statusCode).json({
        error: error.message || 'Failed to generate study pack. Please try again.'
      });
    }
  }
});

// Error handling
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    url: req.url,
    method: req.method
  });
  
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error. Please try again.'
    });
  }
});

// 404 for API routes - using simple route without wildcards
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found'
  });
});

// Frontend routes - specific routes instead of wildcards
app.get('/', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    const devIndexPath = path.join(process.cwd(), 'index.html');
    if (fs.existsSync(devIndexPath)) {
      res.sendFile(devIndexPath);
    } else {
      res.status(404).send('Frontend not found. Please build the application first.');
    }
  }
});

// Specific frontend routes for React Router
const frontendRoutes = ['/flashcards', '/quiz', '/summary', '/about'];
frontendRoutes.forEach(route => {
  app.get(route, (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend not found.');
    }
  });
});

// Start server
app.listen(PORT, () => {
  logger.info('🚀 SmartWay Server started successfully', {
    port: PORT,
    environment: NODE_ENV,
    frontendPath: buildPath,
    apiHealth: `http://localhost:${PORT}/api/health`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app; 