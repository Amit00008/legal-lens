# Legal document analyzer

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/amitdey1350-gmailcoms-projects/v0-legal-document-analyzer)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/Ga8PpgyMYag)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/amitdey1350-gmailcoms-projects/v0-legal-document-analyzer](https://vercel.com/amitdey1350-gmailcoms-projects/v0-legal-document-analyzer)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/Ga8PpgyMYag](https://v0.dev/chat/projects/Ga8PpgyMYag)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## PDF Report Generation

The app now includes comprehensive PDF report generation with the following features:

### Features:
- **Complete Analysis Data**: Includes risk assessment, categories, key findings, legal questions, and summary
- **Professional Formatting**: Clean, readable PDF layout with proper sections
- **Vercel Blob Storage**: Optional cloud storage for generated reports
- **Direct Download**: Immediate download without redirects
- **Loading States**: Visual feedback during generation

### Setup for Vercel Blob (Optional):

To enable cloud storage for PDF reports, add your Vercel Blob token to your environment variables:

1. Go to [Vercel Dashboard > Storage > Blob](https://vercel.com/dashboard/stores/blob)
2. Create a new Blob store or use existing one
3. Copy your `BLOB_READ_WRITE_TOKEN`
4. Add to your `.env.local` file:
   ```
   BLOB_READ_WRITE_TOKEN=your_token_here
   ```

### API Endpoints:
- `/api/generate-report-blob` - Generate PDF with Vercel Blob storage
- `/api/generate-report` - Generate PDF with Supabase storage (fallback)

### Usage:
- Click "Download Report" on any completed analysis
- PDF includes all analysis data in professional format
- Reports can be saved to cloud storage or downloaded directly