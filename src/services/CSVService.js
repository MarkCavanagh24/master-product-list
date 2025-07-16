const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

class CSVService {
  static async importProductsFromCSV(filePath) {
    const products = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Map CSV columns to product fields
          const product = {
            sku: row.SKU || row.sku,
            name: row.Name || row.name,
            description: row.Description || row.description,
            price: parseFloat(row.Price || row.price),
            cost_price: parseFloat(row['Cost Price'] || row.cost_price),
            category: row.Category || row.category,
            brand: row.Brand || row.brand,
            weight: parseFloat(row.Weight || row.weight),
            dimensions: row.Dimensions || row.dimensions,
            image_url: row['Image URL'] || row.image_url,
            tags: row.Tags || row.tags,
            is_active: row['Is Active'] || row.is_active || 1
          };

          // Validate required fields
          if (product.sku && product.name && product.price) {
            products.push(product);
          }
        })
        .on('end', () => {
          resolve(products);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  static async exportProductsToCSV(products, outputPath) {
    const csvWriter = createCsvWriter({
      path: outputPath,
      header: [
        { id: 'sku', title: 'SKU' },
        { id: 'name', title: 'Name' },
        { id: 'description', title: 'Description' },
        { id: 'price', title: 'Price' },
        { id: 'cost_price', title: 'Cost Price' },
        { id: 'category', title: 'Category' },
        { id: 'brand', title: 'Brand' },
        { id: 'weight', title: 'Weight' },
        { id: 'dimensions', title: 'Dimensions' },
        { id: 'image_url', title: 'Image URL' },
        { id: 'tags', title: 'Tags' },
        { id: 'is_active', title: 'Is Active' },
        { id: 'created_at', title: 'Created At' },
        { id: 'updated_at', title: 'Updated At' }
      ]
    });

    await csvWriter.writeRecords(products);
    return outputPath;
  }

  static async importMerchantsFromCSV(filePath) {
    const merchants = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const merchant = {
            merchant_id: row['Merchant ID'] || row.merchant_id,
            name: row.Name || row.name,
            api_key: row['API Key'] || row.api_key,
            is_active: row['Is Active'] || row.is_active || 1
          };

          // Validate required fields
          if (merchant.merchant_id && merchant.name) {
            merchants.push(merchant);
          }
        })
        .on('end', () => {
          resolve(merchants);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  static async exportMerchantsToCSV(merchants, outputPath) {
    const csvWriter = createCsvWriter({
      path: outputPath,
      header: [
        { id: 'merchant_id', title: 'Merchant ID' },
        { id: 'name', title: 'Name' },
        { id: 'api_key', title: 'API Key' },
        { id: 'is_active', title: 'Is Active' },
        { id: 'last_sync', title: 'Last Sync' },
        { id: 'created_at', title: 'Created At' },
        { id: 'updated_at', title: 'Updated At' }
      ]
    });

    await csvWriter.writeRecords(merchants);
    return outputPath;
  }

  static async exportSyncReportToCSV(syncResults, outputPath) {
    const csvWriter = createCsvWriter({
      path: outputPath,
      header: [
        { id: 'product_id', title: 'Product ID' },
        { id: 'merchant_id', title: 'Merchant ID' },
        { id: 'yojin_product_id', title: 'Yojin Product ID' },
        { id: 'status', title: 'Status' },
        { id: 'action', title: 'Action' },
        { id: 'error', title: 'Error' },
        { id: 'last_sync', title: 'Last Sync' }
      ]
    });

    const reportData = syncResults.map(result => ({
      product_id: result.productId,
      merchant_id: result.merchantId,
      yojin_product_id: result.yojinProductId || '',
      status: result.success ? 'Success' : 'Failed',
      action: result.action || '',
      error: result.error || '',
      last_sync: new Date().toISOString()
    }));

    await csvWriter.writeRecords(reportData);
    return outputPath;
  }

  static generateSampleProductsCSV(outputPath) {
    const sampleProducts = [
      {
        sku: 'PROD001',
        name: 'Sample Product 1',
        description: 'This is a sample product description',
        price: 29.99,
        cost_price: 15.00,
        category: 'Electronics',
        brand: 'SampleBrand',
        weight: 0.5,
        dimensions: '10x5x2',
        image_url: 'https://example.com/product1.jpg',
        tags: 'sample,electronics',
        is_active: 1
      },
      {
        sku: 'PROD002',
        name: 'Sample Product 2',
        description: 'Another sample product',
        price: 49.99,
        cost_price: 25.00,
        category: 'Clothing',
        brand: 'FashionBrand',
        weight: 0.3,
        dimensions: '15x20x1',
        image_url: 'https://example.com/product2.jpg',
        tags: 'sample,clothing',
        is_active: 1
      }
    ];

    return this.exportProductsToCSV(sampleProducts, outputPath);
  }

  static generateSampleMerchantsCSV(outputPath) {
    const sampleMerchants = [
      {
        merchant_id: 'MERCHANT001',
        name: 'Sample Store 1',
        api_key: 'sample_api_key_1',
        is_active: 1
      },
      {
        merchant_id: 'MERCHANT002',
        name: 'Sample Store 2',
        api_key: 'sample_api_key_2',
        is_active: 1
      }
    ];

    return this.exportMerchantsToCSV(sampleMerchants, outputPath);
  }
}

module.exports = CSVService;
