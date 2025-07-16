const axios = require('axios');

const API_BASE = 'http://localhost:8080';
const HARROGATE_STORE_ID = '6804ed7e609167bd23094bb3';

async function testLocalAPI() {
  console.log('🧪 Testing Local API Before Deployment...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/api/v1/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Get products for Harrogate store
    console.log('\n2️⃣ Testing Products Endpoint...');
    const productsResponse = await axios.get(`${API_BASE}/api/v1/products?merchant_id=${HARROGATE_STORE_ID}&limit=5`);
    console.log('✅ Products retrieved:', productsResponse.data.data.products.length, 'products');
    console.log('📊 Store:', productsResponse.data.data.merchant.name);
    
    // Test 3: Get categories
    console.log('\n3️⃣ Testing Categories Endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE}/api/v1/categories?merchant_id=${HARROGATE_STORE_ID}`);
    console.log('✅ Categories retrieved:', categoriesResponse.data.data.categories.length, 'categories');
    
    // Test 4: Get single product
    console.log('\n4️⃣ Testing Single Product Endpoint...');
    const singleProductResponse = await axios.get(`${API_BASE}/api/v1/products/UK001?merchant_id=${HARROGATE_STORE_ID}`);
    console.log('✅ Single product retrieved:', singleProductResponse.data.data.product.name);
    
    console.log('\n🎉 All API tests passed! Your API is ready for deployment.');
    console.log('\n🚀 Next steps:');
    console.log('1. Deploy to production (Heroku, AWS, etc.)');
    console.log('2. Update store configurations with production URL');
    console.log('3. Test with real stores');
    
  } catch (error) {
    console.error('❌ API Test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Fix: Start your local server first:');
      console.error('npm start');
    }
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run tests
testLocalAPI();
