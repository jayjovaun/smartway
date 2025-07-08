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
  console.log('🔥 Handler invoked:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    headers: Object.keys(req.headers)
  });

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    res.status(200).end();
    return;
  }
  
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    console.log('📍 Pathname:', pathname);
    
    // Handle /api/test endpoint
    if (pathname === '/api/test' && req.method === 'GET') {
      console.log('🧪 Test endpoint called');
      
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('🔑 API Key check:', {
        exists: !!apiKey,
        length: apiKey ? apiKey.length : 0,
        startsWithExpectedPrefix: apiKey ? apiKey.startsWith('AIza') : false
      });
      
      if (!apiKey) {
        console.error('❌ Missing Gemini API key');
        res.status(500).json({ 
          error: 'Missing Gemini API key. Please set GEMINI_API_KEY in your environment variables',
          help: 'Get a free API key at: https://makersuite.google.com/app/apikey',
          debug: {
            envVarsAvailable: Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('API')),
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      if (!apiKey.startsWith('AIza')) {
        console.error('❌ Invalid Gemini API key format');
        res.status(500).json({ 
          error: 'Invalid Gemini API key format. Key should start with "AIza"',
          help: 'Check your API key at: https://makersuite.google.com/app/apikey'
        });
        return;
      }

      console.log('🚀 Making test API call to Gemini...');
      const testPrompt = 'Respond with valid JSON: {"status": "working", "message": "API is functional"}';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      try {
        const response = await axios.post(geminiUrl, {
          contents: [{ parts: [{ text: testPrompt }] }]
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        
        console.log('✅ Gemini API test successful:', response.status);
        const data = response.data;
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        res.json({
          success: true,
          apiConfigured: true,
          testResponse: generatedText,
          timestamp: new Date().toISOString()
        });
        return;
      } catch (apiError) {
        console.error('❌ Gemini API test failed:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        });
        
        res.status(500).json({
          error: 'Gemini API test failed',
          details: apiError.response?.data || apiError.message,
          status: apiError.response?.status
        });
        return;
      }
    }
    
    // Handle /api/generate endpoint
    if (pathname === '/api/generate' && req.method === 'POST') {
      console.log('🎯 Generate endpoint called');
      
      let notes = '';
      
      // Only allow JSON input (text or Supabase URL)
      if (req.headers['content-type']?.includes('application/json')) {
        console.log('📥 Processing JSON request');
        
        let body = '';
        req.on('data', chunk => { body += chunk; });
        await new Promise(resolve => req.on('end', resolve));
        
        console.log('📦 Request body length:', body.length);
        
        try {
          const data = JSON.parse(body);
          console.log('✅ JSON parsed successfully. Keys:', Object.keys(data));
          
          if (data.fileURL) {
            console.log('📂 Processing file URL:', data.fileURL.substring(0, 100) + '...');
            
            const response = await fetch(data.fileURL);
            if (!response.ok) {
              throw new Error(`Failed to download file: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get('content-type') || 'application/octet-stream';
            
            console.log('📄 File downloaded:', {
              contentType,
              size: buffer.length
            });
            
            notes = await extractTextFromBuffer(buffer, contentType);
            console.log('📝 Text extracted:', notes.length, 'characters');
            
          } else if (data.notes) {
            notes = data.notes;
            console.log('📝 Text input received:', notes.length, 'characters');
            
          } else {
            console.error('❌ No content provided in request');
            res.status(400).json({ error: 'No content provided. Please provide fileURL or notes in the request body.' });
            return;
          }
        } catch (parseError) {
          console.error('❌ JSON parsing or file processing error:', parseError.message);
          if (parseError.message && parseError.message.includes('Failed to download file')) {
            res.status(400).json({ error: 'Failed to process the uploaded file. Please try again.' });
            return;
          }
          res.status(400).json({ error: 'Invalid JSON or file processing error: ' + parseError.message });
          return;
        }
      } else if (req.headers['content-type']?.includes('multipart/form-data')) {
        console.error('❌ Multipart form data blocked');
        res.status(400).json({ error: 'Direct file uploads are not supported. Please upload your file to Supabase or another storage provider and provide the file URL.' });
        return;
      } else {
        console.error('❌ Unsupported content type:', req.headers['content-type']);
        res.status(400).json({ error: 'Unsupported content type. Only application/json is accepted.' });
        return;
      }

      if (!notes || notes.trim().length === 0) {
        console.error('❌ No content found after processing');
        res.status(400).json({ error: 'No content found in the provided input' });
        return;
      }

      if (notes.trim().length < 50) {
        console.error('❌ Content too short:', notes.trim().length);
        res.status(400).json({ error: 'Content is too short. Please provide more detailed study material for better results.' });
        return;
      }
      
      console.log('✅ Content validation passed');
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('❌ No Gemini API key for generate endpoint');
        res.status(500).json({ error: 'Missing Gemini API key. Get one free at https://makersuite.google.com/app/apikey' });
        return;
      }
      
      console.log('🔄 Creating prompt and calling Gemini API...');
      const prompt = createDynamicPrompt(notes);
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      try {
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
          timeout: 30000
        });
        
        console.log('✅ Gemini API response received:', response.status);
        
        const data = response.data;
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
          console.error('❌ No text generated by Gemini');
          res.status(500).json({ error: 'No response from Gemini AI. Please try again.' });
          return;
        }
        
        console.log('🔄 Processing Gemini response...');
        
        // Clean and parse the JSON response
        let cleanText = generatedText.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        
        let result;
        try {
          result = JSON.parse(cleanText);
          console.log('✅ Response JSON parsed successfully');
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError.message);
          console.error('Raw text (first 500 chars):', cleanText.substring(0, 500));
          res.status(500).json({ error: 'AI response could not be processed. Please try again with different content.' });
          return;
        }
        
        // Validate the result structure
        if (!result.summary || !result.flashcards || !result.quiz) {
          console.error('❌ Invalid result structure:', {
            hasSummary: !!result.summary,
            hasFlashcards: !!result.flashcards,
            hasQuiz: !!result.quiz
          });
          res.status(500).json({ error: 'Incomplete study pack generated. Please try again.' });
          return;
        }

        if (!Array.isArray(result.flashcards) || result.flashcards.length === 0) {
          console.error('❌ No valid flashcards generated');
          res.status(500).json({ error: 'No flashcards could be generated. Please provide more detailed content.' });
          return;
        }

        if (!Array.isArray(result.quiz) || result.quiz.length === 0) {
          console.error('❌ No valid quiz questions generated');
          res.status(500).json({ error: 'No quiz questions could be generated. Please provide more detailed content.' });
          return;
        }
        
        console.log('🎉 Study pack generated successfully');
        res.json(result);
        return;
        
      } catch (apiError) {
        console.error('❌ Gemini API error:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        });
        
        if (apiError.response) {
          if (apiError.response.status === 429) {
            res.status(429).json({ error: 'AI service is temporarily busy. Please try again in a moment.' });
          } else if (apiError.response.status === 403) {
            res.status(500).json({ error: 'AI service configuration error. Please contact support.' });
          } else {
            res.status(500).json({ error: `AI service error: ${apiError.response.status}` });
          }
        } else if (apiError.code === 'ECONNABORTED' || apiError.message.includes('timeout')) {
          res.status(504).json({ error: 'Request timed out. Please try again with shorter content.' });
        } else {
          res.status(500).json({ error: 'AI service error. Please try again.' });
        }
        return;
      }
    }
    
    // Handle 404 for other routes
    console.log('❌ 404 - Endpoint not found:', pathname);
    res.status(404).json({ error: 'API endpoint not found' });
    
  } catch (error) {
    console.error('💥 FATAL ERROR in API handler:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 1000),
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      error: 'Internal server error. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
} 