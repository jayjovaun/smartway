// NOTE: Only JSON requests with { fileURL } or { notes } are supported. Direct file uploads (multipart/form-data) are NOT supported on Vercel.
import axios from 'axios';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fetch from 'node-fetch';

console.log('🚀 API Handler loaded successfully');
console.log('Environment check:', {
  hasGeminiKey: !!process.env.GEMINI_API_KEY,
  geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
  geminiKeyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'Not found',
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV
});

// Extract text from buffer (for Firebase Storage files)
async function extractTextFromBuffer(buffer, mimetype) {
  try {
    switch (mimetype) {
      case 'application/pdf':
        if (buffer.length === 0) {
          throw new Error('PDF file is empty or corrupted');
        }
        const pdfData = await pdfParse(buffer);
        if (!pdfData.text || pdfData.text.trim().length === 0) {
          throw new Error('No text content could be extracted from the PDF. The document may be image-based or encrypted.');
        }
        return pdfData.text;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ buffer });
        if (!docxResult.value || docxResult.value.trim().length === 0) {
          throw new Error('No text content could be extracted from the Word document.');
        }
        return docxResult.value;
        
      case 'application/msword':
        try {
          const docResult = await mammoth.extractRawText({ buffer });
          if (!docResult.value || docResult.value.trim().length === 0) {
            throw new Error('No text content could be extracted from the document.');
          }
          return docResult.value;
        } catch (error) {
          throw new Error('Cannot process older .doc files. Please convert to .docx format or save as PDF.');
        }
        
      case 'text/plain':
        const textContent = buffer.toString('utf-8');
        if (!textContent || textContent.trim().length === 0) {
          throw new Error('Text file is empty.');
        }
        return textContent;
        
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    if (error.message && error.message.includes('password')) {
      throw new Error('Password-protected documents are not supported. Please remove the password and try again.');
    }
    throw error instanceof Error ? error : new Error('Failed to process the uploaded file.');
  }
}

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word documents, and text files are allowed.'));
    }
  }
});

// Extract text from uploaded files (legacy support)
async function extractTextFromFile(buffer, mimetype) {
  return extractTextFromBuffer(buffer, mimetype);
}

// Smart content analysis for dynamic quiz generation
function analyzeContent(notes) {
  const wordCount = notes.split(/\s+/).length;
  const sentenceCount = notes.split(/[.!?]+/).length;
  const lineCount = notes.split('\n').filter(line => line.trim()).length;
  
  const keyTerms = ['concept', 'definition', 'principle', 'theory', 'method', 'process', 'system', 'approach', 'technique', 'strategy', 'rule', 'law', 'formula', 'equation', 'model', 'framework', 'structure', 'pattern', 'relationship', 'function', 'mechanism', 'procedure', 'step', 'phase', 'stage', 'example', 'application', 'cause', 'effect', 'result', 'importance', 'significance'];
  const conceptCount = keyTerms.reduce((count, term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    return count + (notes.match(regex) || []).length;
  }, 0);
  
  let questionCount = Math.floor(wordCount / 25) + Math.floor(conceptCount / 2);
  
  if (questionCount === 0 && notes.trim().length > 0) {
    questionCount = 1;
  }
  
  if (sentenceCount > 20) questionCount += 2;
  if (lineCount > 15) questionCount += 2;
  if (conceptCount > 10) questionCount += 3;
  
  questionCount = Math.min(questionCount, 30);
  
  const contentType = conceptCount > 5 ? 'academic' : wordCount > 200 ? 'detailed' : 'basic';
  const complexity = wordCount > 500 ? 'advanced' : wordCount > 200 ? 'intermediate' : 'beginner';
  
  return { questionCount, contentType, complexity };
}

function createDynamicPrompt(notes) {
  const analysis = analyzeContent(notes);
  
  return `You are an expert study assistant. Analyze the following notes and create a comprehensive study pack.

Notes: ${notes}

Based on the content analysis, create exactly ${analysis.questionCount} unique, high-quality quiz questions that thoroughly test understanding of the material. The content appears to be ${analysis.contentType} with ${analysis.complexity} complexity level.

Focus on:
- Key concepts and definitions present in the content
- Important processes and mechanisms described
- Relationships and connections between ideas
- Applications and examples provided
- Critical thinking about the material
- Problem-solving scenarios if applicable

Respond with ONLY valid JSON in this exact format:
{
  "summary": {
    "overview": "A comprehensive 2-3 sentence overview of the main topics covered",
    "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
    "definitions": [
      {"term": "Term 1", "definition": "Definition 1"},
      {"term": "Term 2", "definition": "Definition 2"},
      {"term": "Term 3", "definition": "Definition 3"}
    ],
    "importantConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"]
  },
  "flashcards": [
    {"question": "Contextual question about key concept", "answer": "Brief answer"},
    {"question": "Question about definition", "answer": "Short answer"},
    {"question": "Question about process", "answer": "Concise answer"},
    {"question": "Question about application", "answer": "Brief answer"},
    {"question": "Question about relationship", "answer": "Short answer"},
    {"question": "Question about importance", "answer": "Brief answer"},
    {"question": "Question about mechanism", "answer": "Concise answer"},
    {"question": "Question about significance", "answer": "Brief answer"}
  ],
  "quiz": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make sure all arrays have the specified number of items and the JSON is properly formatted.`;
}

// Helper function to parse multipart form data
function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const upload = multer({
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only PDF, Word documents, and text files are allowed.'));
        }
      }
    }).single('document');
    
    upload(req, {}, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(req.file);
      }
    });
  });
}

// Main API handler
export default async function handler(req, res) {
  console.log('🚀 Minimal API Handler starting...');

  console.log('📍 Handler invoked at:', new Date().toISOString());
  console.log('📥 Method:', req.method);
  console.log('📥 URL:', req.url);
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    if (req.method === 'OPTIONS') {
      console.log('✅ OPTIONS request handled');
      return res.status(200).end();
    }
    
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    console.log('📍 Pathname:', pathname);
    
    // Handle /api/test endpoint - MINIMAL VERSION
    if (pathname === '/api/test' && req.method === 'GET') {
      console.log('🧪 Test endpoint called');
      
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('🔑 API Key check:', {
        exists: !!apiKey,
        length: apiKey ? apiKey.length : 0
      });
      
      return res.status(200).json({
        success: true,
        message: 'Minimal API function is working!',
        timestamp: new Date().toISOString(),
        environment: {
          hasGeminiKey: !!apiKey,
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV
        }
      });
    }
    
    // Handle /api/generate endpoint - MINIMAL VERSION  
    if (pathname === '/api/generate' && req.method === 'POST') {
      console.log('🎯 Generate endpoint called');
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('❌ Missing Gemini API key');
        return res.status(500).json({ 
          error: 'Missing Gemini API key. Please set GEMINI_API_KEY in your environment variables',
          help: 'Get a free API key at: https://makersuite.google.com/app/apikey'
        });
      }
      
      // Simple test without complex file processing
      let body = '';
      req.on('data', chunk => { body += chunk; });
      await new Promise(resolve => req.on('end', resolve));
      
      let data;
      try {
        data = JSON.parse(body);
      } catch (parseError) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
      
      if (!data.notes && !data.fileURL) {
        return res.status(400).json({ error: 'Please provide either notes or fileURL' });
      }
      
      // For now, just return a simple response without calling Gemini
      return res.status(200).json({
        success: true,
        message: 'Minimal generate endpoint is working!',
        received: {
          hasNotes: !!data.notes,
          hasFileURL: !!data.fileURL,
          notesLength: data.notes ? data.notes.length : 0
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle 404 for other routes
    console.log('❌ 404 - Endpoint not found:', pathname);
    return res.status(404).json({ error: 'API endpoint not found' });
    
  } catch (error) {
    console.error('💥 FATAL ERROR in API handler:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    return res.status(500).json({ 
      error: 'Internal server error. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
} 