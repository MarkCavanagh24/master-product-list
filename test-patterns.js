const axios = require('axios');
const config = require('./src/config');

async function testCommonEndpoints() {
  console.log('🔍 Testing Common API Patterns...');
  
  const baseURL = 'https://api.hyperzod.app';
  
  // Try different patterns with tenant in URL
  const endpoints = [
    `/tenant/${config.yojin.tenant}/stores`,
    `/tenant/${config.yojin.tenant}/products`,
    `/tenant/${config.yojin.tenant}/merchants`,
    `/tenant/${config.yojin.tenant}/info`,
    `/v1/tenant/${config.yojin.tenant}/stores`,
    `/v1/tenant/${config.yojin.tenant}/products`,
    `/v1/tenant/${config.yojin.tenant}/merchants`,
    `/api/v1/stores`,
    `/api/v1/products`,
    `/api/v1/merchants`,
    `/api/stores`,
    `/api/products`,
    `/api/merchants`,
    `/${config.yojin.tenant}/stores`,
    `/${config.yojin.tenant}/products`,
    `/${config.yojin.tenant}/merchants`,
    `/stores/${config.yojin.tenant}`,
    `/products/${config.yojin.tenant}`,
    `/merchants/${config.yojin.tenant}`,
    // Try without tenant but with headers
    '/v1/stores',
    '/v1/products',
    '/v1/merchants',
    '/api/v1/stores',
    '/api/v1/products', 
    '/api/v1/merchants'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${baseURL}${endpoint}`);
      
      const response = await axios.get(`${baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${config.yojin.apiKey}`,
          'X-Tenant': config.yojin.tenant,
          'X-Tenant-ID': config.yojin.tenant,
          'Tenant': config.yojin.tenant,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        validateStatus: () => true
      });
      
      console.log(`✅ Status: ${response.status}`);
      
      if (response.status === 200 && response.data && typeof response.data === 'object') {
        console.log(`🎉 SUCCESS! Found working endpoint:`);
        console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
        break; // Stop on first success
      } else if (response.status !== 404) {
        console.log(`📄 Response:`, response.data);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

testCommonEndpoints()
  .then(() => {
    console.log('\n🎉 API Pattern Test Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test Error:', error);
    process.exit(1);
  });
