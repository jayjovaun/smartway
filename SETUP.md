# SmartWay Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in your project root:

```env
# Get your free Gemini API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration  
PORT=3001
```

### 3. Get Your Free Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key and paste it in your `.env` file

### 4. Run the Application

**Option A: Run both frontend and backend together (Recommended)**
```bash
npm run dev:full
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
npm run start:dev

# Terminal 2 - Frontend  
npm run dev
```

### 5. Open Your Browser
Go to `http://localhost:5173` and start creating study packs!

## ✨ Features

### 📝 Text Input
- Paste your study material directly
- Works with any text content
- Minimum 50 characters for best results

### 📄 File Upload (FREE!)
- Upload PDF, Word (.docx, .doc), or text files
- Maximum file size: 10MB
- Uses **ImgBB** (completely free, no signup required)
- Supports text extraction from documents

### 🎯 AI-Generated Content
- **Smart Summary** with key points and definitions
- **Interactive Flashcards** for active recall
- **Adaptive Quiz** with explanations
- Powered by **Google Gemini** (free tier)

## 🔧 Troubleshooting

### "Missing Gemini API key" Error
1. Make sure you created a `.env` file
2. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Add it to `.env` as `GEMINI_API_KEY=your_key_here`

### "Failed to generate study pack" Error
1. Make sure both frontend and backend are running
2. Check that your `.env` file is in the project root
3. Ensure your text is at least 50 characters long

### File Upload Issues
1. Check file size (must be under 10MB)
2. Ensure file type is PDF, Word (.docx, .doc), or text
3. Make sure the file contains extractable text (not just images)

### Port Conflicts
If port 3001 or 5173 are in use:
1. Change `PORT=3001` in your `.env` file
2. Update the proxy in `vite.config.ts` to match

## 🆓 Why This Setup is Completely Free

- **Google Gemini API**: Free tier with generous limits
- **ImgBB File Storage**: Free forever (no signup required)  
- **Local Development**: No hosting costs
- **No Credit Card**: Required for any service

## 📚 Usage Tips

### For Best Results:
- Provide detailed study material (200+ words recommended)
- Use clear, well-structured content
- Include key concepts, definitions, and examples
- Academic content works particularly well

### Supported File Types:
- **PDF**: Text-based PDFs (not scanned images)
- **Word**: .docx and .doc files
- **Text**: .txt files with UTF-8 encoding

Enjoy studying smarter with SmartWay! 🎓 