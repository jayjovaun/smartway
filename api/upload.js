const { put } = require('@vercel/blob');

// File processing functions
async function extractTextFromBlob(blobUrl, mimeType) {
  try {
    // Fetch the file from blob storage
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file from blob storage');
    }

    switch (mimeType) {
      case 'application/pdf':
        // For PDF files, we'll need to use a different approach since pdf-parse doesn't work well in serverless
        // We'll return the blob URL for now and handle PDF processing differently
        throw new Error('PDF processing requires specialized handling. Please convert to text format or use a smaller file.');
        
      case 'text/plain':
        const textContent = await response.text();
        if (!textContent || textContent.trim().length === 0) {
          throw new Error('Text file is empty.');
        }
        return textContent;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        // Word documents require special handling in serverless environment
        throw new Error('Word document processing requires specialized handling. Please convert to text format or copy-paste the content.');
        
      default:
        throw new Error('Unsupported file type. Please use text files (.txt) for best compatibility.');
    }
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Could not access the uploaded file. Please try again.');
    }
    throw error;
  }
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
    // Get the file data from the request body
    const chunks = [];
    const contentType = req.headers['content-type'] || '';
    const filename = req.headers['x-filename'] || 'uploaded-file';
    
    // Collect the file data
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      try {
        const fileBuffer = Buffer.concat(chunks);
        
        // Validate file size (4MB limit for serverless)
        if (fileBuffer.length > 4 * 1024 * 1024) {
          res.status(400).json({ 
            error: 'File too large. Please use files smaller than 4MB or paste the text content directly.' 
          });
          return;
        }

        if (fileBuffer.length === 0) {
          res.status(400).json({ error: 'No file data received' });
          return;
        }

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain'
        ];

        if (!allowedTypes.includes(contentType)) {
          res.status(400).json({ 
            error: 'Invalid file type. Only PDF, Word documents, and text files are allowed.' 
          });
          return;
        }

        // Upload to Vercel Blob
        const blob = await put(filename, fileBuffer, {
          access: 'public',
          addRandomSuffix: true,
          contentType: contentType
        });

        console.log('File uploaded to blob:', blob.url);

        // Extract text content based on file type
        let extractedText = '';
        
        if (contentType === 'text/plain') {
          try {
            extractedText = fileBuffer.toString('utf-8');
            if (!extractedText || extractedText.trim().length === 0) {
              res.status(400).json({ error: 'Text file is empty.' });
              return;
            }
          } catch (error) {
            res.status(400).json({ error: 'Could not read text file content.' });
            return;
          }
        } else {
          // For PDF and Word documents, we'll provide a helpful message
          res.status(400).json({ 
            error: `${contentType.includes('pdf') ? 'PDF' : 'Word'} files require specialized processing. For best results, please copy and paste the text content directly into the text input area.`,
            blobUrl: blob.url
          });
          return;
        }

        // Validate content length
        if (extractedText.trim().length < 50) {
          res.status(400).json({ 
            error: 'Content is too short. Please provide more detailed study material for better results.' 
          });
          return;
        }

        res.json({
          success: true,
          blobUrl: blob.url,
          extractedText: extractedText,
          contentLength: extractedText.length
        });

      } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({ 
          error: 'Failed to process uploaded file. Please try again or use the text input method.' 
        });
      }
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ error: 'Upload failed. Please try again.' });
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    res.status(500).json({ 
      error: 'Upload service temporarily unavailable. Please try again or use the text input method.' 
    });
  }
} 