# 🔧 SmartWay Setup Guide - Fix PDF Analysis

## The Issue
You're seeing "Server encountered an error" because the **Gemini API key is not configured**. This is required for the AI to analyze your PDFs and generate study materials.

## ✅ Quick Fix (5 minutes)

### Step 1: Get a FREE Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (it starts with "AIza...")

### Step 2: Create Environment File
In your project folder (`smartway`), create a file named `.env`:

**Windows (PowerShell):**
```powershell
New-Item .env -ItemType File
notepad .env
```

**Or manually:**
- Right-click in the project folder
- New → Text Document
- Rename to `.env` (remove the .txt extension)

### Step 3: Add Your API Key
Open the `.env` file and add:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
```

**⚠️ Replace `your_actual_api_key_here` with your actual API key from Step 1**

### Step 4: Restart the Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run start:dev
```

### Step 5: Test It Works
Visit: http://localhost:3001/api/test

You should see: `{"success": true, "message": "API is working correctly!"}`

## 🎉 Now Try Uploading Your PDF Again!

---

## 📋 Example .env File
```env
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=3001
```

## 🚨 Still Having Issues?

### Check These:
1. **File exists**: Make sure `.env` is in the root folder (same level as `package.json`)
2. **No spaces**: No spaces around the `=` sign in the .env file
3. **Valid key**: Your API key should start with "AIza"
4. **Server restart**: Always restart the server after changing .env

### Test Commands:
```bash
# Check if .env exists
dir .env

# Test API
curl http://localhost:3001/api/test
```

## 💡 PDF Requirements
Your PDF must have:
- ✅ Selectable text (not just images)
- ✅ Under 10MB file size
- ✅ No password protection

---

**Get API Key**: [Google AI Studio](https://makersuite.google.com/app/apikey) (100% Free!) 