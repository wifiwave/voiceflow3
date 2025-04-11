# Simplified Vercel Deployment Guide for VoiceFlow.AI

This simplified guide will help you deploy the VoiceFlow.AI platform to Vercel with minimal technical knowledge required.

## Step 1: Upload Files to Vercel

1. Go to your Vercel dashboard (vercel.com)
2. Click "Add New..." → "Project"
3. Select "Upload" at the bottom of the page
4. Drag and drop the files from the ZIP file you downloaded (not the ZIP file itself, but its extracted contents)

## Step 2: Configure Project Settings

1. Project Name: `voiceflow_ai` (important: use only letters, digits, and underscores)
2. Framework Preset: Next.js (should be auto-detected)
3. Root Directory: Leave blank (this is important - do not change this setting)
4. Build Command: `npm run build` (should be auto-filled)
5. Output Directory: `.next` (should be auto-filled)

## Step 3: Add Environment Variables

1. Expand the "Environment Variables" section
2. Add these two variables exactly as shown:
   - Name: `NEXT_PUBLIC_PLAY_AI_USER_ID`
   - Value: `806xCl1AM8gioiGbay9P65cyIDu1`
   
   - Name: `NEXT_PUBLIC_PLAY_AI_API_KEY`
   - Value: `ak-28c1d4f423d647698bb2f6ebbc6040fb`

## Step 4: Deploy

1. Click the "Deploy" button
2. Wait for deployment to complete (usually 2-3 minutes)
3. Click the URL provided to access your VoiceFlow.AI platform

## Common Issues and Solutions

- **Error about project name**: Make sure your project name only contains letters, digits, and underscores (no spaces or special characters)
- **Build fails**: Verify you've added both environment variables exactly as shown above

## What's Different in This Version

This package has been restructured to fix the "Couldn't find any 'pages' or 'app' directory" error by ensuring the pages directory is at the root level where Vercel expects it.
