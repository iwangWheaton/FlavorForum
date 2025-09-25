# FlavorForum Vercel Deployment Guide

This guide will help you deploy your FlavorForum app to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you don't have one
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Firebase Project**: Your Firebase project should be set up and configured
4. **Google OAuth Credentials**: If using Google sign-in

## Step 1: Prepare Your Repository

1. **Commit all changes** to your repository:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify your build works locally**:
   ```bash
   npm run build
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project
5. Configure the following settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project

## Step 3: Configure Environment Variables

In your Vercel dashboard, go to your project settings and add the following environment variables:

### Required Environment Variables

#### Firebase Configuration (Client-side)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

#### Firebase Admin (Server-side)
```
FIREBASE_ADMIN_KEY_JSON={"type":"service_account","project_id":"your_project_id",...}
```

#### NextAuth Configuration
```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key
```

#### Google OAuth (if using Google sign-in)
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Cloudinary (if using for image uploads)
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### How to Get These Values

#### Firebase Configuration
1. Go to your Firebase Console
2. Select your project
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click on your web app or create one
6. Copy the config values

#### Firebase Admin Key
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the entire JSON content as a single line string for the `FIREBASE_ADMIN_KEY_JSON` variable

#### NextAuth Secret
Generate a random secret:
```bash
openssl rand -base64 32
```

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select your project
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set authorized redirect URIs to include your Vercel domain

## Step 4: Configure Firebase for Production

1. **Update Firebase Auth Settings**:
   - Go to Firebase Console > Authentication > Settings
   - Add your Vercel domain to "Authorized domains"
   - Format: `your-app-name.vercel.app`

2. **Update Firestore Security Rules** (if needed):
   - Go to Firebase Console > Firestore Database > Rules
   - Ensure your rules allow access from your production domain

3. **Update Storage Rules** (if using Firebase Storage):
   - Go to Firebase Console > Storage > Rules
   - Update rules for production access

## Step 5: Deploy and Test

1. **Deploy your project**:
   - If using Vercel CLI: `vercel --prod`
   - If using dashboard: Click "Deploy" button

2. **Test your deployment**:
   - Visit your Vercel URL
   - Test user registration/login
   - Test all major features
   - Check console for any errors

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Go to Settings > Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all environment variables are set
   - Ensure all dependencies are in `package.json`
   - Check build logs in Vercel dashboard

2. **Authentication Issues**:
   - Verify Firebase configuration
   - Check that authorized domains include your Vercel URL
   - Ensure NextAuth secret is set

3. **Database Connection Issues**:
   - Verify Firebase Admin key is correctly formatted
   - Check Firestore security rules
   - Ensure project ID matches

4. **Image Upload Issues**:
   - Verify Cloudinary configuration
   - Check file size limits
   - Ensure proper CORS settings

### Getting Help

- Check Vercel deployment logs
- Review Firebase console for errors
- Test locally with production environment variables
- Check Next.js documentation for specific issues

## Environment Variables Reference

Here's a complete list of all environment variables your app needs:

```bash
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (Server)
FIREBASE_ADMIN_KEY_JSON=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] User registration works
- [ ] User login works (both email/password and Google)
- [ ] Recipe creation works
- [ ] Image uploads work
- [ ] All pages are accessible
- [ ] Database operations work
- [ ] Authentication persists across page refreshes
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable

## Monitoring

- Set up Vercel Analytics (optional)
- Monitor Firebase usage
- Set up error tracking (Sentry, etc.)
- Monitor performance metrics

Your FlavorForum app should now be successfully deployed on Vercel! 🎉
