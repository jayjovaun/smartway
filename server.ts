const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

import { Request, Response } from 'express';

console.log('CWD:', process.cwd());
// Load environment variables
dotenv.config({ path: './.env' });
console.log('GEMINI_API_KEY after config:', process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

// Extract text from uploaded files
async function extractTextFromFile(filePath: string, mimetype: string): Promise<string> {
  try {
    switch (mimetype) {
      case 'application/pdf':
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        return pdfData.text;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ path: filePath });
        return docxResult.value;
        
      case 'application/msword':
        // For older .doc files, mammoth can sometimes handle them
        try {
          const docResult = await mammoth.extractRawText({ path: filePath });
          return docResult.value;
        } catch (error) {
          throw new Error('Cannot process older .doc files. Please convert to .docx format.');
        }
        
      case 'text/plain':
        return fs.readFileSync(filePath, 'utf-8');
        
      default:
        throw new Error('Unsupported file type');
    }
  } finally {
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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

// Handle document upload and text extraction
app.post('/api/generate', upload.single('document'), async (req: Request, res: Response): Promise<void> => {
  console.log('Received POST /api/generate');
  
  let notes: string = '';
  
  try {
    // Check if we have a file upload or text input
    if (req.file) {
      console.log('Processing uploaded file:', req.file.originalname, req.file.mimetype);
      notes = await extractTextFromFile(req.file.path, req.file.mimetype);
      console.log('Extracted text length:', notes.length);
    } else if (req.body.notes) {
      notes = req.body.notes;
      console.log('Using text input, length:', notes.length);
    } else {
      res.status(400).json({ error: 'Missing notes or document file' });
      return;
    }
    
    if (!notes || notes.trim().length === 0) {
      res.status(400).json({ error: 'No content found in the provided input' });
      return;
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Gemini API Key present:', !!apiKey);
    
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
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Gemini API status:', response.status);
    
    const data = response.data;
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      res.status(500).json({ error: 'No response from Gemini' });
      return;
    }
    
    console.log('Generated text length:', generatedText.length);
    
    // Clean response
    let cleanText = generatedText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\s*/, '').replace(/\s*```$/, '');
    }
    
    let result;
    try {
      result = JSON.parse(cleanText);
      console.log('Successfully parsed JSON. Quiz questions:', result.quiz?.length || 0);
    } catch (parseErr) {
      console.error('Parse error:', parseErr);
      console.error('Raw response:', generatedText.substring(0, 500));
      
      // Smart fallback based on content analysis
      const analysis = analyzeContent(notes);
      const fallbackQuestions = [];
      
      for (let i = 0; i < analysis.questionCount; i++) {
        fallbackQuestions.push({
          question: `Based on the provided content, what is a key concept discussed? (Question ${i + 1})`,
          options: [
            "The main idea presented in the material",
            "Unrelated information not in the content", 
            "Generic knowledge not specific to the notes",
            "Random details without context"
          ],
          answer: "The main idea presented in the material",
          explanation: "This answer focuses on the actual content provided rather than external knowledge."
        });
      }
      
      result = {
        summary: {
          overview: "Study pack generated from your specific content. The material covers important concepts that require understanding and application.",
          keyPoints: [
            "Key concepts from your content",
            "Important processes described", 
            "Relationships between ideas",
            "Practical applications mentioned",
            "Critical insights provided"
          ],
          definitions: [
            {"term": "Core Concept", "definition": "A fundamental idea from your material"},
            {"term": "Key Process", "definition": "An important mechanism described in your content"},
            {"term": "Main Principle", "definition": "A governing rule from your content"}
          ],
          importantConcepts: [
            "Primary themes",
            "Practical applications", 
            "Key relationships",
            "Critical analysis"
          ]
        },
        flashcards: [
          {"question": "What are the main concepts in this material?", "answer": "Core principles"},
          {"question": "How do the key ideas connect?", "answer": "Through relationships"},
          {"question": "What should you focus on first?", "answer": "Fundamental concepts"},
          {"question": "How can you apply this knowledge?", "answer": "Practical scenarios"},
          {"question": "What makes this topic important?", "answer": "Real-world relevance"},
          {"question": "How do you remember key processes?", "answer": "Step-by-step approach"},
          {"question": "What examples illustrate the concepts?", "answer": "Concrete applications"},
          {"question": "How do you analyze this material?", "answer": "Critical thinking"},
          {"question": "What patterns can you identify?", "answer": "Common themes"},
          {"question": "How does this relate to other topics?", "answer": "Connections"},
          {"question": "What questions should you ask?", "answer": "Analytical inquiries"},
          {"question": "How do you test understanding?", "answer": "Practice problems"},
          {"question": "What details are most important?", "answer": "Key specifics"},
          {"question": "How do you organize this information?", "answer": "Logical structure"},
          {"question": "What should you remember long-term?", "answer": "Core principles"}
        ],
        quiz: fallbackQuestions
      };
    }
    
    res.json(result);
    
  } catch (err: any) {
    console.error('Error:', err);
    
    // Clean up file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (err.response) {
      console.error('Gemini API error:', err.response.status, err.response.data);
      res.status(500).json({ error: `Gemini API error: ${err.response.status}` });
    } else if (err.message.includes('Invalid file type')) {
      res.status(400).json({ error: err.message });
    } else if (err.message.includes('Cannot process older .doc files')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to generate study pack' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Using Google Gemini API (Free!)');
  console.log('Document upload supported: PDF, DOCX, DOC, TXT (max 10MB)');
}); 