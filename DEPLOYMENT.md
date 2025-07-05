# 🚀 Deploy SmartWay to Vercel

This guide will help you deploy your SmartWay app to Vercel so others can access it via a public URL.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free)
- Your project pushed to GitHub/GitLab/Bitbucket
- Your Gemini API key

## Step 1: Prepare Your Repository

1. **Commit and push your changes to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Make sure your repository is public or you have a Vercel Pro account** (for private repos)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure project settings**:
   - **Project Name**: `smartway-app` (or your preferred name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: `.` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add: `GEMINI_API_KEY` = `your_actual_api_key_here`
   - Make sure to use your actual API key (starts with `AIzaSy...`)

6. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? `N`
   - Project name: `smartway-app`
   - Which directory? `./`
   - Want to override settings? `N`

5. **Add environment variables**:
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   Then paste your API key when prompted.

## Step 3: Set Up Environment Variables

**Important**: Your Gemini API key needs to be set as an environment variable on Vercel:

1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual API key (e.g., `AIzaSyBvYD5eyYmoM2wkgSufQT-WNHBajoPw-lw`)
   - **Environments**: Select all (Production, Preview, Development)

## Step 4: Verify Deployment

1. **Check build logs** in the Vercel dashboard
2. **Test your deployed app**:
   - Visit your app URL (e.g., `https://smartway-app.vercel.app`)
   - Test the API: `https://your-app-url.vercel.app/api/test`
   - Upload a document and generate study materials

## Step 5: Custom Domain (Optional)

If you want a custom domain:

1. Go to **Settings** → **Domains** in your Vercel project
2. Add your custom domain
3. Follow the DNS configuration instructions

## Troubleshooting

### Common Issues:

1. **API Key Not Found**:
   - Make sure `GEMINI_API_KEY` is set in Vercel environment variables
   - Redeploy after adding environment variables

2. **Build Fails**:
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are in `dependencies` (not `devDependencies`)

3. **API Routes Not Working**:
   - Verify `vercel.json` configuration is correct
   - Check that API files are in the `/api` directory

4. **File Upload Issues**:
   - Vercel has a 10MB request limit for serverless functions
   - Large files may timeout (adjust in `vercel.json`)

### Debug Steps:

1. **Check API endpoint**:
   ```bash
   curl https://your-app-url.vercel.app/api/test
   ```

2. **View function logs**:
   - Go to Vercel dashboard → Functions → View logs

3. **Test locally**:
   ```bash
   vercel dev
   ```

## Features Available After Deployment

✅ **Document Upload**: PDF, DOCX, DOC, TXT files  
✅ **AI Study Generation**: Powered by Google Gemini  
✅ **Interactive Quizzes**: Dynamic question generation  
✅ **Flashcards**: Spaced repetition learning  
✅ **Responsive Design**: Works on all devices  
✅ **Fast Loading**: Optimized for performance  

## Your App URLs

After deployment, your app will be available at:
- **Main App**: `https://your-project-name.vercel.app`
- **API Test**: `https://your-project-name.vercel.app/api/test`
- **API Generate**: `https://your-project-name.vercel.app/api/generate`

## Updating Your App

To update your deployed app:

1. Push changes to your GitHub repository
2. Vercel will automatically redeploy (if auto-deploy is enabled)
3. Or manually trigger a deployment from the Vercel dashboard

## Support

If you encounter issues:
- Check the Vercel documentation: https://vercel.com/docs
- Review the function logs in your Vercel dashboard
- Ensure your API key is valid and has proper permissions

---

🎉 **Congratulations!** Your SmartWay app is now live and accessible to users worldwide! 