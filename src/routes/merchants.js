const express = require('express');
const router = express.Router();
const Merchant = require('../models/Merchant');
const ProductSyncService = require('../services/ProductSyncService');
const CSVService = require('../services/CSVService');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  }
});

// Get all merchants
router.get('/', async (req, res) => {
  try {
    const { is_active } = req.query;
    const filters = {
      is_active: is_active !== undefined ? parseInt(is_active) : undefined
    };

    const merchants = await Merchant.findAll(filters);
    
    res.json({
      success: true,
      data: merchants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single merchant by ID
router.get('/:id', async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.json({
      success: true,
      data: merchant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new merchant
router.post('/', async (req, res) => {
  try {
    const result = await Merchant.create(req.body);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        message: 'Merchant created successfully'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update merchant
router.put('/:id', async (req, res) => {
  try {
    const result = await Merchant.update(req.params.id, req.body);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Merchant updated successfully'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete merchant
router.delete('/:id', async (req, res) => {
  try {
    const result = await Merchant.delete(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Merchant deleted successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk create merchants
router.post('/bulk', async (req, res) => {
  try {
    const { merchants } = req.body;
    
    if (!Array.isArray(merchants)) {
      return res.status(400).json({
        success: false,
        error: 'Merchants must be an array'
      });
    }

    const results = await Merchant.bulkCreate(merchants);
    
    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Import merchants from CSV
router.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const merchants = await CSVService.importMerchantsFromCSV(req.file.path);
    const results = await Merchant.bulkCreate(merchants);

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export merchants to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const merchants = await Merchant.findAll();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `merchants-export-${timestamp}.csv`;
    const outputPath = path.join('data', 'exports', filename);

    await CSVService.exportMerchantsToCSV(merchants, outputPath);

    res.download(outputPath, filename);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync all products to merchant
router.post('/:id/sync-all', async (req, res) => {
  try {
    const merchantId = req.params.id;
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

module.exports = router;
