const axios = require('axios');
const config = require('./src/config');

async function testHyperzodEndpoints() {
  console.log('🔍 Testing Hyperzod API Endpoints...');
  console.log(`API Key: ${config.yojin.apiKey ? 'Set' : 'Missing'}`);
  console.log(`Tenant: ${config.yojin.tenant}`);
  
  const baseURL = 'https://api.hyperzod.app';
  
  const endpoints = [
    '/v1/health',
    '/health',
    '/v1/stores',
    '/stores',
    '/v1/products',
    '/products',
    '/v1/merchants',
    '/merchants',
    '/v1/auth/me',
    '/auth/me',
    '/v1/tenant/info',
    '/tenant/info'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${baseURL}${endpoint}`);
      
      const response = await axios.get(`${baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${config.yojin.apiKey}`,
          'X-Tenant': config.yojin.tenant,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        validateStatus: () => true
      });
      
      console.log(`✅ Status: ${response.status}`);
      
      if (response.data && typeof response.data === 'object') {
        console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
      } else {
        console.log(`📄 Response:`, response.data);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

testHyperzodEndpoints()
  .then(() => {
    console.log('\n🎉 Hyperzod API Test Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test Error:', error);
    process.exit(1);
  });
