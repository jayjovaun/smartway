const axios = require('axios');

// Simple text extraction for different file types
async function extractTextFromBlobUrl(blobUrl, mimeType) {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file from storage');
    }

    switch (mimeType) {
      case 'text/plain':
        const textContent = await response.text();
        if (!textContent || textContent.trim().length === 0) {
          throw new Error('Text file is empty');
        }
        return textContent;
        
      case 'application/pdf':
        // For PDFs, we'll suggest manual text input for better compatibility
        throw new Error('PDF text extraction requires specialized processing. Please copy and paste the text content directly for best results.');
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        // For Word docs, suggest manual text input
        throw new Error('Word document processing requires specialized handling. Please copy and paste the text content directly for best results.');
        
      default:
        throw new Error('Unsupported file type for text extraction');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
    const { blobUrl, mimeType } = req.body;
    
    if (!blobUrl) {
      res.status(400).json({ error: 'Missing blob URL' });
      return;
    }

    // Extract text from the uploaded file
    const extractedText = await extractTextFromBlobUrl(blobUrl, mimeType);
    
    // Validate content length
    if (extractedText.trim().length < 50) {
      res.status(400).json({ 
        error: 'Content is too short. Please provide more detailed study material for better results.' 
      });
      return;
    }

    res.json({
      success: true,
      extractedText: extractedText,
      contentLength: extractedText.length
    });

  } catch (error) {
    console.error('File processing error:', error);
    
    let errorMessage = 'Failed to process uploaded file.';
    if (error.message.includes('PDF text extraction')) {
      errorMessage = error.message;
    } else if (error.message.includes('Word document processing')) {
      errorMessage = error.message;
    } else if (error.message.includes('empty')) {
      errorMessage = 'The uploaded file appears to be empty.';
    } else if (error.message.includes('Unsupported file type')) {
      errorMessage = 'This file type is not supported for text extraction.';
    }
    
    res.status(400).json({ error: errorMessage });
  }
} 