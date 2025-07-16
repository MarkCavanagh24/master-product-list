const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function importProducts() {
  try {
    console.log('📦 Importing sample UK retail products...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream('sample-uk-products.csv'));
    
    const response = await axios.post('http://localhost:8080/api/products/import-csv', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    
    console.log('✅ Import successful!');
    console.log(`Summary: ${response.data.data.summary.successful} products imported, ${response.data.data.summary.failed} failed`);
    
    if (response.data.data.summary.failed > 0) {
      console.log('Failed products:');
      response.data.data.results.filter(r => !r.success).forEach(r => {
        console.log(`- ${r.sku}: ${r.error}`);
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Import failed:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    await importProducts();
    console.log('\n🎉 Sample products imported successfully!');
    console.log('You can now sync these products to all your stores using the dashboard or API.');
  } catch (error) {
    console.error('Failed to import products:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { importProducts };
