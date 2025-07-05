# Vercel Blob Setup Guide

## 🎯 Overview

Your SmartWay app now supports file uploads using Vercel Blob - a serverless file storage solution designed specifically for Vercel deployments. This guide will help you set up Blob storage for your project.

## 📋 Setup Steps

### 1. Access Your Project on Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Navigate to your SmartWay project dashboard

### 2. Create a Blob Store

1. In your project dashboard, click on the **Storage** tab
2. Click **Connect Database** button
3. Under the **Create New** tab, select **Blob**
4. Click **Continue**
5. Use the name "smartway-files" (or any name you prefer)
6. Select **Create a new Blob store**
7. Choose the environments where you want file upload enabled (Production, Preview, Development)
8. Click **Create**

### 3. Environment Variables

Vercel will automatically create and add the `BLOB_READ_WRITE_TOKEN` environment variable to your project. This token allows your app to upload and manage files in the Blob store.

### 4. Local Development (Optional)

If you want to test file uploads locally:

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Pull environment variables: `vercel env pull`

## ✅ Features Enabled

With Vercel Blob configured, your app now supports:

- **📄 Text File Uploads** (.txt) - Full support with text extraction
- **📝 PDF & Word Documents** - Upload supported, with helpful guidance to copy-paste content for best results
- **🔒 Secure Storage** - Files are stored securely in Vercel's infrastructure
- **🚀 Serverless Compatible** - No payload size limits for file uploads
- **⚡ Fast Upload** - Direct client-to-storage uploads

## 🔧 File Support Details

### ✅ Fully Supported
- **Text Files (.txt)** - Complete text extraction and processing

### ⚠️ Partial Support
- **PDF Files (.pdf)** - Upload works, but text extraction requires specialized processing
- **Word Documents (.docx, .doc)** - Upload works, but text extraction requires specialized processing

### 💡 Recommendation
For PDF and Word documents, the app will suggest copying and pasting the text content directly into the text input area for optimal results.

## 🚨 Troubleshooting

### "Failed to upload file"
- Check that your Blob store is properly configured
- Ensure the `BLOB_READ_WRITE_TOKEN` environment variable is set
- Try re-deploying your app

### "File too large"
- File size limit is 4MB for optimal performance
- For larger files, copy and paste the text content directly

### Environment Variable Missing
- In Vercel dashboard, go to Settings > Environment Variables
- Ensure `BLOB_READ_WRITE_TOKEN` is present and has a value
- If missing, recreate the Blob store

## 📚 Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [File Upload Best Practices](https://vercel.com/docs/storage/vercel-blob/server-uploads)

---

**Ready to go!** Your file upload system is now powered by Vercel Blob and optimized for serverless deployment. 🎉 