const axios = require('axios');
const config = require('./src/config');

async function discoverYojinAPI() {
  console.log('🔍 Discovering Yojin API Structure...');
  
  const possibleEndpoints = [
    '/api/v1/health',
    '/api/health',
    '/health',
    '/api/v1/stores',
    '/api/stores',
    '/stores',
    '/api/v1/products',
    '/api/products',
    '/products',
    '/api/v1/merchants',
    '/api/merchants',
    '/merchants',
    '/api/v1/auth',
    '/api/auth',
    '/auth'
  ];

  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`\n🔍 Testing: ${config.yojin.apiUrl}${endpoint}`);
      
      const response = await axios.get(`${config.yojin.apiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${config.yojin.apiKey}`,
          'X-Tenant': config.yojin.tenant,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000,
        validateStatus: () => true // Accept all status codes
      });
      
      console.log(`✅ Status: ${response.status}`);
      
      // Check if response is JSON
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        console.log(`📄 JSON Response:`, response.data);
      } else {
        console.log(`📄 Content-Type: ${contentType || 'Unknown'}`);
        console.log(`📄 Response Length: ${response.data?.length || 0} characters`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Also test the hyperzod API that appears in the HTML
async function testHyperzodAPI() {
  console.log('\n\n🔍 Testing Hyperzod API (from HTML)...');
  
  try {
    const response = await axios.get('https://api.hyperzod.app/health', {
      headers: {
        'Authorization': `Bearer ${config.yojin.apiKey}`,
        'X-Tenant': config.yojin.tenant,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 5000,
      validateStatus: () => true
    });
    
    console.log(`✅ Hyperzod Status: ${response.status}`);
    console.log(`📄 Response:`, response.data);
    
  } catch (error) {
    console.log(`❌ Hyperzod Error: ${error.message}`);
  }
}

discoverYojinAPI()
  .then(() => testHyperzodAPI())
  .then(() => {
    console.log('\n🎉 API Discovery Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Discovery Error:', error);
    process.exit(1);
  });
