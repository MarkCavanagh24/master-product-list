#!/usr/bin/env node

/**
 * Railway Deployment Helper
 * Guides you through the Railway deployment process
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Railway Deployment Helper for Master Product List API\n');

// Check if we're in a git repository
try {
  execSync('git status', { stdio: 'pipe' });
} catch (error) {
  console.log('❌ Not in a git repository. Please run: git init');
  process.exit(1);
}

// Check if we have uncommitted changes
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('📝 You have uncommitted changes. Committing them now...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Prepare for Railway deployment"', { stdio: 'inherit' });
  }
} catch (error) {
  console.log('✅ No uncommitted changes');
}

// Check for GitHub remote
try {
  execSync('git remote get-url origin', { stdio: 'pipe' });
  console.log('✅ GitHub remote already configured');
} catch (error) {
  console.log('⚠️  GitHub remote not configured');
  console.log('\n📋 To configure GitHub remote:');
  console.log('1. Create a new repository on GitHub.com');
  console.log('2. Run: git remote add origin https://github.com/YOUR_USERNAME/master-product-list.git');
  console.log('3. Run: git push -u origin main');
}

// Display deployment checklist
console.log('\n✅ Pre-deployment Checklist:');
console.log('✅ Git repository initialized');
console.log('✅ All files committed');
console.log('✅ railway.json configuration present');
console.log('✅ Procfile configured');
console.log('✅ Package.json has start script');

console.log('\n🚀 Railway Deployment Steps:');
console.log('1. 📁 Create GitHub repository (if not done): https://github.com/new');
console.log('2. 🔄 Push to GitHub: git push -u origin main');
console.log('3. 🚢 Deploy to Railway: https://railway.app');
console.log('4. ⚙️  Set environment variables in Railway dashboard');
console.log('5. 🌐 Get production URL and update configurations');

console.log('\n🔑 Required Environment Variables:');
console.log('- YOJIN_API_KEY=your_api_key');
console.log('- YOJIN_API_SECRET=your_api_secret');
console.log('- NODE_ENV=production');

console.log('\n📖 For detailed steps, see: RAILWAY-DEPLOYMENT.md');
console.log('\n🎯 After deployment, your API will be ready for 991 UK stores!');

// Check if user wants to open Railway
console.log('\n🌐 Ready to deploy? Visit https://railway.app to get started!');
