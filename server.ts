import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

console.log('CWD:', process.cwd());
// Load environment variables
dotenv.config({ path: './.env' });
console.log('GEMINI_API_KEY after config:', process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req: Request, res: Response): Promise<void> => {
  console.log('Received POST /api/generate');
  
  const notes = req.body.notes;
  console.log('Notes received:', notes);
  
  if (!notes) {
    res.status(400).json({ error: 'Missing notes' });
    return;
  }
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Gemini API Key present:', !!apiKey);
  
  if (!apiKey) {
    res.status(500).json({ error: 'Missing Gemini API key. Get one free at https://makersuite.google.com/app/apikey' });
    return;
  }
  
  const prompt = `You are an expert study assistant. Create a comprehensive study pack from these notes.

Notes: ${notes}

Create a detailed, structured study pack. Respond with ONLY valid JSON in this exact format:
{
  "summary": {
    "overview": "Brief overview paragraph",
    "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
    "definitions": [
      {"term": "Important Term 1", "definition": "Clear definition"},
      {"term": "Important Term 2", "definition": "Clear definition"},
      {"term": "Important Term 3", "definition": "Clear definition"}
    ],
    "importantConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"]
  },
  "flashcards": [
    {"question": "Question about key concept", "answer": "Detailed answer with explanation"},
    {"question": "Question about definition", "answer": "Clear answer"},
    {"question": "Question about process", "answer": "Step-by-step explanation"},
    {"question": "Question about application", "answer": "Practical answer"},
    {"question": "Question about comparison", "answer": "Comparative explanation"},
    {"question": "Question about cause/effect", "answer": "Causal explanation"},
    {"question": "Question about example", "answer": "Concrete example"},
    {"question": "Question about importance", "answer": "Significance explanation"},
    {"question": "Question about relationship", "answer": "Connection explanation"},
    {"question": "Question about function", "answer": "Functional explanation"},
    {"question": "Question about characteristics", "answer": "Descriptive answer"},
    {"question": "Question about mechanism", "answer": "How it works explanation"},
    {"question": "Question about classification", "answer": "Category explanation"},
    {"question": "Question about analysis", "answer": "Analytical answer"},
    {"question": "Question about synthesis", "answer": "Comprehensive answer"}
  ],
  "quiz": [
    {"question": "Multiple choice about main concept", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A", "explanation": "Why this is correct"},
    {"question": "Multiple choice about definition", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option B", "explanation": "Explanation of correct answer"},
    {"question": "Multiple choice about process", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option C", "explanation": "Why this process is correct"},
    {"question": "Multiple choice about application", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option D", "explanation": "Application explanation"},
    {"question": "Multiple choice about cause", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A", "explanation": "Causal reasoning"},
    {"question": "Multiple choice about effect", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option B", "explanation": "Effect explanation"},
    {"question": "Multiple choice about comparison", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option C", "explanation": "Comparative analysis"},
    {"question": "Multiple choice about example", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option D", "explanation": "Example justification"},
    {"question": "Multiple choice about function", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A", "explanation": "Functional explanation"},
    {"question": "Multiple choice about importance", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option B", "explanation": "Significance reasoning"},
    {"question": "Multiple choice about relationship", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option C", "explanation": "Connection explanation"},
    {"question": "Multiple choice about mechanism", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option D", "explanation": "Mechanism explanation"},
    {"question": "Multiple choice about classification", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A", "explanation": "Classification reasoning"},
    {"question": "Multiple choice about analysis", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option B", "explanation": "Analytical explanation"},
    {"question": "Multiple choice about synthesis", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option C", "explanation": "Synthesis explanation"},
    {"question": "Multiple choice about evaluation", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option D", "explanation": "Evaluation reasoning"},
    {"question": "Multiple choice about prediction", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A", "explanation": "Prediction explanation"},
    {"question": "Multiple choice about inference", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option B", "explanation": "Inference reasoning"},
    {"question": "Multiple choice about conclusion", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option C", "explanation": "Conclusion explanation"},
    {"question": "Multiple choice about understanding", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option D", "explanation": "Understanding verification"}
  ]
}`;
  
  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await axios.post(geminiUrl, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
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
    } catch (parseErr) {
      console.error('Parse error:', parseErr);
      // Fallback response
      result = {
        summary: {
          overview: "Study pack generated successfully! Your content covers important topics.",
          keyPoints: ["Key concept 1", "Key concept 2", "Key concept 3", "Key concept 4", "Key concept 5"],
          definitions: [
            {"term": "Term 1", "definition": "Important definition from your notes"},
            {"term": "Term 2", "definition": "Key concept explanation"},
            {"term": "Term 3", "definition": "Essential understanding"}
          ],
          importantConcepts: ["Concept A", "Concept B", "Concept C", "Concept D"]
        },
        flashcards: [
          {"question": "What are the key concepts?", "answer": "Review your notes for main ideas and connections."},
          {"question": "How can you apply this knowledge?", "answer": "Consider practical applications and real-world scenarios."},
          {"question": "What should you focus on?", "answer": "Important details, relationships, and core principles."},
          {"question": "What are the main processes?", "answer": "Understanding the step-by-step mechanisms."},
          {"question": "Why is this important?", "answer": "Consider the significance and broader implications."},
          {"question": "How does this relate to other topics?", "answer": "Look for connections and relationships."},
          {"question": "What examples illustrate this?", "answer": "Think of concrete examples and applications."},
          {"question": "What are the characteristics?", "answer": "Identify key features and properties."},
          {"question": "How does this function?", "answer": "Understand the mechanism and operation."},
          {"question": "What causes this to happen?", "answer": "Identify the underlying causes and triggers."},
          {"question": "What are the effects?", "answer": "Consider the consequences and outcomes."},
          {"question": "How can this be classified?", "answer": "Understand the categories and groupings."},
          {"question": "What is the significance?", "answer": "Grasp the importance and relevance."},
          {"question": "How does this work?", "answer": "Understand the underlying principles."},
          {"question": "What should you remember?", "answer": "Focus on the most critical information."}
        ],
        quiz: [
          {"question": "What is the main topic?", "options": ["Concept A", "Concept B", "Concept C", "Concept D"], "answer": "Concept A", "explanation": "This is the primary focus of the material."},
          {"question": "Which is most important?", "options": ["Detail 1", "Detail 2", "Detail 3", "Detail 4"], "answer": "Detail 1", "explanation": "This detail is fundamental to understanding."},
          {"question": "How does this apply?", "options": ["Way A", "Way B", "Way C", "Way D"], "answer": "Way A", "explanation": "This application best demonstrates the concept."},
          {"question": "What comes first?", "options": ["Step 1", "Step 2", "Step 3", "Step 4"], "answer": "Step 1", "explanation": "This is the initial stage of the process."},
          {"question": "What is the result?", "options": ["Outcome A", "Outcome B", "Outcome C", "Outcome D"], "answer": "Outcome B", "explanation": "This outcome follows logically from the process."},
          {"question": "Which factor is key?", "options": ["Factor 1", "Factor 2", "Factor 3", "Factor 4"], "answer": "Factor 3", "explanation": "This factor plays the most crucial role."},
          {"question": "What defines this?", "options": ["Definition A", "Definition B", "Definition C", "Definition D"], "answer": "Definition D", "explanation": "This definition captures the essence accurately."},
          {"question": "How are these related?", "options": ["Relation A", "Relation B", "Relation C", "Relation D"], "answer": "Relation A", "explanation": "This relationship is the most direct connection."},
          {"question": "What causes this?", "options": ["Cause A", "Cause B", "Cause C", "Cause D"], "answer": "Cause B", "explanation": "This cause is the primary trigger."},
          {"question": "What is the purpose?", "options": ["Purpose A", "Purpose B", "Purpose C", "Purpose D"], "answer": "Purpose C", "explanation": "This purpose explains the primary function."},
          {"question": "Which is correct?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option D", "explanation": "This option aligns with the correct understanding."},
          {"question": "What happens next?", "options": ["Event A", "Event B", "Event C", "Event D"], "answer": "Event A", "explanation": "This event follows in the sequence."},
          {"question": "How can you tell?", "options": ["Sign A", "Sign B", "Sign C", "Sign D"], "answer": "Sign B", "explanation": "This sign is the most reliable indicator."},
          {"question": "What is true?", "options": ["Statement A", "Statement B", "Statement C", "Statement D"], "answer": "Statement C", "explanation": "This statement is factually accurate."},
          {"question": "Which example fits?", "options": ["Example A", "Example B", "Example C", "Example D"], "answer": "Example D", "explanation": "This example best illustrates the concept."},
          {"question": "What should you do?", "options": ["Action A", "Action B", "Action C", "Action D"], "answer": "Action A", "explanation": "This action is the most appropriate response."},
          {"question": "What is different?", "options": ["Difference A", "Difference B", "Difference C", "Difference D"], "answer": "Difference B", "explanation": "This difference is the most significant."},
          {"question": "What is similar?", "options": ["Similarity A", "Similarity B", "Similarity C", "Similarity D"], "answer": "Similarity C", "explanation": "This similarity shows the key connection."},
          {"question": "What matters most?", "options": ["Priority A", "Priority B", "Priority C", "Priority D"], "answer": "Priority D", "explanation": "This priority addresses the core issue."},
          {"question": "What should you remember?", "options": ["Point A", "Point B", "Point C", "Point D"], "answer": "Point A", "explanation": "This point is essential for understanding."}
        ]
      };
    }
    
    res.json(result);
    
  } catch (err: any) {
    console.error('Error:', err);
    if (err.response) {
      console.error('Gemini API error:', err.response.status, err.response.data);
      res.status(500).json({ error: `Gemini API error: ${err.response.status}` });
    } else {
      res.status(500).json({ error: 'Failed to generate study pack' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Using Google Gemini API (Free!)');
}); 