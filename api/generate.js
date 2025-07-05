const axios = require('axios');

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
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    let notes = '';
    
    // Handle different input types
    if (req.body && req.body.notes) {
      // Direct text input
      notes = req.body.notes;
    } else if (req.body && req.body.extractedText) {
      // Text extracted from uploaded file
      notes = req.body.extractedText;
    } else {
      res.status(400).json({ error: 'Missing content. Please provide text content or upload a file.' });
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
      res.status(500).json({ error: 'Missing Gemini API key. Please configure GEMINI_API_KEY environment variable.' });
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
      console.error('JSON Parse Error:', parseError);
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
    } else {
      res.status(500).json({ error: 'Failed to generate study pack. Please try again.' });
    }
  }
} 