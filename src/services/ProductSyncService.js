const MasterProduct = require('../models/MasterProduct');
const Merchant = require('../models/Merchant');
const YojinAPIService = require('./YojinAPIService');
const database = require('../models/database');
const config = require('../config');

class ProductSyncService {
  constructor() {
    this.batchSize = config.batch.size;
    this.maxConcurrentRequests = config.batch.maxConcurrentRequests;
    this.requestDelay = config.batch.requestDelayMs;
  }

  async syncProductToMerchant(productId, merchantId) {
    try {
      // Get master product
      const masterProduct = await MasterProduct.findById(productId);
      if (!masterProduct) {
        throw new Error(`Master product with ID ${productId} not found`);
      }

      // Get merchant
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        throw new Error(`Merchant with ID ${merchantId} not found`);
      }

      // Check if product already exists in merchant's store
      const existingSync = await this.getSyncStatus(productId, merchantId);
      
      let result;
      if (existingSync && existingSync.yojin_product_id) {
        // Update existing product
        result = await YojinAPIService.updateProduct(
          merchantId,
          existingSync.yojin_product_id,
          masterProduct
        );
      } else {
        // Create new product
        result = await YojinAPIService.createProduct(merchantId, masterProduct);
      }

      // Update sync status
      await this.updateSyncStatus(productId, merchantId, result.id, 'synced');

      return {
        success: true,
        productId,
        merchantId,
        yojinProductId: result.id,
        action: existingSync ? 'updated' : 'created'
      };

    } catch (error) {
      // Update sync status with error
      await this.updateSyncStatus(productId, merchantId, null, 'error', error.message);
      
      return {
        success: false,
        productId,
        merchantId,
        error: error.message
      };
    }
  }

  async syncAllProductsToMerchant(merchantId) {
    const jobId = await this.createSyncJob('sync_all_products', merchantId);
    
    try {
      // Get all active master products
      const products = await MasterProduct.findAll({ is_active: 1 });
      await this.updateSyncJobProgress(jobId, 0, products.length);

      const results = [];
      let completed = 0;

      // Process in batches
      for (let i = 0; i < products.length; i += this.batchSize) {
        const batch = products.slice(i, i + this.batchSize);
        
        // Process batch with limited concurrency
        const batchPromises = batch.map(async (product) => {
          await this.delay(this.requestDelay);
          return this.syncProductToMerchant(product.id, merchantId);
        });

        const batchResults = await this.processWithConcurrency(batchPromises, this.maxConcurrentRequests);
        results.push(...batchResults);

        completed += batch.length;
        await this.updateSyncJobProgress(jobId, completed, products.length);
      }

      // Update merchant last sync
      await Merchant.updateLastSync(merchantId);

      // Mark job as completed
      await this.updateSyncJobStatus(jobId, 'completed');

      return {
        success: true,
        jobId,
        totalProducts: products.length,
        results,
        summary: this.getSyncSummary(results)
      };

    } catch (error) {
      await this.updateSyncJobStatus(jobId, 'failed', error.message);
      throw error;
    }
  }

  async syncProductToAllMerchants(productId) {
    const jobId = await this.createSyncJob('sync_product_to_all', null);
    
    try {
      // Get all active merchants
      const merchants = await Merchant.findAll({ is_active: 1 });
      await this.updateSyncJobProgress(jobId, 0, merchants.length);

      const results = [];
      let completed = 0;

      // Process in batches
      for (let i = 0; i < merchants.length; i += this.batchSize) {
        const batch = merchants.slice(i, i + this.batchSize);
        
        // Process batch with limited concurrency
        const batchPromises = batch.map(async (merchant) => {
          await this.delay(this.requestDelay);
          return this.syncProductToMerchant(productId, merchant.merchant_id);
        });

        const batchResults = await this.processWithConcurrency(batchPromises, this.maxConcurrentRequests);
        results.push(...batchResults);

        completed += batch.length;
        await this.updateSyncJobProgress(jobId, completed, merchants.length);
      }

      // Mark job as completed
      await this.updateSyncJobStatus(jobId, 'completed');

      return {
        success: true,
        jobId,
        totalMerchants: merchants.length,
        results,
        summary: this.getSyncSummary(results)
      };

    } catch (error) {
      await this.updateSyncJobStatus(jobId, 'failed', error.message);
      throw error;
    }
  }

  async syncAllProductsToAllMerchants() {
    const jobId = await this.createSyncJob('sync_all_to_all', null);
    
    try {
      const products = await MasterProduct.findAll({ is_active: 1 });
      const merchants = await Merchant.findAll({ is_active: 1 });
      const totalOperations = products.length * merchants.length;

      await this.updateSyncJobProgress(jobId, 0, totalOperations);

      const results = [];
      let completed = 0;

      // Process each product across all merchants
      for (const product of products) {
        const merchantPromises = merchants.map(async (merchant) => {
          await this.delay(this.requestDelay);
          return this.syncProductToMerchant(product.id, merchant.merchant_id);
        });

        const merchantResults = await this.processWithConcurrency(merchantPromises, this.maxConcurrentRequests);
        results.push(...merchantResults);

        completed += merchants.length;
        await this.updateSyncJobProgress(jobId, completed, totalOperations);
      }

      // Update all merchants last sync
      for (const merchant of merchants) {
        await Merchant.updateLastSync(merchant.merchant_id);
      }

      // Mark job as completed
      await this.updateSyncJobStatus(jobId, 'completed');

      return {
        success: true,
        jobId,
        totalOperations,
        results,
        summary: this.getSyncSummary(results)
      };

    } catch (error) {
      await this.updateSyncJobStatus(jobId, 'failed', error.message);
      throw error;
    }
  }

  async deleteProductFromMerchant(productId, merchantId) {
    try {
      const syncStatus = await this.getSyncStatus(productId, merchantId);
      
      if (syncStatus && syncStatus.yojin_product_id) {
        await YojinAPIService.deleteProduct(merchantId, syncStatus.yojin_product_id);
        await this.deleteSyncStatus(productId, merchantId);
      }

      return { success: true, productId, merchantId };
    } catch (error) {
      return { success: false, productId, merchantId, error: error.message };
    }
  }

  async deleteProductFromAllMerchants(productId) {
    const merchants = await Merchant.findAll({ is_active: 1 });
    const results = [];

    for (const merchant of merchants) {
      const result = await this.deleteProductFromMerchant(productId, merchant.merchant_id);
      results.push(result);
      await this.delay(this.requestDelay);
    }

    return {
      success: true,
      productId,
      results,
      summary: this.getSyncSummary(results)
    };
  }

  // Helper methods
  async processWithConcurrency(promises, maxConcurrency) {
    const results = [];
    
    for (let i = 0; i < promises.length; i += maxConcurrency) {
      const batch = promises.slice(i, i + maxConcurrency);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }

    return results;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSyncSummary(results) {
    const summary = {
      total: results.length,
      successful: 0,
      failed: 0,
      created: 0,
      updated: 0,
      errors: []
    };

    results.forEach(result => {
      if (result.success) {
        summary.successful++;
        if (result.action === 'created') summary.created++;
        if (result.action === 'updated') summary.updated++;
      } else {
        summary.failed++;
        summary.errors.push({
          productId: result.productId,
          merchantId: result.merchantId,
          error: result.error
        });
      }
    });

    return summary;
  }

  // Database helper methods
  async getSyncStatus(productId, merchantId) {
    const sql = `
      SELECT * FROM product_sync_status
      WHERE master_product_id = ? AND merchant_id = ?
    `;
    return await database.get(sql, [productId, merchantId]);
  }

  async updateSyncStatus(productId, merchantId, yojinProductId, status, errorMessage = null) {
    const sql = `
      INSERT OR REPLACE INTO product_sync_status
      (master_product_id, merchant_id, yojin_product_id, sync_status, last_sync, error_message, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)
    `;
    
    return await database.run(sql, [productId, merchantId, yojinProductId, status, errorMessage]);
  }

  async deleteSyncStatus(productId, merchantId) {
    const sql = `
      DELETE FROM product_sync_status
      WHERE master_product_id = ? AND merchant_id = ?
    `;
    return await database.run(sql, [productId, merchantId]);
  }

  async createSyncJob(jobType, merchantId) {
    const sql = `
      INSERT INTO sync_jobs (job_type, merchant_id, status)
      VALUES (?, ?, 'running')
    `;
    
    const result = await database.run(sql, [jobType, merchantId]);
    return result.id;
  }

  async updateSyncJobProgress(jobId, progress, totalItems) {
    const sql = `
      UPDATE sync_jobs SET
        progress = ?, total_items = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    return await database.run(sql, [progress, totalItems, jobId]);
  }

  async updateSyncJobStatus(jobId, status, errorMessage = null) {
    const sql = `
      UPDATE sync_jobs SET
        status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    return await database.run(sql, [status, errorMessage, jobId]);
  }

  async getSyncJob(jobId) {
    const sql = 'SELECT * FROM sync_jobs WHERE id = ?';
    return await database.get(sql, [jobId]);
  }

  async getSyncJobs(filters = {}) {
    let sql = 'SELECT * FROM sync_jobs WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.merchant_id) {
      sql += ' AND merchant_id = ?';
      params.push(filters.merchant_id);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    return await database.all(sql, params);
  }
}

module.exports = new ProductSyncService();
