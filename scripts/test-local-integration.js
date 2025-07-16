const axios = require('axios');

async function testLocalIntegration() {
    console.log('🧪 Testing Local Integration...\n');
    
    const baseUrl = 'http://localhost:8080';
    const storeId = '6848451969ae1c9bcb0500da';
    
    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await axios.get(`${baseUrl}/api/v1/health`);
        console.log('✅ Health Check:', healthResponse.data.status);
        
        // Test 2: Products Endpoint
        console.log('\n2. Testing Products Endpoint...');
        const productsResponse = await axios.get(`${baseUrl}/api/v1/products?merchant_id=${storeId}&limit=5`);
        console.log('✅ Products:', productsResponse.data.data.products.length, 'products loaded');
        console.log('   Store:', productsResponse.data.data.merchant.name);
        
        // Test 3: Categories Endpoint
        console.log('\n3. Testing Categories Endpoint...');
        const categoriesResponse = await axios.get(`${baseUrl}/api/v1/categories?merchant_id=${storeId}`);
        console.log('✅ Categories:', categoriesResponse.data.data.categories.length, 'categories loaded');
        
        console.log('\n🎉 All tests passed! Your integration should work now.');
        console.log('\n📋 Next steps:');
        console.log('1. Refresh your test page: http://127.0.0.1:5500/yojin-integration-test.html');
        console.log('2. Select "Local (localhost:8080)" option');
        console.log('3. Click "Switch & Test"');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure your server is running:');
            console.log('   npm start');
        }
    }
}

testLocalIntegration();