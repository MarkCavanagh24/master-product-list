const fs = require('fs');
const csv = require('csv-parser');
const Merchant = require('./src/models/Merchant');
const database = require('./src/models/database');

// Function to import merchants from your yojin CSV format
async function importYojinMerchants(csvFilePath) {
  console.log(`Starting import from: ${csvFilePath}`);
  
  const merchants = [];
  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  };

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Map your CSV columns to our merchant structure
          const merchant = {
            merchant_id: row['MERCHANT.ID'],
            name: row['MERCHANT.NAME'],
            phone: row['MERCHANT.PHONE'],
            email: row['MERCHANT.EMAIL'],
            address: row['MERCHANT.ADDRESS'],
            postcode: row['MERCHANT.POST.CODE'],
            city: row['MERCHANT.CITY'],
            state: row['MERCHANT.STATE'],
            country: row['MERCHANT.COUNTRY'],
            country_code: row['MERCHANT.COUNTRY.CODE'],
            status: row['MERCHANT.STATUS'],
            logo: row['MERCHANT.LOGO'],
            cover: row['MERCHANT.COVER'],
            commission: row['MERCHANT.COMMISSION'],
            tax_method: row['MERCHANT.TAX.METHOD'],
            is_active: row['MERCHANT.STATUS'] === 'ACTIVE' ? 1 : 0
          };

          // Only process merchants with required fields
          if (merchant.merchant_id && merchant.name) {
            merchants.push(merchant);
            results.total++;
          }
        } catch (error) {
          console.error('Error processing row:', error.message);
          results.errors.push(`Row processing error: ${error.message}`);
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${merchants.length} merchants from CSV`);
        
        try {
          // Initialize database if not already done
          await database.init();
          
          // Import merchants in batches
          const batchSize = 50;
          for (let i = 0; i < merchants.length; i += batchSize) {
            const batch = merchants.slice(i, i + batchSize);
            
            for (const merchant of batch) {
              try {
                // Create simplified merchant record for our system
                const merchantData = {
                  merchant_id: merchant.merchant_id,
                  name: merchant.name,
                  api_key: '', // You'll need to add API keys separately
                  is_active: merchant.is_active
                };
                
                await Merchant.create(merchantData);
                results.successful++;
                
                // Also store additional data in a separate extended table
                await storeExtendedMerchantData(merchant);
                
              } catch (error) {
                results.failed++;
                results.errors.push(`${merchant.merchant_id}: ${error.message}`);
                console.error(`Failed to import ${merchant.merchant_id}:`, error.message);
              }
            }
            
            console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(merchants.length/batchSize)}`);
          }
          
          console.log('\n=== Import Summary ===');
          console.log(`Total records: ${results.total}`);
          console.log(`Successful: ${results.successful}`);
          console.log(`Failed: ${results.failed}`);
          console.log(`Success rate: ${((results.successful/results.total)*100).toFixed(1)}%`);
          
          if (results.errors.length > 0) {
            console.log('\nErrors:');
            results.errors.slice(0, 10).forEach(error => console.log(`- ${error}`));
            if (results.errors.length > 10) {
              console.log(`... and ${results.errors.length - 10} more errors`);
            }
          }
          
          resolve(results);
          
        } catch (error) {
          console.error('Database operation failed:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      });
  });
}

// Store extended merchant data in a separate table
async function storeExtendedMerchantData(merchant) {
  // Create extended merchant data table if it doesn't exist
  const createExtendedTableSQL = `
    CREATE TABLE IF NOT EXISTS merchant_extended (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      merchant_id TEXT UNIQUE NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      postcode TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      country_code TEXT,
      status TEXT,
      logo TEXT,
      cover TEXT,
      commission TEXT,
      tax_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
    );
  `;
  
  await database.run(createExtendedTableSQL);
  
  // Insert extended data
  const insertSQL = `
    INSERT OR REPLACE INTO merchant_extended 
    (merchant_id, phone, email, address, postcode, city, state, country, country_code, status, logo, cover, commission, tax_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await database.run(insertSQL, [
    merchant.merchant_id,
    merchant.phone,
    merchant.email,
    merchant.address,
    merchant.postcode,
    merchant.city,
    merchant.state,
    merchant.country,
    merchant.country_code,
    merchant.status,
    merchant.logo,
    merchant.cover,
    merchant.commission,
    merchant.tax_method
  ]);
}

// Function to get merchant statistics
async function getMerchantStats() {
  const stats = {};
  
  // Total merchants
  const totalResult = await database.get('SELECT COUNT(*) as count FROM merchants');
  stats.total = totalResult.count;
  
  // Active merchants
  const activeResult = await database.get('SELECT COUNT(*) as count FROM merchants WHERE is_active = 1');
  stats.active = activeResult.count;
  
  // Merchants by country
  const countryResult = await database.all(`
    SELECT me.country, COUNT(*) as count 
    FROM merchants m 
    JOIN merchant_extended me ON m.merchant_id = me.merchant_id 
    GROUP BY me.country 
    ORDER BY count DESC
  `);
  stats.byCountry = countryResult;
  
  // Merchants by status
  const statusResult = await database.all(`
    SELECT me.status, COUNT(*) as count 
    FROM merchants m 
    JOIN merchant_extended me ON m.merchant_id = me.merchant_id 
    GROUP BY me.status
  `);
  stats.byStatus = statusResult;
  
  return stats;
}

// Main execution
async function main() {
  const csvFile = process.argv[2];
  
  if (!csvFile) {
    console.log('Usage: node import-merchants.js <csv-file-path>');
    console.log('Example: node import-merchants.js merchants-1.csv');
    process.exit(1);
  }
  
  if (!fs.existsSync(csvFile)) {
    console.error(`File not found: ${csvFile}`);
    process.exit(1);
  }
  
  try {
    console.log('🚀 Starting Yojin Merchant Import...\n');
    
    const results = await importYojinMerchants(csvFile);
    
    console.log('\n📊 Generating statistics...');
    const stats = await getMerchantStats();
    
    console.log('\n=== Final Statistics ===');
    console.log(`Total merchants in system: ${stats.total}`);
    console.log(`Active merchants: ${stats.active}`);
    console.log(`Inactive merchants: ${stats.total - stats.active}`);
    
    console.log('\nMerchants by country:');
    stats.byCountry.forEach(item => {
      console.log(`  ${item.country || 'Unknown'}: ${item.count}`);
    });
    
    console.log('\nMerchants by status:');
    stats.byStatus.forEach(item => {
      console.log(`  ${item.status}: ${item.count}`);
    });
    
    console.log('\n✅ Import completed successfully!');
    console.log('You can now use the web dashboard to manage your merchants and sync products.');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await database.close();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  importYojinMerchants,
  getMerchantStats,
  storeExtendedMerchantData
};
