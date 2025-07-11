# Deployment Guide

This guide will help you deploy your grATE App to the cloud so it's accessible over the internet.

## Prerequisites

1. **MongoDB Atlas Setup** (Required)
   - Follow the MongoDB Atlas setup in the main README.md
   - Ensure your connection string is ready

2. **GitHub Repository**
   - Push your code to GitHub
   - Ensure all files are committed

## Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway is a modern deployment platform that's very easy to use.

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   - Go to your project settings
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `PORT`: 3000 (or leave empty for Railway to set)

4. **Deploy**
   - Railway will automatically detect your Node.js app
   - It will install dependencies and start the server
   - Your app will be available at a Railway-provided URL

### Option 2: Render

Render is another excellent platform for Node.js apps.

1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name**: grate-app (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or specify if needed)

4. **Add Environment Variables**
   - Go to Environment tab
   - Add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `PORT`: 3000

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Your app will be available at a Render-provided URL

### Option 3: Heroku

Heroku is a well-established platform.

1. **Sign up for Heroku**
   - Go to [heroku.com](https://heroku.com)
   - Create an account

2. **Install Heroku CLI**
   ```bash
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   
   # macOS
   brew tap heroku/brew && brew install heroku
   ```

3. **Create Heroku App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

4. **Configure Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 4: Vercel

Vercel is great for full-stack applications.

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add `MONGODB_URI` with your connection string

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app

## Post-Deployment

### 1. Test Your App
- Visit your deployed URL
- Test user registration and login
- Ensure all features work correctly

### 2. Update Frontend URLs (if needed)
If your frontend makes API calls to localhost, update them to use your deployed URL:

```javascript
// Instead of
const response = await fetch('http://localhost:3000/api/auth/signin', {
    // ...
});

// Use
const response = await fetch('https://your-app-url.com/api/auth/signin', {
    // ...
});
```

### 3. Set up Custom Domain (Optional)
Most platforms allow you to add a custom domain:
- **Railway**: Settings → Domains
- **Render**: Settings → Custom Domains
- **Heroku**: Settings → Domains
- **Vercel**: Settings → Domains

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure `package-lock.json` is committed
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check that your IP is whitelisted in Atlas
   - Ensure database user has correct permissions

3. **Environment Variables**
   - Double-check variable names (case-sensitive)
   - Ensure no extra spaces or quotes
   - Redeploy after changing environment variables

4. **Port Issues**
   - Most platforms set PORT automatically
   - Remove hardcoded port numbers from code
   - Use `process.env.PORT || 3000`

### Getting Help

- Check platform-specific logs in your deployment dashboard
- Review the platform's documentation
- Ensure your local app works before deploying

## Cost Considerations

- **Railway**: Free tier available, then $5/month
- **Render**: Free tier available, then $7/month
- **Heroku**: No free tier anymore, starts at $7/month
- **Vercel**: Generous free tier, then $20/month

## Security Notes

- Never commit your `.env` file to Git
- Use environment variables for sensitive data
- Regularly update dependencies
- Consider adding rate limiting for production 