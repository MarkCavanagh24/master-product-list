# Production Deployment Guide

## Quick Deploy Options

### Option 1: Railway (Recommended - No CLI needed)
1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/master-product-list.git
   git push -u origin main
   ```

2. **Deploy to Railway:**
   - Go to https://railway.app
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set environment variables:
     - `YOJIN_API_KEY` = your_api_key
     - `YOJIN_API_SECRET` = your_api_secret
     - `NODE_ENV` = production
   - Click "Deploy"

3. **Get your production URL:**
   - Railway will provide a URL like: `https://your-app-name.railway.app`
   - Copy this URL for the next step

### Option 2: Heroku (Install CLI first)
1. **Install Heroku CLI:**
   - Download from https://devcenter.heroku.com/articles/heroku-cli
   - Or use npm: `npm install -g heroku`

2. **Deploy to Heroku:**
   ```bash
   heroku create your-app-name
   heroku config:set YOJIN_API_KEY=your_key
   heroku config:set YOJIN_API_SECRET=your_secret
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform
1. **Create account at https://digitalocean.com**
2. **Create new app from GitHub**
3. **Set environment variables**
4. **Deploy**

## After Deployment

### Update Production URLs
Replace localhost URLs with your production URL:
```bash
node scripts/update-production-urls.js https://your-production-url.com
```

### Test Your Production API
```bash
curl https://your-production-url.com/api/health
```

### Deploy Updated Store Configurations
After updating URLs, commit and push changes:
```bash
git add .
git commit -m "Updated production URLs"
git push origin main
```

## Environment Variables Required
- `YOJIN_API_KEY` - Your yojin.co.uk API key
- `YOJIN_API_SECRET` - Your yojin.co.uk API secret  
- `NODE_ENV` - Set to "production"

## Monitoring
- Health endpoint: `https://your-url.com/api/health`
- Dashboard: `https://your-url.com`
- API docs: `https://your-url.com/api`

## Ready for 991 Stores! 🎉
Once deployed, your API will be ready to handle all UK stores with the master product list system.
