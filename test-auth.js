const axios = require('axios');
const config = require('./src/config');

async function testAuthentication() {
  console.log('🔍 Testing Different Authentication Methods...');
  
  const baseURL = 'https://api.hyperzod.app';
  
  // Test different auth methods
  const authMethods = [
    {
      name: 'Bearer Token',
      headers: {
        'Authorization': `Bearer ${config.yojin.apiKey}`,
        'X-Tenant': config.yojin.tenant,
        'Accept': 'application/json'
      }
    },
    {
      name: 'API Key Header',
      headers: {
        'X-API-Key': config.yojin.apiKey,
        'X-Tenant': config.yojin.tenant,
        'Accept': 'application/json'
      }
    },
    {
      name: 'Basic Auth',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.yojin.tenant}:${config.yojin.apiKey}`).toString('base64')}`,
        'Accept': 'application/json'
      }
    }
  ];

  // Test some admin/management endpoints
  const endpoints = [
    '/admin/stores',
    '/admin/products',
    '/admin/merchants',
    '/management/stores',
    '/management/products',
    '/management/merchants',
    '/dashboard/stores',
    '/dashboard/products',
    '/dashboard/merchants',
    '/v1/admin/stores',
    '/v1/admin/products',
    '/v1/admin/merchants',
    '/api/admin/stores',
    '/api/admin/products',
    '/api/admin/merchants'
  ];

  for (const auth of authMethods) {
    console.log(`\n🔐 Testing ${auth.name}:`);
    
    for (const endpoint of endpoints) {
      try {
        console.log(`  🔍 ${endpoint}`);
        
        const response = await axios.get(`${baseURL}${endpoint}`, {
          headers: auth.headers,
          timeout: 5000,
          validateStatus: () => true
        });
        
        if (response.status === 200 && response.data && typeof response.data === 'object') {
          console.log(`  🎉 SUCCESS! Status: ${response.status}`);
          console.log(`  📄 Response:`, JSON.stringify(response.data, null, 2));
          return; // Stop on first success
        } else if (response.status !== 404) {
          console.log(`  📄 Status: ${response.status}, Response:`, response.data);
        }
        
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.log(`  ❌ Status: ${error.response.status}, Error: ${error.message}`);
        }
      }
    }
  }
}

testAuthentication()
  .then(() => {
    console.log('\n🎉 Authentication Test Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test Error:', error);
    process.exit(1);
  });
