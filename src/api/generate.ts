import { PROMPTS } from '@utils/prompts';
import type { PromptType } from '@utils/prompts';

export interface GenerateResponse {
  content: string;
  error?: string;
}

export const generateStudyContent = async (
  userInput: string, 
  type: PromptType
): Promise<GenerateResponse> => {
  try {
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: PROMPTS[type](userInput)
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from API');
    }

    return { content };
  } catch (error) {
    console.error('Error generating content:', error);
    return { 
      content: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Updated API interface for enhanced study pack generation
export interface StudyPackResult {
  summary: {
    overview: string;
    keyPoints: string[];
    definitions: Array<{ term: string; definition: string }>;
    importantConcepts: string[];
  };
  flashcards: Array<{ question: string; answer: string }>;
  quiz: Array<{ 
    question: string; 
    options: string[]; 
    answer: string; 
    explanation: string; 
  }>;
}

