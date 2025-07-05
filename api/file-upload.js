const { put } = require('@vercel/blob');

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
    // Get file info from headers
    const filename = req.headers['x-filename'] || 'document';
    const contentType = req.headers['content-type'] || 'text/plain';
    
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

    // Upload directly to Vercel Blob
    const blob = await put(filename, req, {
      access: 'public',
      addRandomSuffix: true,
      contentType: contentType
    });

    res.json({
      success: true,
      blobUrl: blob.url,
      filename: blob.pathname
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file. Please try again.' 
    });
  }
} 