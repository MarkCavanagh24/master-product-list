# 🔧 Railway Environment Variables - Copy These Exactly

## Add these 4 variables in Railway Dashboard:

### Variable 1:
**Name:** YOJIN_API_URL
**Value:** https://api.hyperzod.app/v1

### Variable 2:
**Name:** YOJIN_API_KEY
**Value:** EBjrgmkOWV3_gkAOI3rrGpqI3CatXULyiowWvHe7oQZBQs-638W2u6uYU2zHJZBZQSirp3xzeg==

### Variable 3:
**Name:** YOJIN_TENANT
**Value:** 5564

### Variable 4:
**Name:** NODE_ENV
**Value:** production

## Steps in Railway Dashboard:
1. Click "Variables" tab
2. Click "New Variable" 
3. Enter Name and Value exactly as shown above
4. Click "Add"
5. Repeat for all 4 variables
6. Railway will automatically redeploy

## After setting variables:
- Wait 2-3 minutes for redeploy
- Test: https://web-production-53d80.up.railway.app/api/sync/test-connection
- Should return success: true
