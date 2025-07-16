// Add a new merchant to test with
const axios = require('axios');

async function addTestMerchant() {
  const merchantData = {
    merchant_id: '6848451969ae1c9bcb0500da',
    name: 'Yojin Whickham',
    api_key: '',
    is_active: 1
  };

  try {
    const response = await axios.post('http://localhost:8080/api/merchants', merchantData);
    console.log('✅ Test merchant added successfully:', response.data);
    
    // Now test the products endpoint
    console.log('\n🧪 Testing products endpoint with new merchant...');
    const productsResponse = await axios.get(`http://localhost:8080/api/v1/products?merchant_id=6848451969ae1c9bcb0500da&limit=3`);
    console.log('✅ Products retrieved:', productsResponse.data.data.products.length, 'products');
    console.log('📊 Store:', productsResponse.data.data.merchant.name);
    
    // Show first product
    if (productsResponse.data.data.products.length > 0) {
      const product = productsResponse.data.data.products[0];
      console.log('\n📦 Sample Product:');
      console.log(`- Name: ${product.name}`);
      console.log(`- Price: £${product.price}`);
      console.log(`- Category: ${product.category}`);
      console.log(`- SKU: ${product.sku}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

addTestMerchant();
