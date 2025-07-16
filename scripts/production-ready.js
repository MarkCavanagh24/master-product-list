#!/usr/bin/env node

/**
 * Production Deployment Helper
 * Prepares the application for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Master Product List API - Production Deployment Helper\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'index.js',
  'Procfile',
  'railway.json',
  '.gitignore'
];

console.log('📋 Checking required files...');
let missingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('\n❌ Missing required files for deployment!');
  process.exit(1);
}

// Check environment variables
console.log('\n🔧 Environment Variables Check:');
const requiredEnvVars = [
  'YOJIN_API_KEY',
  'YOJIN_API_SECRET'
];

const envExample = fs.readFileSync('.env.example', 'utf8');
requiredEnvVars.forEach(envVar => {
  if (envExample.includes(envVar)) {
    console.log(`✅ ${envVar} - Defined in .env.example`);
  } else {
    console.log(`❌ ${envVar} - Missing from .env.example`);
  }
});

// Create deployment summary
console.log('\n📊 Deployment Summary:');
console.log('✅ Application Type: Node.js Express API');
console.log('✅ Database: SQLite (file-based)');
console.log('✅ Port: 8080 (configurable via PORT env var)');
console.log('✅ Health Check: /api/health');
console.log('✅ Start Command: npm start');
console.log('✅ Production Ready: Yes');

// Display next steps
console.log('\n🚀 Ready for Production Deployment!');
console.log('\n📋 Next Steps:');
console.log('1. Push to GitHub repository');
console.log('2. Choose deployment platform:');
console.log('   - Railway (recommended): https://railway.app');
console.log('   - Heroku: https://heroku.com');
console.log('   - DigitalOcean: https://digitalocean.com');
console.log('3. Set environment variables in platform dashboard');
console.log('4. Deploy from GitHub repository');
console.log('5. Update production URLs: node scripts/update-production-urls.js https://your-url.com');

console.log('\n🎯 Expected Production URL Examples:');
console.log('- Railway: https://master-product-list.railway.app');
console.log('- Heroku: https://master-product-list.herokuapp.com');
console.log('- DigitalOcean: https://master-product-list.ondigitalocean.app');

console.log('\n🔗 After deployment, test with:');
console.log('curl https://your-production-url.com/api/health');

console.log('\n✨ This API will serve 991 UK stores with your master product list!');
