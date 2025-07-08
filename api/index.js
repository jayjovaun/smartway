const axios = require('axios');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fetch = require('node-fetch');

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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    
    // Handle /api/test endpoint
    if (pathname === '/api/test' && req.method === 'GET') {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        res.status(500).json({ 
          error: 'Missing Gemini API key. Please set GEMINI_API_KEY in your environment variables',
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
      return;
    }
    
    // Handle /api/generate endpoint
    if (pathname === '/api/generate' && req.method === 'POST') {
      let notes = '';
      
      // Only allow JSON input (text or Supabase URL)
      if (req.headers['content-type']?.includes('application/json')) {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        await new Promise(resolve => req.on('end', resolve));
        try {
          const data = JSON.parse(body);
          if (data.fileURL) {
            // Handle Supabase Storage URL
            console.log('Processing Supabase URL:', data.fileURL);
            const response = await fetch(data.fileURL);
            if (!response.ok) {
              throw new Error(`Failed to download file: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get('content-type') || 'application/octet-stream';
            notes = await extractTextFromBuffer(buffer, contentType);
          } else if (data.notes) {
            // Handle text input
            notes = data.notes;
          } else {
            res.status(400).json({ error: 'No content provided. Please provide fileURL or notes in the request body.' });
            return;
          }
        } catch (parseError) {
          if (parseError.message && parseError.message.includes('Failed to download file')) {
            res.status(400).json({ error: 'Failed to process the uploaded file. Please try again.' });
            return;
          }
          res.status(400).json({ error: 'Invalid JSON or file processing error' });
          return;
        }
      } else if (req.headers['content-type']?.includes('multipart/form-data')) {
        // Block direct file uploads in production/serverless
        res.status(400).json({ error: 'Direct file uploads are not supported. Please upload your file to Supabase or another storage provider and provide the file URL.' });
        return;
      } else {
        res.status(400).json({ error: 'Unsupported content type. Only application/json is accepted.' });
        return;
      }
      
      if (!notes || notes.trim().length === 0) {
        res.status(400).json({ error: 'No content found in the provided input' });
        return;
      }

      if (notes.trim().length < 50) {
        res.status(400).json({ error: 'Content is too short. Please provide more detailed study material for better results.' });
        return;
      }
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'Missing Gemini API key. Get one free at https://makersuite.google.com/app/apikey' });
        return;
      }
      
      const prompt = createDynamicPrompt(notes);
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
        timeout: 30000
      });
      
      const data = response.data;
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        res.status(500).json({ error: 'No response from Gemini AI. Please try again.' });
        return;
      }
      
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
      } catch (parseError) {
        res.status(500).json({ error: 'AI response could not be processed. Please try again with different content.' });
        return;
      }
      
      // Validate the result structure
      if (!result.summary || !result.flashcards || !result.quiz) {
        res.status(500).json({ error: 'Incomplete study pack generated. Please try again.' });
        return;
      }

      if (!Array.isArray(result.flashcards) || result.flashcards.length === 0) {
        res.status(500).json({ error: 'No flashcards could be generated. Please provide more detailed content.' });
        return;
      }

      if (!Array.isArray(result.quiz) || result.quiz.length === 0) {
        res.status(500).json({ error: 'No quiz questions could be generated. Please provide more detailed content.' });
        return;
      }
      
      res.json(result);
      return;
    }
    
    // Handle 404 for other routes
    res.status(404).json({ error: 'API endpoint not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.response) {
      if (error.response.status === 429) {
        res.status(429).json({ error: 'AI service is temporarily busy. Please try again in a moment.' });
      } else if (error.response.status === 403) {
        res.status(500).json({ error: 'AI service configuration error. Please contact support.' });
      } else {
        res.status(500).json({ error: 'AI service error. Please try again.' });
      }
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      res.status(504).json({ error: 'Request timed out. Please try again with shorter content.' });
    } else if (error.message.includes('Invalid file type')) {
      res.status(400).json({ error: error.message });
    } else if (error.message.includes('Cannot process older .doc files')) {
      res.status(400).json({ error: error.message });
    } else if (error.message.includes('No text content could be extracted')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to generate study pack. Please try again.' });
    }
  }
} 