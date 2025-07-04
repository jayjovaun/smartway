export const PROMPTS = {
  summary: (userInput: string) => 
    `Summarize the following notes into concise bullet points with section headers:\n\n${userInput}`,
  
  flashcards: (userInput: string) => 
    `Turn the following notes into flashcards in Q&A format:\n\n${userInput}`,
  
  quiz: (userInput: string) => 
    `Create 5 multiple choice questions with one correct answer each:\n\n${userInput}`
};

export type PromptType = keyof typeof PROMPTS; 