const axios = require('axios');
const config = require('./src/config');

// Demo script to show how the bulk sync would work
async function demonstrateBulkSync() {
  try {
    console.log('🚀 Master Product List - Bulk Sync Demonstration');
    console.log('================================================\n');
    
    // Get system statistics
    console.log('📊 Getting current system status...');
    
    const productsResponse = await axios.get('http://localhost:8080/api/products');
    const merchantsResponse = await axios.get('http://localhost:8080/api/merchants');
    
    const totalProducts = productsResponse.data.data.pagination.total;
    const activeMerchants = merchantsResponse.data.data.filter(m => m.is_active).length;
    
    console.log(`✅ Products in master catalog: ${totalProducts}`);
    console.log(`✅ Active merchants: ${activeMerchants}`);
    console.log(`📈 Total sync operations needed: ${totalProducts * activeMerchants} (${totalProducts.toLocaleString()} × ${activeMerchants.toLocaleString()})`);
    
    // Calculate efficiency savings
    const oldWay = totalProducts * activeMerchants; // Individual uploads
    const newWay = totalProducts + activeMerchants; // Master list + sync operations
    const timeSaved = ((oldWay - newWay) / oldWay * 100).toFixed(1);
    
    console.log('\n💡 Efficiency Analysis:');
    console.log(`❌ Old way: ${oldWay.toLocaleString()} individual product uploads`);
    console.log(`✅ New way: ${totalProducts} master products + ${activeMerchants} sync operations = ${newWay.toLocaleString()} total operations`);
    console.log(`🎯 Efficiency improvement: ${timeSaved}% reduction in operations!`);
    
    // Show what a real sync would look like (simulation)
    console.log('\n🔄 Bulk Sync Simulation (NOT calling real API):');
    console.log('This is what would happen when you run the real sync...\n');
    
    // Simulate sync process
    const sampleMerchants = merchantsResponse.data.data.slice(0, 5); // Just show first 5
    
    for (let i = 0; i < sampleMerchants.length; i++) {
      const merchant = sampleMerchants[i];
      console.log(`📤 Syncing to merchant: ${merchant.name} (${merchant.merchant_id})`);
      
      // Simulate API calls
      for (let j = 0; j < Math.min(5, totalProducts); j++) {
        const delay = Math.random() * 100 + 50; // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`  ✓ Product ${j + 1}/${totalProducts} synced`);
      }
      
      if (totalProducts > 5) {
        console.log(`  ⏭️  ... (${totalProducts - 5} more products) ...`);
      }
      
      console.log(`  ✅ Merchant sync completed: ${totalProducts} products\n`);
    }
    
    if (activeMerchants > 5) {
      console.log(`⏭️  ... (${activeMerchants - 5} more merchants) ...\n`);
    }
    
    console.log('🎉 Bulk Sync Complete!');
    console.log(`📊 Total operations: ${totalProducts * activeMerchants}`);
    console.log(`⏱️  Estimated time: ${Math.ceil((totalProducts * activeMerchants) / 100)} minutes`);
    console.log(`💾 Products now available across all ${activeMerchants} stores!`);
    
    // Show real API endpoints for actual sync
    console.log('\n🔧 Real Sync Commands:');
    console.log('To perform actual sync with yojin.co.uk API:');
    console.log('1. Configure your API credentials in .env file');
    console.log('2. Use the web dashboard at http://localhost:8080');
    console.log('3. Or call the API directly:');
    console.log('   POST http://localhost:8080/api/sync/sync-all');
    console.log('   (This will sync all products to all active merchants)');
    
    console.log('\n📋 Next Steps:');
    console.log('• Add your yojin.co.uk API credentials to .env');
    console.log('• Use the dashboard to monitor sync progress');
    console.log('• Add more products to your master catalog');
    console.log('• Manage merchant API keys for authentication');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Show current status
async function showStatus() {
  try {
    console.log('📊 Current System Status');
    console.log('========================\n');
    
    // Test API health
    const healthResponse = await axios.get('http://localhost:8080/api/health');
    console.log(`✅ API Status: ${healthResponse.data.message}`);
    
    // Get products
    const productsResponse = await axios.get('http://localhost:8080/api/products?limit=5');
    console.log(`📦 Products: ${productsResponse.data.data.pagination.total} total`);
    console.log('Sample products:');
    productsResponse.data.data.products.slice(0, 3).forEach(p => {
      console.log(`  • ${p.name} (${p.sku}) - £${p.price}`);
    });
    
    // Get merchants
    const merchantsResponse = await axios.get('http://localhost:8080/api/merchants');
    const merchants = merchantsResponse.data.data;
    const activeMerchants = merchants.filter(m => m.is_active);
    console.log(`🏪 Merchants: ${merchants.length} total (${activeMerchants.length} active)`);
    console.log('Sample merchants:');
    activeMerchants.slice(0, 3).forEach(m => {
      console.log(`  • ${m.name} (${m.merchant_id})`);
    });
    
    console.log('\n🌐 Access Points:');
    console.log('• Dashboard: http://localhost:8080');
    console.log('• API Documentation: http://localhost:8080/api');
    console.log('• Health Check: http://localhost:8080/api/health');
    
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
  }
}

async function main() {
  const command = process.argv[2];
  
  if (command === 'status') {
    await showStatus();
  } else if (command === 'demo') {
    await demonstrateBulkSync();
  } else {
    console.log('Master Product List - Management Script');
    console.log('=======================================\n');
    console.log('Available commands:');
    console.log('  node demo.js status  - Show current system status');
    console.log('  node demo.js demo    - Run bulk sync demonstration');
    console.log('\nExamples:');
    console.log('  node demo.js status');
    console.log('  node demo.js demo');
  }
}

if (require.main === module) {
  main();
}

module.exports = { demonstrateBulkSync, showStatus };
