// Integration code for yojin.co.uk stores
const STORE_ID = '6848451969ae1c9bcb0500da';
const API_URL = 'https://yummy-seals-battle.loca.lt';

// Load products for store page
async function loadYojinProducts(page = 1, limit = 20) {
  try {
    const response = await fetch(`${API_URL}/api/v1/products?merchant_id=${STORE_ID}&page=${page}&limit=${limit}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Loaded ${data.data.products.length} products for ${data.data.merchant.name}`);
      return data.data.products;
    } else {
      console.error('❌ Failed to load products:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    return [];
  }
}

// Search products
async function searchYojinProducts(query, limit = 20) {
  try {
    const response = await fetch(`${API_URL}/api/v1/products?merchant_id=${STORE_ID}&search=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`🔍 Found ${data.data.products.length} products for "${query}"`);
      return data.data.products;
    } else {
      console.error('❌ Search failed:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Search Error:', error);
    return [];
  }
}

// Get product categories
async function getYojinCategories() {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories?merchant_id=${STORE_ID}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`📂 Loaded ${data.data.categories.length} categories`);
      return data.data.categories;
    } else {
      console.error('❌ Failed to load categories:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Categories Error:', error);
    return [];
  }
}

// Test the integration
async function testYojinIntegration() {
  console.log('🧪 Testing Yojin Integration...');
  
  // Test 1: Load products
  const products = await loadYojinProducts(1, 5);
  products.forEach(product => {
    console.log(`📦 ${product.name} - £${product.price} (${product.category})`);
  });
  
  // Test 2: Search products
  const searchResults = await searchYojinProducts('coca', 3);
  console.log('\n🔍 Search Results:');
  searchResults.forEach(product => {
    console.log(`📦 ${product.name} - £${product.price}`);
  });
  
  // Test 3: Get categories
  const categories = await getYojinCategories();
  console.log('\n📂 Categories:', categories.join(', '));
  
  console.log('\n🎉 Integration test complete!');
}

// Run the test
testYojinIntegration();
