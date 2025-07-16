const axios = require('axios');
const YojinStoreIntegration = require('../src/services/YojinStoreIntegration');

/**
 * Test the integration with your current setup
 */
async function testCurrentIntegration() {
    console.log('🧪 Testing Yojin Store Integration...\n');
    
    const integration = new YojinStoreIntegration();
    const testStoreId = '6848451969ae1c9bcb0500da';
    
    try {
        // Test 1: API Health Check
        console.log('1. Testing API Health...');
        const healthResponse = await axios.get('http://localhost:8080/api/v1/health');
        console.log('✅ API Health:', healthResponse.data.status);
        
        // Test 2: Store Integration Test
        console.log('\n2. Testing Store Integration...');
        const testResults = await integration.testStoreIntegration(testStoreId);
        
        if (testResults.success) {
            console.log('✅ Store Integration Test PASSED');
            console.log(`   Store: ${testResults.storeName}`);
            console.log(`   Products Available: ${testResults.totalProducts}`);
            console.log(`   Sample Products: ${testResults.productCount}`);
        } else {
            console.log('❌ Store Integration Test FAILED');
            console.log(`   Error: ${testResults.error}`);
        }
        
        // Test 3: Generate Store Config
        console.log('\n3. Generating Store Configuration...');
        const config = integration.generateStoreConfig(testStoreId, 'Test Store');
        console.log('✅ Store Config Generated');
        console.log(`   Store ID: ${config.storeId}`);
        console.log(`   API URL: ${config.apiUrl}`);
        console.log(`   Test URL: ${config.testUrl}`);
        
        // Test 4: Test Public API Endpoint
        console.log('\n4. Testing Public API...');
        const publicResponse = await axios.get(`http://localhost:8080/api/v1/products?merchant_id=${testStoreId}&limit=3`);
        console.log('✅ Public API Response:', {
            products: publicResponse.data.data.products.length,
            store: publicResponse.data.data.merchant.name
        });
        
        console.log('\n🎉 All integration tests PASSED!');
        console.log('\n📋 Next Steps:');
        console.log('1. Your test page should be working at yojin-integration-test.html');
        console.log('2. Deploy to production when ready');
        console.log('3. Update store configurations with production URL');
        console.log('4. Integrate with yojin.co.uk stores');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
    }
}

// Run the test
testCurrentIntegration();