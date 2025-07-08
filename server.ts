const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

import { Request, Response, NextFunction } from 'express';
import { Response as FetchResponse } from 'node-fetch';

console.log('🚀 Starting SmartWay Server...');
console.log('CWD:', process.cwd());
console.log('Files in CWD:', fs.readdirSync('.'));

// Load environment variables
dotenv.config({ path: './.env' });
console.log('Environment loaded. API Key present:', !!process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the React app build
const buildPath = path.join(__dirname, 'dist');
console.log('Serving static files from:', buildPath);
app.use(express.static(buildPath));

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile?: boolean) => void) => {
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

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Extract text from buffer (for Firebase Storage files)
async function extractTextFromBuffer(buffer: Buffer, mimetype: string): Promise<string> {
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
        // For older .doc files, mammoth can sometimes handle them
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
  } catch (error: any) {
    // Re-throw with more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('password')) {
        throw new Error('Password-protected documents are not supported. Please remove the password and try again.');
      } else {
        throw error;
      }
    }
    throw new Error('Failed to process the uploaded file. Please check the file format and try again.');
  }
}

// Extract text from uploaded files with better error handling
async function extractTextFromFile(filePath: string, mimetype: string): Promise<string> {
  try {
    switch (mimetype) {
      case 'application/pdf':
        const pdfBuffer = fs.readFileSync(filePath);
        if (pdfBuffer.length === 0) {
          throw new Error('PDF file is empty or corrupted');
        }
        const pdfData = await pdfParse(pdfBuffer);
        if (!pdfData.text || pdfData.text.trim().length === 0) {
          throw new Error('No text content could be extracted from the PDF. The document may be image-based or encrypted.');
        }
        return pdfData.text;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ path: filePath });
        if (!docxResult.value || docxResult.value.trim().length === 0) {
          throw new Error('No text content could be extracted from the Word document.');
        }
        return docxResult.value;
        
      case 'application/msword':
        // For older .doc files, mammoth can sometimes handle them
        try {
          const docResult = await mammoth.extractRawText({ path: filePath });
          if (!docResult.value || docResult.value.trim().length === 0) {
            throw new Error('No text content could be extracted from the document.');
          }
          return docResult.value;
        } catch (error) {
          throw new Error('Cannot process older .doc files. Please convert to .docx format or save as PDF.');
        }
        
      case 'text/plain':
        const textContent = fs.readFileSync(filePath, 'utf-8');
        if (!textContent || textContent.trim().length === 0) {
          throw new Error('Text file is empty.');
        }
        return textContent;
        
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    // Re-throw with more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error('File could not be found or accessed. Please try uploading again.');
      } else if (error.message.includes('Invalid PDF')) {
        throw new Error('Invalid or corrupted PDF file. Please check the file and try again.');
      } else if (error.message.includes('password')) {
        throw new Error('Password-protected documents are not supported. Please remove the password and try again.');
      } else {
        throw error;
      }
    }
    throw new Error('Failed to process the uploaded file. Please check the file format and try again.');
  } finally {
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      try {
      fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
  }
}

// Smart content analysis for dynamic quiz generation
function analyzeContent(notes: string): { questionCount: number; contentType: string; complexity: string } {
  const wordCount = notes.split(/\s+/).length;
  const sentenceCount = notes.split(/[.!?]+/).length;
  const lineCount = notes.split('\n').filter(line => line.trim()).length;
  
  // Count key educational terms
  const keyTerms = ['concept', 'definition', 'principle', 'theory', 'method', 'process', 'system', 'approach', 'technique', 'strategy', 'rule', 'law', 'formula', 'equation', 'model', 'framework', 'structure', 'pattern', 'relationship', 'function', 'mechanism', 'procedure', 'step', 'phase', 'stage', 'example', 'application', 'cause', 'effect', 'result', 'importance', 'significance'];
  const conceptCount = keyTerms.reduce((count, term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    return count + (notes.match(regex) || []).length;
  }, 0);
  
  // Dynamic question count based on content richness - NO MINIMUM
  let questionCount = Math.floor(wordCount / 25) + Math.floor(conceptCount / 2);
  
  // Ensure at least 1 question if there's any content
  if (questionCount === 0 && notes.trim().length > 0) {
    questionCount = 1;
  }
  
  // Adjust based on content structure
  if (sentenceCount > 20) questionCount += 2;
  if (lineCount > 15) questionCount += 2;
  if (conceptCount > 10) questionCount += 3;
  
  // Cap at reasonable maximum
  questionCount = Math.min(questionCount, 30);
  
  // Determine content type and complexity
  const contentType = conceptCount > 5 ? 'academic' : wordCount > 200 ? 'detailed' : 'basic';
  const complexity = wordCount > 500 ? 'advanced' : wordCount > 200 ? 'intermediate' : 'beginner';
  
  console.log(`Content analysis: ${wordCount} words, ${conceptCount} concepts, ${sentenceCount} sentences -> ${questionCount} questions (${contentType}, ${complexity})`);
  
  return { questionCount, contentType, complexity };
}

function createDynamicPrompt(notes: string): string {
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
    {"question": "Question about example", "answer": "Short answer"},
    {"question": "Question about analysis", "answer": "Brief answer"},
    {"question": "Question about synthesis", "answer": "Concise answer"},
    {"question": "Question about evaluation", "answer": "Short answer"},
    {"question": "Question about comparison", "answer": "Brief answer"},
    {"question": "Question about classification", "answer": "Short answer"},
    {"question": "Question about prediction", "answer": "Brief answer"},
    {"question": "Question about understanding", "answer": "Concise answer"}
  ],
  "quiz": [
    ${Array(analysis.questionCount).fill(0).map((_, i) => `{"question": "Specific question ${i + 1} about the content", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Correct Option", "explanation": "Why this answer is correct"}`).join(',\n    ')}
  ]
}

CRITICAL REQUIREMENTS:
1. Create exactly ${analysis.questionCount} quiz questions - no more, no less
2. ALL questions must be specific to the provided content
3. Each question should test a different aspect of the material
4. Use actual information from the notes, not generic knowledge
5. Ensure variety in difficulty and question types
6. Make questions that require understanding, not just memorization`;
}

// Test endpoint to verify API configuration
app.get('/api/test', async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      res.status(500).json({ 
        error: 'Missing Gemini API key',
        solution: 'Create a .env file and add: GEMINI_API_KEY=your_api_key_here',
        getKey: 'Get a free API key at: https://makersuite.google.com/app/apikey'
      });
      return;
    }

    // Test simple API call
    const testPrompt = 'Respond with valid JSON: {"status": "working", "message": "API is functional"}';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await axios.post(geminiUrl, {
      contents: [{ parts: [{ text: testPrompt }] }]
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    const data = response.data;
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    res.json({
      success: true,
      message: 'API is working correctly!',
      testResponse: generatedText,
      apiKeyConfigured: true
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      solution: 'Check your GEMINI_API_KEY in the .env file',
      statusCode: error.response?.status
    });
  }
});

// Global error handler for JSON responses
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error caught by global handler:', err);
  
  // Ensure we always send JSON
  res.setHeader('Content-Type', 'application/json');
  
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = 'An unexpected error occurred. Please try again.';

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Please upload a file smaller than 10MB.';
  } else if (err.message && err.message.includes('Invalid file type')) {
    statusCode = 400;
    message = err.message;
  } else if (err.message && err.message.includes('Multer')) {
    statusCode = 400;
    message = 'File upload error. Please try again with a different file.';
  } else if (err.message) {
    message = err.message;
  }

  res.status(statusCode).json({ 
    error: message,
    timestamp: new Date().toISOString()
  });
};

// Add a test endpoint to verify API setup
app.get('/api/test', async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      res.status(500).json({ 
        error: 'Missing Gemini API key. Please set GEMINI_API_KEY in your .env file',
        help: 'Get a free API key at: https://makersuite.google.com/app/apikey'
      });
      return;
    }

    // Test simple API call
    const testPrompt = 'Respond with valid JSON: {"status": "working", "message": "API is functional"}';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await axios.post(geminiUrl, {
      contents: [{ parts: [{ text: testPrompt }] }]
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    const data = response.data;
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    res.json({
      success: true,
      apiConfigured: true,
      testResponse: generatedText
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      help: 'Check your GEMINI_API_KEY in the .env file'
    });
  }
});

// Handle document upload and text extraction
app.post('/api/generate', async (req: Request, res: Response): Promise<void> => {
  console.log('\n=== NEW REQUEST TO /api/generate ===');
  console.log('Timestamp:', new Date().toISOString());
  res.setHeader('Content-Type', 'application/json');

  let notes: string = '';

  try {
    console.log('Step 1: Processing input...');

    // Only allow fileURL or notes in production (Vercel/serverless)
    if (req.body && req.body.fileURL) {
      console.log('File URL detected:', req.body.fileURL);
      try {
        const response = await fetch(req.body.fileURL);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        console.log('- File downloaded successfully');
        console.log('- Content type:', contentType);
        console.log('- File size:', buffer.length, 'bytes');
        notes = await extractTextFromBuffer(buffer, contentType);
        console.log('- Text extraction successful');
        console.log('- Extracted text length:', notes.length);
        console.log('- First 200 characters:', notes.substring(0, 200));
      } catch (downloadError: any) {
        console.error('ERROR downloading/processing file from URL:', downloadError.message);
        res.status(400).json({ error: 'Failed to process the uploaded file. Please try again.' });
        return;
      }
    } else if (req.body && req.body.notes) {
      notes = req.body.notes;
      console.log('Text input detected:');
      console.log('- Text length:', notes.length);
      console.log('- First 200 characters:', notes.substring(0, 200));
    } else if (req.file || (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data'))) {
      // Block direct file uploads in production/serverless
      console.error('ERROR: Direct file uploads are not supported on Vercel/serverless. Please upload to Supabase/Blob storage and send the file URL.');
      res.status(400).json({ error: 'Direct file uploads are not supported. Please upload your file to Supabase or another storage provider and provide the file URL.' });
      return;
    } else {
      console.error('ERROR: No content provided');
      res.status(400).json({ error: 'Missing notes or fileURL in request body.' });
      return;
    }

    if (!notes || notes.trim().length === 0) {
      console.error('ERROR: No content found after processing');
      res.status(400).json({ error: 'No content found in the provided input' });
      return;
    }
    if (notes.trim().length < 50) {
      console.error('ERROR: Content too short:', notes.trim().length, 'characters');
      res.status(400).json({ error: 'Content is too short. Please provide more detailed study material for better results.' });
      return;
    }

    console.log('Step 3: Checking API configuration...');
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('- API Key present:', !!apiKey);
    console.log('- API Key length:', apiKey ? apiKey.length : 0);
    
    if (!apiKey) {
      console.error('ERROR: No Gemini API key found');
      res.status(500).json({ error: 'Missing Gemini API key. Get one free at https://makersuite.google.com/app/apikey' });
      return;
    }
    
    console.log('Step 4: Creating prompt...');
    const prompt = createDynamicPrompt(notes);
    console.log('- Prompt length:', prompt.length);
    
    console.log('Step 5: Calling Gemini API...');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await axios.post(geminiUrl, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.7, 
        maxOutputTokens: 4000,
        topP: 0.9,
        topK: 40
      }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('- Gemini API response status:', response.status);
    
    const data = response.data;
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error('ERROR: No text generated by Gemini');
      console.log('- Full response:', JSON.stringify(data, null, 2));
      res.status(500).json({ error: 'No response from Gemini AI. Please try again.' });
      return;
    }
    
    console.log('Step 6: Processing response...');
    console.log('- Generated text length:', generatedText.length);
    console.log('- First 300 characters:', generatedText.substring(0, 300));
    
    // Clean and parse the JSON response
    let cleanText = generatedText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    console.log('Step 7: Parsing JSON...');
    let result;
    try {
      result = JSON.parse(cleanText);
      console.log('- JSON parsing successful');
      console.log('- Summary present:', !!result.summary);
      console.log('- Flashcards count:', result.flashcards?.length || 0);
      console.log('- Quiz questions count:', result.quiz?.length || 0);
    } catch (parseError: any) {
      console.error('ERROR: JSON Parse failed');
      console.error('- Parse error:', parseError.message);
      console.error('- Raw cleaned text (first 500 chars):', cleanText.substring(0, 500));
      res.status(500).json({ error: 'AI response could not be processed. Please try again with different content.' });
      return;
    }
    
    // Validate the result structure
    if (!result.summary || !result.flashcards || !result.quiz) {
      console.error('ERROR: Invalid result structure');
      console.log('- Has summary:', !!result.summary);
      console.log('- Has flashcards:', !!result.flashcards);
      console.log('- Has quiz:', !!result.quiz);
      res.status(500).json({ error: 'Incomplete study pack generated. Please try again.' });
      return;
    }

    // Additional validation
    if (!Array.isArray(result.flashcards) || result.flashcards.length === 0) {
      console.error('ERROR: No valid flashcards generated');
      res.status(500).json({ error: 'No flashcards could be generated. Please provide more detailed content.' });
      return;
    }

    if (!Array.isArray(result.quiz) || result.quiz.length === 0) {
      console.error('ERROR: No valid quiz questions generated');
      res.status(500).json({ error: 'No quiz questions could be generated. Please provide more detailed content.' });
      return;
    }
    
    console.log('SUCCESS: Study pack generated successfully');
    console.log('=== END REQUEST ===\n');
    res.json(result);
    
  } catch (err: any) {
    console.error('\n!!! FATAL ERROR in /api/generate !!!');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack?.substring(0, 500));
    
    // Clean up file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
      fs.unlinkSync(req.file.path);
        console.log('- Cleaned up uploaded file');
      } catch (cleanupError: any) {
        console.error('- Error cleaning up file:', cleanupError.message);
      }
    }
    
    // Ensure JSON response
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
    
    if (err.response) {
        console.error('- Gemini API error details:', err.response.status, err.response.data);
        if (err.response.status === 429) {
          res.status(429).json({ error: 'AI service is temporarily busy. Please try again in a moment.' });
        } else if (err.response.status === 403) {
          res.status(500).json({ error: 'AI service configuration error. Please contact support.' });
        } else {
          res.status(500).json({ error: `AI service error. Please try again.` });
        }
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        res.status(504).json({ error: 'Request timed out. Please try again with shorter content.' });
    } else if (err.message.includes('Invalid file type')) {
      res.status(400).json({ error: err.message });
    } else if (err.message.includes('Cannot process older .doc files')) {
        res.status(400).json({ error: err.message });
      } else if (err.message.includes('No text content could be extracted')) {
        res.status(400).json({ error: err.message });
      } else if (err.message.includes('File could not be found')) {
        res.status(400).json({ error: err.message });
      } else if (err.message.includes('Content is too short')) {
      res.status(400).json({ error: err.message });
    } else {
        res.status(500).json({ error: 'Failed to generate study pack. Please try again.' });
      }
    }
    
    console.log('=== END ERROR REQUEST ===\n');
  }
});

// Add the global error handler
app.use(errorHandler);

// Handle 404 for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve React App for all other routes (catch-all)
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SmartWay Server running on http://localhost:${PORT}`);
  console.log('📚 Frontend served from:', buildPath);
  console.log('🔥 API endpoints available at /api/*');
  console.log('🤖 Using Google Gemini API (Free!)');
  console.log('📄 Document upload supported: PDF, DOCX, DOC, TXT (max 10MB)');
}); 