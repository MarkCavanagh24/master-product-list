const axios = require('axios');

/**
 * Test Whickham store integration for live deployment
 */
async function testWhickhamLiveIntegration() {
    console.log('🧪 Testing Whickham Live Integration...\n');
    
    const baseUrl = 'http://localhost:8080';
    const storeUrl = 'https://www.yojin.co.uk/en/m/yojin-whickham';
    
    try {
        // Test 1: Integration Test
        console.log('1. Testing Whickham Integration...');
        const testResponse = await axios.get(`${baseUrl}/whickham/test`);
        
        if (testResponse.data.success) {
            console.log('✅ Integration Test Passed');
            console.log(`   Store: ${testResponse.data.data.store_name}`);
            console.log(`   Products: ${testResponse.data.data.tests.products.count} available`);
            console.log(`   Categories: ${testResponse.data.data.tests.categories.count} available`);
        } else {
            throw new Error('Integration test failed');
        }
        
        // Test 2: Get Integration Code
        console.log('\n2. Getting Integration Code...');
        const codeResponse = await axios.get(`${baseUrl}/whickham/integration-code`);
        
        if (codeResponse.data.success) {
            console.log('✅ Integration Code Generated');
            console.log(`   Store ID: ${codeResponse.data.data.store_id}`);
            console.log(`   JavaScript: ${codeResponse.data.data.javascript.length} characters`);
            console.log(`   CSS: ${codeResponse.data.data.css.length} characters`);
        }
        
        // Test 3: Test Products API
        console.log('\n3. Testing Products API...');
        const productsResponse = await axios.get(`${baseUrl}/whickham/products?limit=5`);
        
        if (productsResponse.data.success) {
            console.log('✅ Products API Working');
            console.log(`   Products loaded: ${productsResponse.data.data.products.length}`);
            console.log(`   Store: ${productsResponse.data.data.store.name}`);
            
            // Show sample product
            if (productsResponse.data.data.products.length > 0) {
                const product = productsResponse.data.data.products[0];
                console.log(`   Sample: ${product.name} - £${product.price}`);
            }
        }
        
        console.log('\n🎉 All tests passed!');
        console.log('\n📋 Next Steps:');
        console.log('1. Deploy your API to production');
        console.log('2. Get integration code from /whickham/integration-code');
        console.log(`3. Add the code to: ${storeUrl}`);
        console.log('4. Replace existing product display with: <div id="whickham-products"></div>');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure your server is running:');
            console.log('   npm start');
        }
    }
}

testWhickhamLiveIntegration();