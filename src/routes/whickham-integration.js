const express = require('express');
const router = express.Router();
const YojinWhickhamIntegration = require('../services/YojinWhickhamIntegration');

const whickhamIntegration = new YojinWhickhamIntegration();

/**
 * GET /whickham/integration-code
 * Generate complete integration code for Whickham store
 */
router.get('/integration-code', (req, res) => {
    try {
        const jsCode = whickhamIntegration.generateWhickhamIntegrationCode();
        const cssCode = whickhamIntegration.generateWhickhamStyles();
        
        res.json({
            success: true,
            data: {
                store_id: whickhamIntegration.storeId,
                store_name: whickhamIntegration.storeName,
                javascript: jsCode,
                css: cssCode,
                implementation: {
                    html: `
<!-- Add this to your Whickham store page -->
<div id="whickham-products" class="whickham-products-grid"></div>

<script>
${jsCode}
</script>

<style>
${cssCode}
</style>

<script>
// Load products when page loads
window.addEventListener('load', function() {
    loadWhickhamProducts('whickham-products', { limit: 20 });
});
</script>
                    `
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate integration code',
            message: error.message
        });
    }
});

/**
 * GET /whickham/test
 * Test Whickham store integration
 */
router.get('/test', async (req, res) => {
    try {
        const apiTest = await whickhamIntegration.testMasterApiConnection();
        const productsTest = await whickhamIntegration.getStoreProducts({ limit: 5 });
        const categoriesTest = await whickhamIntegration.getStoreCategories();
        
        res.json({
            success: true,
            data: {
                store_id: whickhamIntegration.storeId,
                store_name: whickhamIntegration.storeName,
                tests: {
                    api_connection: apiTest,
                    products: {
                        success: productsTest.success,
                        count: productsTest.products?.length || 0,
                        error: productsTest.error
                    },
                    categories: {
                        success: categoriesTest.success,
                        count: categoriesTest.categories?.length || 0,
                        error: categoriesTest.error
                    }
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Integration test failed',
            message: error.message
        });
    }
});

/**
 * GET /whickham/products
 * Get products for Whickham store with store-specific formatting
 */
router.get('/products', async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            category: req.query.category || '',
            search: req.query.search || '',
            sort: req.query.sort || 'name',
            order: req.query.order || 'asc'
        };
        
        const result = await whickhamIntegration.getStoreProducts(options);
        
        if (result.success) {
            res.json({
                success: true,
                data: {
                    products: result.products,
                    pagination: result.pagination,
                    store: result.store
                }
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products',
            message: error.message
        });
    }
});

module.exports = router;