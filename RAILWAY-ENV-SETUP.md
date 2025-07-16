# 🔑 Railway Environment Variables Setup

After selecting your repository in Railway, you need to set these environment variables:

## In Railway Dashboard:
1. **Click on your project** (after it's created)
2. **Go to "Variables" tab** (left sidebar)
3. **Click "New Variable"** and add each of these:

### Required Variables:
```
Name: YOJIN_API_KEY
Value: EBjrgmkOWV3_gkAOI3rrGpqI3CatXULyiowWvHe7oQZBQs-638W2u6uYU2zHJZBZQSirp3xzeg==

Name: YOJIN_API_URL
Value: https://yojin.co.uk/api

Name: YOJIN_TENANT
Value: 5564

Name: NODE_ENV
Value: production
```

### Optional Variables (with defaults):
```
Name: PORT
Value: 8080

Name: DATABASE_PATH
Value: ./data/database.sqlite
```

## ⚠️ Important Notes:
- These are your actual yojin.co.uk API credentials
- YOJIN_API_KEY is your authentication token
- YOJIN_TENANT (5564) is your tenant ID
- YOJIN_API_URL points to the yojin.co.uk API endpoint
- Make sure NODE_ENV is set to "production"
- Railway will automatically handle the PORT if you don't set it

## 🎯 After Setting Variables:
1. Railway will automatically redeploy
2. Wait for build to complete (usually 2-3 minutes)
3. Your app will be available at a URL like: `https://master-product-list-production.railway.app`

## 🧪 Test Your Deployment:
Once deployed, test these endpoints:
- Health check: `https://your-url.railway.app/api/health`
- Dashboard: `https://your-url.railway.app`
- Products API: `https://your-url.railway.app/api/v1/products`
