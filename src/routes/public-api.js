const express = require('express');
const router = express.Router();
const MasterProduct = require('../models/MasterProduct');
const Merchant = require('../models/Merchant');

// Public Product API for stores to consume
// This replaces the need to sync products to each store

/**
 * GET /api/v1/products
 * Returns products for a specific merchant with optional filtering
 * 
 * Query Parameters:
 * - merchant_id: Required - identifies which store is requesting
 * - category: Optional - filter by category
 * - search: Optional - search by name/description
 * - page: Optional - pagination (default: 1)
 * - limit: Optional - items per page (default: 50, max: 200)
 * - sort: Optional - sort order (name, price, created_at)
 * - order: Optional - asc/desc (default: asc)
 */
router.get('/products', async (req, res) => {
  try {
    const { 
      merchant_id, 
      category, 
      search, 
      page = 1, 
      limit = 50, 
      sort = 'name', 
      order = 'asc' 
    } = req.query;

    // Validate merchant_id is provided
    if (!merchant_id) {
      return res.status(400).json({
        error: 'merchant_id is required',
        message: 'Please provide your store ID in the merchant_id parameter'
      });
    }

    // Verify merchant exists and is active
    const merchant = await Merchant.findById(merchant_id);
    if (!merchant) {
      return res.status(404).json({
        error: 'Merchant not found',
        message: 'Invalid merchant_id provided'
      });
    }

    if (!merchant.is_active) {
      return res.status(403).json({
        error: 'Merchant inactive',
        message: 'Your store is currently inactive'
      });
    }

    // Build filters
    const filters = { is_active: 1 };
    if (category) filters.category = category;
    if (search) filters.search = search;

    // Validate and set pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Get products with pagination
    const products = await MasterProduct.findAll(filters, limitNum, offset, sort, order);
    const totalCount = await MasterProduct.count(filters);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Format response for yojin.co.uk API compatibility
    const formattedProducts = products.map(product => ({
      id: product.sku, // Use SKU as external ID
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      sku: product.sku,
      category: product.category,
      brand: product.brand,
      weight: product.weight,
      dimensions: product.dimensions,
      image_url: product.image_url,
      tags: product.tags ? product.tags.split(',') : [],
      is_active: Boolean(product.is_active),
      created_at: product.created_at,
      updated_at: product.updated_at
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total_items: totalCount,
          total_pages: totalPages,
          has_next: pageNum < totalPages,
          has_prev: pageNum > 1
        },
        merchant: {
          id: merchant.merchant_id,
          name: merchant.name
        },
        filters_applied: {
          category: category || null,
          search: search || null,
          sort: sort,
          order: order
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products for merchant:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve products'
    });
  }
});

/**
 * GET /api/v1/products/:sku
 * Get a specific product by SKU for a merchant
 */
router.get('/products/:sku', async (req, res) => {
  try {
    const { merchant_id } = req.query;
    const { sku } = req.params;

    if (!merchant_id) {
      return res.status(400).json({
        error: 'merchant_id is required',
        message: 'Please provide your store ID in the merchant_id parameter'
      });
    }

    // Verify merchant
    const merchant = await Merchant.findById(merchant_id);
    if (!merchant || !merchant.is_active) {
      return res.status(403).json({
        error: 'Invalid or inactive merchant'
      });
    }

    // Get product by SKU
    const product = await MasterProduct.findBySku(sku);
    if (!product || !product.is_active) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'Product not available or does not exist'
      });
    }

    // Format response
    const formattedProduct = {
      id: product.sku,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      sku: product.sku,
      category: product.category,
      brand: product.brand,
      weight: product.weight,
      dimensions: product.dimensions,
      image_url: product.image_url,
      tags: product.tags ? product.tags.split(',') : [],
      is_active: Boolean(product.is_active),
      created_at: product.created_at,
      updated_at: product.updated_at
    };

    res.json({
      success: true,
      data: {
        product: formattedProduct,
        merchant: {
          id: merchant.merchant_id,
          name: merchant.name
        }
      }
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve product'
    });
  }
});

/**
 * GET /api/v1/categories
 * Get all available categories for a merchant
 */
router.get('/categories', async (req, res) => {
  try {
    const { merchant_id } = req.query;

    if (!merchant_id) {
      return res.status(400).json({
        error: 'merchant_id is required'
      });
    }

    // Verify merchant
    const merchant = await Merchant.findById(merchant_id);
    if (!merchant || !merchant.is_active) {
      return res.status(403).json({
        error: 'Invalid or inactive merchant'
      });
    }

    // Get unique categories from active products
    const categories = await MasterProduct.getCategories();

    res.json({
      success: true,
      data: {
        categories: categories,
        merchant: {
          id: merchant.merchant_id,
          name: merchant.name
        }
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve categories'
    });
  }
});

/**
 * GET /api/v1/health
 * Health check endpoint for stores to verify API availability
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Master Product API is operational'
  });
});

module.exports = router;
