const express = require('express');
const router = express.Router();
const MasterProduct = require('../models/MasterProduct');
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

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      brand,
      is_active
    } = req.query;

    const offset = (page - 1) * limit;
    const filters = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      search,
      category,
      brand,
      is_active: is_active !== undefined ? parseInt(is_active) : undefined
    };

    const products = await MasterProduct.findAll(filters);
    const total = await MasterProduct.count(filters);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
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

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await MasterProduct.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const result = await MasterProduct.create(req.body);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        message: 'Product created successfully'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const result = await MasterProduct.update(req.params.id, req.body);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Product updated successfully'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const result = await MasterProduct.delete(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Product deleted successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk create products
router.post('/bulk', async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Products must be an array'
      });
    }

    const results = await MasterProduct.bulkCreate(products);
    
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

// Import products from CSV
router.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const products = await CSVService.importProductsFromCSV(req.file.path);
    const results = await MasterProduct.bulkCreate(products);

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

// Export products to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const products = await MasterProduct.findAll();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `products-export-${timestamp}.csv`;
    const outputPath = path.join('data', 'exports', filename);

    await CSVService.exportProductsToCSV(products, outputPath);

    res.download(outputPath, filename);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync single product to merchant
router.post('/:id/sync/:merchantId', async (req, res) => {
  try {
    const { id: productId, merchantId } = req.params;
    const result = await ProductSyncService.syncProductToMerchant(productId, merchantId);
    
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

// Sync single product to all merchants
router.post('/:id/sync-all', async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await ProductSyncService.syncProductToAllMerchants(productId);
    
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
