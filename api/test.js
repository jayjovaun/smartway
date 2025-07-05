const axios = require('axios');

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
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
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
    
  } catch (error) {
    console.error('API Test Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      help: 'Check your GEMINI_API_KEY in the environment variables'
    });
  }
} 