const express = require('express');
const router = express.Router();
const YojinStoreIntegration = require('../services/YojinStoreIntegration');
const Merchant = require('../models/Merchant');

const integrationService = new YojinStoreIntegration();

/**
 * GET /integration/store/:storeId
 * Generate integration code for a specific store
 */
router.get('/store/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        
        // Verify store exists
        const merchant = await Merchant.findById(storeId);
        if (!merchant) {
            return res.status(404).json({
                error: 'Store not found',
                message: 'Invalid store ID provided'
            });
        }

        const config = integrationService.generateStoreConfig(storeId, merchant.name);
        
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(500).json({
            error: 'Integration generation failed',
            message: error.message
        });
    }
});

/**
 * GET /integration/test/:storeId
 * Test store integration
 */
router.get('/test/:storeId', async (req, res) => {
    try {
        const { storeId } = req.params;
        const testResults = await integrationService.testStoreIntegration(storeId);
        
        res.json({
            success: testResults.success,
            data: testResults
        });
    } catch (error) {
        res.status(500).json({
            error: 'Integration test failed',
            message: error.message
        });
    }
});

/**
 * GET /integration/yojin-integration.js
 * Serve the integration JavaScript library
 */
router.get('/yojin-integration.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(require('path').join(__dirname, '../../yojin-integration.js'));
});

module.exports = router;