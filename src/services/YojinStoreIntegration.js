const axios = require('axios');
const config = require('../config');

/**
 * Yojin Store Integration Service
 * Handles communication between stores and master product API
 */
class YojinStoreIntegration {
    constructor() {
        this.baseUrl = config.API_BASE_URL || 'http://localhost:8080';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Generate store-specific integration code
     * @param {string} storeId - Store merchant ID
     * @param {string} storeName - Store display name
     * @returns {object} Integration configuration
     */
    generateStoreConfig(storeId, storeName) {
        return {
            storeId,
            storeName,
            apiUrl: this.baseUrl,
            integrationCode: this.generateIntegrationCode(storeId),
            testUrl: `${this.baseUrl}/api/v1/products?merchant_id=${storeId}&limit=5`
        };
    }

    /**
     * Generate JavaScript integration code for a store
     * @param {string} storeId - Store merchant ID
     * @returns {string} JavaScript code
     */
    generateIntegrationCode(storeId) {
        return `
// Yojin Store Integration - Auto-generated for store ${storeId}
window.YOJIN_STORE_ID = '${storeId}';
window.YOJIN_API_URL = '${this.baseUrl}';

// Load the integration library
const script = document.createElement('script');
script.src = '${this.baseUrl}/integration/yojin-integration.js';
document.head.appendChild(script);

// Initialize when ready
script.onload = function() {
    initializeYojinAPI('${storeId}');
    console.log('Yojin Product API ready for store ${storeId}');
};`;
    }

    /**
     * Test store integration
     * @param {string} storeId - Store merchant ID
     * @returns {Promise<object>} Test results
     */
    async testStoreIntegration(storeId) {
        try {
            const response = await axios.get(`${this.baseUrl}/api/v1/products`, {
                params: { merchant_id: storeId, limit: 3 }
            });

            return {
                success: true,
                storeId,
                storeName: response.data.data.merchant.name,
                productCount: response.data.data.products.length,
                totalProducts: response.data.data.pagination.total_items,
                sampleProducts: response.data.data.products.slice(0, 2)
            };
        } catch (error) {
            return {
                success: false,
                storeId,
                error: error.message
            };
        }
    }
}

module.exports = YojinStoreIntegration;