const express = require('express');
const router = express.Router();
const ProductSyncService = require('../services/ProductSyncService');
const YojinAPIService = require('../services/YojinAPIService');
const CSVService = require('../services/CSVService');
const path = require('path');

// Test API connection
router.get('/test-connection', async (req, res) => {
  try {
    const result = await YojinAPIService.testConnection();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get API limits
router.get('/limits', async (req, res) => {
  try {
    const result = await YojinAPIService.getApiLimits();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync all products to all merchants
router.post('/sync-all', async (req, res) => {
  try {
    const result = await ProductSyncService.syncAllProductsToAllMerchants();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync all products to specific merchant
router.post('/sync-merchant/:merchantId', async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    const result = await ProductSyncService.syncAllProductsToMerchant(merchantId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sync job status
router.get('/sync-jobs/:id', async (req, res) => {
  try {
    const job = await ProductSyncService.getSyncJob(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Sync job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all sync jobs
router.get('/sync-jobs', async (req, res) => {
  try {
    const { status, merchant_id, limit } = req.query;
    const filters = {
      status,
      merchant_id,
      limit: limit ? parseInt(limit) : undefined
    };

    const jobs = await ProductSyncService.getSyncJobs(filters);
    
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate sync report
router.get('/sync-report', async (req, res) => {
  try {
    const { merchant_id, product_id, format = 'json' } = req.query;
    
    // Get sync status data
    const sql = `
      SELECT 
        pss.*,
        mp.name as product_name,
        mp.sku as product_sku,
        m.name as merchant_name
      FROM product_sync_status pss
      JOIN master_products mp ON pss.master_product_id = mp.id
      JOIN merchants m ON pss.merchant_id = m.merchant_id
      WHERE 1=1
      ${merchant_id ? 'AND pss.merchant_id = ?' : ''}
      ${product_id ? 'AND pss.master_product_id = ?' : ''}
      ORDER BY pss.updated_at DESC
    `;

    const params = [];
    if (merchant_id) params.push(merchant_id);
    if (product_id) params.push(product_id);

    const database = require('../models/database');
    const syncData = await database.all(sql, params);

    if (format === 'csv') {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `sync-report-${timestamp}.csv`;
      const outputPath = path.join('data', 'exports', filename);

      await CSVService.exportSyncReportToCSV(syncData, outputPath);
      res.download(outputPath, filename);
    } else {
      res.json({
        success: true,
        data: syncData
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
