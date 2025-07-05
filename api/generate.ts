import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  await new Promise(resolve => req.on('end', resolve));

  let notes: string;
  try {
    const data = JSON.parse(body);
    notes = data.notes;
  } catch {
    res.statusCode = 400;
    res.end('Invalid JSON');
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.end('Missing OpenAI API key');
    return;
  }

  // Compose a prompt for summary, flashcards, and quiz
  const prompt = `You are a smart study assistant. Given the following notes, generate:\n\n1. A concise summary that is detailed and comprehensive.\n2. 3 flashcards (Q&A).\n3. 3 multiple-choice quiz questions (with 3 options and the correct answer).\n\nNotes:\n${notes}\n\nFormat your response as JSON with keys: summary, flashcards (array of {question,answer}), quiz (array of {question,options,answer}).`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful study assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 900
      })
    });
    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content;
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      res.statusCode = 500;
      res.end('OpenAI response was not valid JSON.');
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (err) {
    res.statusCode = 500;
    res.end('Failed to call OpenAI API.');
  }
} 