const fs = require('fs');
const path = require('path');

const STORE_CONFIGS_DIR = './store-configs';
const EXAMPLES_DIR = './examples';

// Get production URL from user input or environment
const PRODUCTION_URL = process.argv[2] || process.env.PRODUCTION_URL || 'https://your-product-api.herokuapp.com';

if (!PRODUCTION_URL || PRODUCTION_URL.includes('your-product-api')) {
  console.error('❌ Please provide your production URL:');
  console.error('Usage: node scripts/update-production-urls.js https://your-deployed-api.herokuapp.com');
  process.exit(1);
}

console.log(`🔄 Updating store configurations with production URL: ${PRODUCTION_URL}`);

function updateFile(filePath, content) {
  const updatedContent = content.replace(
    /http:\/\/localhost:8080/g,
    PRODUCTION_URL
  );
  
  fs.writeFileSync(filePath, updatedContent);
  return updatedContent !== content; // Return true if changes were made
}

function updateDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Directory ${dirPath} not found, skipping...`);
    return 0;
  }
  
  const files = fs.readdirSync(dirPath);
  let updatedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.md'))) {
      const content = fs.readFileSync(filePath, 'utf8');
      const wasUpdated = updateFile(filePath, content);
      
      if (wasUpdated) {
        updatedCount++;
        console.log(`✅ Updated: ${file}`);
      }
    }
  });
  
  return updatedCount;
}

// Update store configurations
console.log('\n🏪 Updating store configurations...');
const storeConfigsUpdated = updateDirectory(STORE_CONFIGS_DIR);

// Update examples
console.log('\n📋 Updating examples...');
const examplesUpdated = updateDirectory(EXAMPLES_DIR);

// Update documentation
console.log('\n📚 Updating documentation...');
const docsUpdated = updateDirectory('./docs');

// Update main directory files
console.log('\n📄 Updating main directory files...');
const mainDirFiles = [
  'PUBLIC-API.md',
  'DEPLOYMENT-GUIDE.md',
  'INTEGRATION-STATUS.md',
  'README.md'
];

let mainFilesUpdated = 0;
mainDirFiles.forEach(file => {
  const filePath = `./${file}`;
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const wasUpdated = updateFile(filePath, content);
    
    if (wasUpdated) {
      mainFilesUpdated++;
      console.log(`✅ Updated: ${file}`);
    }
  }
});

console.log('\n🎉 Update Summary:');
console.log(`📁 Store configurations: ${storeConfigsUpdated} files updated`);
console.log(`📋 Examples: ${examplesUpdated} files updated`);
console.log(`📚 Documentation: ${docsUpdated} files updated`);
console.log(`📄 Main files: ${mainFilesUpdated} files updated`);

const totalUpdated = storeConfigsUpdated + examplesUpdated + docsUpdated + mainFilesUpdated;
console.log(`\n🚀 Total files updated: ${totalUpdated}`);
console.log(`🔗 Production URL: ${PRODUCTION_URL}`);

if (totalUpdated > 0) {
  console.log('\n✅ All configurations updated successfully!');
  console.log('Next steps:');
  console.log('1. Test your API with one store');
  console.log('2. Deploy the updated configurations');
  console.log('3. Roll out to all 991 stores');
} else {
  console.log('\n⚠️  No files needed updating (already using production URL)');
}
