export const PROMPTS = {
  summary: (userInput: string) => 
    `Summarize the following notes into concise bullet points with section headers:\n\n${userInput}`,
  
  flashcards: (userInput: string) => 
    `Create flashcards from the following content. Each flashcard should have:
    - QUESTION: A detailed, descriptive question that explains the context and asks for specific information
    - ANSWER: A short, concise answer (1-3 words maximum, or a brief phrase)
    
    Examples of good flashcard format:
    - Question: "What is the programming concept that allows a function to call itself repeatedly until it reaches a base case?"
    - Answer: "Recursion"
    
    - Question: "In database design, what term describes the process of organizing data to reduce redundancy and improve data integrity?"
    - Answer: "Normalization"
    
    Make sure answers are brief and to the point - avoid long explanations or paragraphs.
    
    Content to create flashcards from:\n\n${userInput}`,
  
  quiz: (userInput: string) => 
    `Create exactly 20 multiple choice questions based on the following content. Each question must have:
    - 4 answer options (A, B, C, D)
    - Only one correct answer
    - A clear explanation for why the correct answer is right
    - Questions should cover different aspects and difficulty levels of the material
    - Ensure all 20 questions are unique and test different concepts
    
    Format each question as:
    Question: [question text]
    A) [option 1]
    B) [option 2] 
    C) [option 3]
    D) [option 4]
    Correct Answer: [A/B/C/D]
    Explanation: [brief explanation]
    
    Content to base questions on:\n\n${userInput}`
};

export type PromptType = keyof typeof PROMPTS; 