/**
 * Test script for Gemini API key
 */
const axios = require('axios');

async function testGeminiAPI(apiKey) {
  console.log('🔍 Testing Gemini API Key...');
  
  if (!apiKey) {
    console.log('❌ No API key provided');
    return false;
  }
  
  if (!apiKey.startsWith('AIza')) {
    console.log('❌ Invalid API key format (should start with "AIza")');
    return false;
  }
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        contents: [{ 
          parts: [{ text: 'Hello, just testing the API connection. Please respond with "API key working!"' }] 
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );
    
    const result = response.data.candidates[0].content.parts[0].text;
    console.log('✅ API Key is working!');
    console.log('📝 Response:', result.trim());
    return true;
    
  } catch (error) {
    console.log('❌ API Key test failed');
    
    if (error.response?.status === 400) {
      console.log('   Error: Invalid API key or request format');
    } else if (error.response?.status === 403) {
      console.log('   Error: API key permissions denied or quota exceeded');
    } else if (error.response?.status === 404) {
      console.log('   Error: API endpoint not found');
    } else {
      console.log('   Error:', error.message);
    }
    
    return false;
  }
}

// Get API key from command line argument
const apiKey = process.argv[2];

if (!apiKey) {
  console.log('Usage: node test-api-key.js YOUR_API_KEY');
  console.log('Example: node test-api-key.js AIzaSyC8UYZpvA2eknrILOX...');
  process.exit(1);
}

testGeminiAPI(apiKey).then(success => {
  process.exit(success ? 0 : 1);
}); 