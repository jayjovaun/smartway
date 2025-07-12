/**
 * AI Study Pack Generation API - Vercel 2025 Serverless Function
 * Optimized for large document processing with 2.5-minute timeout
 */

const axios = require('axios');

// Dynamic package loading with fallbacks for serverless environment
let pdfParse, mammoth;
try {
  pdfParse = require('pdf-parse');
  mammoth = require('mammoth');
} catch (error) {
  console.log('[WARN] Document processing packages not available:', error.message);
}

// Utility functions
const generateRequestId = () => Math.random().toString(36).substring(2, 15);

const extractTextFromBuffer = async (buffer, contentType) => {
  try {
    if (contentType.includes('pdf')) {
      if (!pdfParse) throw new Error('PDF processing not available');
      const data = await pdfParse(buffer);
      return data.text;
    } else if (contentType.includes('word') || contentType.includes('document')) {
      if (!mammoth) throw new Error('Word document processing not available');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (contentType.includes('text')) {
      return buffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${contentType}`);
    }
  } catch (error) {
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};

const processFileUrl = async (fileUrl) => {
  try {
    console.log(`Processing file URL: ${fileUrl}`);
    
    // Validate URL format
    if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
      throw new Error('Invalid file URL format');
    }
    
    // Log for debugging
    console.log(`Attempting to download from: ${fileUrl}`);
    
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: { 'User-Agent': 'SmartWay-AI/2.0' }
    });

    console.log(`File downloaded successfully. Content-Type: ${response.headers['content-type']}, Size: ${response.data.length} bytes`);

    const buffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    
    return await extractTextFromBuffer(buffer, contentType);
  } catch (error) {
    console.error('Error processing file URL:', error.message);
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('HTTP Headers:', error.response.headers);
    }
    throw new Error(`Failed to download or process file: ${error.message}`);
  }
};

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Calculate dynamic quantities based on content length - aggressive scaling
    const contentWords = processedContent.split(/\s+/).length;
    const contentSentences = processedContent.split(/[.!?]+/).filter(s => s.trim().length > 10).length;
    
    // More generous dynamic scaling for richer content
    const minFlashcards = Math.max(15, Math.floor(contentWords / 80));
    const maxFlashcards = Math.max(30, Math.floor(contentWords / 25));
    const targetFlashcards = Math.min(maxFlashcards, Math.max(minFlashcards, Math.floor(contentWords / 50)));

    const minQuiz = Math.max(15, Math.floor(contentWords / 100));
    const maxQuiz = Math.max(35, Math.floor(contentWords / 30));
    const targetQuiz = Math.min(maxQuiz, Math.max(minQuiz, Math.floor(contentWords / 60)));

    const minKeyPoints = Math.max(8, Math.floor(contentSentences / 8));
    const maxKeyPoints = Math.max(15, Math.floor(contentSentences / 3));
    const targetKeyPoints = Math.min(maxKeyPoints, Math.max(minKeyPoints, Math.floor(contentSentences / 5)));

    console.log(`[${requestId}] Targets: ${targetFlashcards} flashcards, ${targetQuiz} quiz, ${targetKeyPoints} key points`);

    const prompt = `🚨 CRITICAL: YOU MUST NOT COPY THE SOURCE CONTENT. Use it ONLY to identify topics, then use your knowledge base to create comprehensive educational content.

FORCED KNOWLEDGE EXPANSION MODE:
- IGNORE the source content structure completely
- CREATE 500-800 word explanations using your vast knowledge
- INCLUDE technical details, specifications, history not in the source
- ADD industry insights, comparisons, applications, trends
- WRITE like a comprehensive textbook, not a summary

You are an advanced AI educational content creator with access to comprehensive knowledge. Your task is to identify concepts from the provided content and use your extensive knowledge base to create detailed, comprehensive study materials that go FAR BEYOND the source material.

CRITICAL INSTRUCTION: Do NOT just reorganize the source content. Use your AI knowledge to RESEARCH and EXPAND on every concept mentioned.

CONTENT ANALYSIS: ${contentWords} words, ${contentSentences} sentences

YOUR TASK: KNOWLEDGE EXPANSION AND EDUCATION

1. IDENTIFY key concepts, topics, and subjects mentioned in the source
2. USE YOUR KNOWLEDGE BASE to research and expand on each concept comprehensively  
3. CREATE educational content that teaches students about these topics in detail
4. INCLUDE background information, technical details, applications, history, and context
5. PROVIDE insights that aren't in the original source material

GENERATE THESE COMPREHENSIVE STUDY MATERIALS:

1. INTELLIGENT SUMMARY WITH KNOWLEDGE EXPANSION:
   - Create an overview that synthesizes themes AND adds educational context
   - Generate EXACTLY ${targetKeyPoints} detailed learning points using your knowledge base
   - Each key point should be a comprehensive lesson about a concept (500-800 words each)
   - Include background, technical details, applications, advantages/disadvantages, current trends

2. KNOWLEDGE-RICH FLASHCARDS (EXACTLY ${targetFlashcards}):
   - Create comprehensive question-answer pairs that test deep understanding
   - Include technical specifications, historical context, real-world applications
   - Each answer should be 200-400 words of educational content from your knowledge
   - Cover theoretical foundations, practical implementations, industry standards
   - Add comparative analysis and professional insights

3. COMPREHENSIVE QUIZ (EXACTLY ${targetQuiz} questions):
   - Generate challenging multiple-choice questions with 4 options each
   - Test conceptual understanding, applications, and analytical thinking
   - Include scenario-based questions and technical problem-solving
   - Provide detailed 300-500 word explanations using your knowledge base
   - Cover edge cases, real-world applications, and advanced concepts

4. TECHNICAL DEFINITIONS EXPANSION:
   - For each key term, provide comprehensive definitions (200-300 words)
   - Include etymology, technical specifications, industry usage
   - Add historical development, current applications, future trends
   - Compare with related concepts and provide practical examples

SOURCE CONTENT FOR TOPIC IDENTIFICATION ONLY:
${processedContent}

FORMAT YOUR RESPONSE AS VALID JSON:
{
  "summary": {
    "overview": "comprehensive_overview_with_educational_context",
    "keyPoints": [
      {
        "title": "specific_concept_name_not_generic",
        "explanation": "500-800_word_comprehensive_explanation_from_your_knowledge"
      }
    ],
    "definitions": [
      {
        "term": "technical_term",
        "definition": "200-300_word_comprehensive_definition_with_context"
      }
    ]
  },
  "flashcards": [
    {
      "front": "comprehensive_question_testing_deep_understanding",
      "back": "200-400_word_educational_answer_from_your_knowledge"
    }
  ],
  "quiz": [
    {
      "question": "challenging_scenario_based_question",
      "options": ["option1", "option2", "option3", "option4"],
      "correct": 0,
      "explanation": "300-500_word_detailed_explanation_from_your_knowledge"
    }
  ]
}`;

    // Retry logic for handling temporary API overload
    let geminiResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`[${requestId}] Attempt ${retryCount + 1}/${maxRetries + 1} - Calling Gemini API`);
        
        geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.9,
              topK: 50,
              topP: 0.98,
              maxOutputTokens: 32768,
            }
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 150000 // 2.5 minutes
          }
        );
        
        console.log(`[${requestId}] Gemini API call successful`);
        break; // Success, exit retry loop
        
      } catch (apiError) {
        if (apiError.response?.status === 503 && retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`[${requestId}] API overloaded, retrying in ${delay}ms... (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
          continue;
        } else {
          // Re-throw the error to be handled by the outer catch block
          throw apiError;
        }
      }
    }

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

    return res.status(200).json(studyPack);

  } catch (error) {
    console.error(`[${requestId}] Error:`, error.message);
    console.error(`[${requestId}] Stack:`, error.stack);
    
    // Handle specific error types
    if (error.response?.status === 503) {
      return res.status(503).json({
        error: 'Google AI servers are currently busy. This usually resolves in 1-5 minutes. Please try again.',
        requestId,
        retryAfter: 60, // seconds
        tips: [
          'Try again in 1-2 minutes',
          'Use shorter content for faster processing',
          'Avoid peak hours (9AM-5PM PST) if possible'
        ]
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a minute before trying again.',
        requestId,
        retryAfter: 60,
        info: 'Free tier allows 15 requests per minute'
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(408).json({
        error: 'Request timed out. Please try again with shorter content.',
        requestId
      });
    }

    // Handle file download errors (Supabase-related)
    if (error.message.includes('Failed to download') || error.message.includes('getaddrinfo ENOTFOUND')) {
      return res.status(400).json({
        error: 'Unable to access the uploaded file. Please check if the file is publicly accessible and try uploading again.',
        requestId,
        hint: 'This might be a Supabase storage permission issue.'
      });
    }

    // Handle PDF parsing errors
    if (error.message.includes('PDF processing not available')) {
      return res.status(500).json({
        error: 'PDF processing is temporarily unavailable. Please try uploading a Word document or text file.',
        requestId
      });
    }

    // Handle document processing errors
    if (error.message.includes('Word document processing not available')) {
      return res.status(500).json({
        error: 'Word document processing is temporarily unavailable. Please try uploading a PDF or text file.',
        requestId
      });
    }

    return res.status(500).json({
      error: error.message || 'An unexpected error occurred.',
      requestId,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 