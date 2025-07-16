# 🚀 Railway Deployment - Step by Step Guide

## Step 1: Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click the "+" icon** in the top right corner
3. **Select "New repository"**
4. **Fill in the details:**
   - Repository name: `master-product-list`
   - Description: `Master Product List API for yojin.co.uk SaaS platform`
   - Make it **Public** (required for free Railway deployment)
   - Don't initialize with README (we already have files)
5. **Click "Create repository"**

## Step 2: Push to GitHub

After creating the repository, run these commands in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/master-product-list.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Deploy to Railway

1. **Go to https://railway.app**
2. **Sign in with your GitHub account**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your `master-product-list` repository**
6. **Railway will automatically detect it's a Node.js app**

## Step 4: Set Environment Variables

In the Railway dashboard:

1. **Click on your project**
2. **Go to "Variables" tab**
3. **Add these environment variables:**
   - `YOJIN_API_KEY` = `your_actual_api_key_here`
   - `YOJIN_API_SECRET` = `your_actual_api_secret_here`
   - `NODE_ENV` = `production`

## Step 5: Deploy

1. **Railway will automatically deploy** after you set the variables
2. **Wait for the deployment to complete** (usually 2-3 minutes)
3. **Get your production URL** from the Railway dashboard
   - It will look like: `https://master-product-list-production.railway.app`

## Step 6: Test Your Deployment

Test your API endpoints:

```bash
curl https://your-railway-url.railway.app/api/health
curl https://your-railway-url.railway.app/api/v1/products
```

## Step 7: Update Production URLs

Once deployed, update all store configurations:

```bash
node scripts/update-production-urls.js https://your-railway-url.railway.app
```

## Step 8: Commit Updated URLs

```bash
git add .
git commit -m "Update production URLs for Railway deployment"
git push origin main
```

## 🎉 You're Done!

Your Master Product List API is now live and ready to serve 991 UK stores!

### Your Production Endpoints:
- **API Health**: `https://your-url.railway.app/api/health`
- **Dashboard**: `https://your-url.railway.app`
- **Products API**: `https://your-url.railway.app/api/v1/products`
- **Whickham Integration**: `https://your-url.railway.app/api/integration/whickham`

### Next Steps:
1. Test the Whickham integration
2. Begin rolling out to other stores
3. Monitor performance and scaling
