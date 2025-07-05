# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Backend Usage

### Development

1. Create a `.env` file in the `smartway/` folder with:
   ```
   OPENAI_API_KEY=sk-...your real key here...
   ```
2. Start the backend server in dev mode:
   ```sh
   npm run start:dev
   ```
   This runs the backend directly from TypeScript using ts-node.

### Production

1. Build the backend:
   ```sh
   npm run build:server
   ```
2. Start the compiled backend:
   ```sh
   npm run start:prod
   ```
   This runs the compiled CommonJS backend from `dist/server.js`.

---

# SmartWay - AI Study Companion

Transform your notes into comprehensive study materials instantly with AI-powered summaries, flashcards, and quizzes.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key (REQUIRED)

**You need a free Google Gemini API key for the app to work:**

1. **Get a FREE API key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Create `.env` file** in the project root:
   ```bash
   # Windows PowerShell
   New-Item .env -ItemType File
   
   # Or manually create a file named .env
   ```

3. **Add your API key** to the `.env` file:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3001
   ```

   ⚠️ **Important**: Replace `your_actual_api_key_here` with your actual API key from Google AI Studio.

### 3. Start the Application
```bash
# Start backend server
npm run start:dev

# In another terminal, start frontend
npm run dev
```

## 🔧 Troubleshooting

### "Server encountered an error" when uploading PDF:
- ✅ **Check API Key**: Make sure you have a valid `GEMINI_API_KEY` in your `.env` file
- ✅ **Restart Server**: After adding the API key, restart the server with `npm run start:dev`
- ✅ **Test API**: Visit `http://localhost:3001/api/test` to verify your API key is working

### PDF Upload Issues:
- ✅ **File Format**: Only PDF, Word (.docx, .doc), and text files are supported
- ✅ **File Size**: Maximum 10MB file size
- ✅ **Text Content**: Make sure your PDF contains selectable text (not just images)

## 📋 Features

- **Smart Summary**: AI-generated overview with key points and definitions
- **Interactive Flashcards**: Flip-style cards for active learning
- **Adaptive Quiz**: Multiple-choice questions with explanations
- **Document Upload**: Support for PDF, Word, and text files
- **Mobile Responsive**: Works on all devices

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Bootstrap, Framer Motion
- **Backend**: Express.js, Node.js, TypeScript
- **AI**: Google Gemini API (Free tier available)
- **File Processing**: PDF-parse, Mammoth (for Word docs)

## 📁 Project Structure

```
smartway/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── api/           # API utilities
│   └── styles/        # CSS and styling
├── server.ts          # Backend server
├── .env               # Environment variables (create this!)
└── package.json       # Dependencies
```

## 🔑 Environment Variables

Create a `.env` file with these variables:

```env
# Required: Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Server port (default: 3001)
PORT=3001
```

## 🚨 Common Issues

1. **"Missing Gemini API key"**: Add `GEMINI_API_KEY` to your `.env` file
2. **"No text content extracted"**: Your PDF might be image-based or encrypted
3. **"Request timed out"**: Content might be too long, try shorter documents
4. **"Invalid file type"**: Only PDF, DOCX, DOC, and TXT files are supported

## 📞 Support

If you're still having issues:
1. Check that your `.env` file exists and contains a valid API key
2. Restart the server after adding the API key
3. Test your API key at `http://localhost:3001/api/test`
4. Make sure your PDF contains selectable text

---

**Need an API key?** Get one free at [Google AI Studio](https://makersuite.google.com/app/apikey) - no credit card required!
