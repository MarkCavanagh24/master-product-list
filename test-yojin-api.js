const axios = require('axios');
const config = require('./src/config');

async function testYojinAPI() {
  console.log('🔍 Testing Yojin API Connection...');
  console.log(`API URL: ${config.yojin.apiUrl}`);
  console.log(`API Key: ${config.yojin.apiKey ? 'Set' : 'Missing'}`);
  console.log(`Tenant: ${config.yojin.tenant}`);
  
  try {
    // Test 1: Basic API health check
    console.log('\n1️⃣ Testing API Health...');
    const healthResponse = await axios.get(`${config.yojin.apiUrl}/health`, {
      headers: {
        'Authorization': `Bearer ${config.yojin.apiKey}`,
        'X-Tenant': config.yojin.tenant,
      },
      timeout: 10000,
    });
    console.log('✅ Health check passed:', healthResponse.status);
    
    // Test 2: List stores/merchants
    console.log('\n2️⃣ Testing Store List...');
    const storesResponse = await axios.get(`${config.yojin.apiUrl}/stores`, {
      headers: {
        'Authorization': `Bearer ${config.yojin.apiKey}`,
        'X-Tenant': config.yojin.tenant,
      },
      timeout: 10000,
    });
    console.log('✅ Store list retrieved:', storesResponse.data);
    
    // Test 3: Test with Harrogate store ID
    console.log('\n3️⃣ Testing Harrogate Store Access...');
    const harrogateId = '6804ed7e609167bd23094bb3';
    const harrogateResponse = await axios.get(`${config.yojin.apiUrl}/stores/${harrogateId}`, {
      headers: {
        'Authorization': `Bearer ${config.yojin.apiKey}`,
        'X-Tenant': config.yojin.tenant,
      },
      timeout: 10000,
    });
    console.log('✅ Harrogate store access successful:', harrogateResponse.data);
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data || error.message);
    console.error('Headers sent:', error.config?.headers);
    
    if (error.response?.status === 401) {
      console.log('\n🔧 Authentication Issue:');
      console.log('- Check if your API key is correct');
      console.log('- Verify the tenant ID is correct');
      console.log('- Ensure the API key has proper permissions');
    }
    
    if (error.response?.status === 403) {
      console.log('\n🔧 Authorization Issue:');
      console.log('- Your API key may not have access to this endpoint');
      console.log('- Check if the tenant ID is correct');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection Issue:');
      console.log('- Check if the API URL is correct');
      console.log('- Verify you have internet connectivity');
    }
  }
}

// Run the test
testYojinAPI()
  .then(() => {
    console.log('\n🎉 API Test Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test Script Error:', error);
    process.exit(1);
  });
