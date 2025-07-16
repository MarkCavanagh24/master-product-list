const axios = require('axios');
const config = require('../config');

/**
 * Yojin Whickham Store Integration Service
 * Handles product integration for https://www.yojin.co.uk/en/m/yojin-whickham
 */
class YojinWhickhamIntegration {
    constructor() {
        this.storeId = '6855418221bb01b10405e42a';
        this.storeName = 'Yojin Whickham';
        this.storeUrl = 'https://www.yojin.co.uk/en/m/yojin-whickham';
        this.apiUrl = process.env.NODE_ENV === 'production' 
            ? config.PRODUCTION_API_URL 
            : 'http://localhost:8080';
        this.publicApiUrl = process.env.NODE_ENV === 'production'
            ? config.PRODUCTION_API_URL
            : 'https://yummy-seals-battle.loca.lt'; // Your current tunnel
    }

    /**
     * Test connection to master product API
     */
    async testMasterApiConnection() {
        try {
            const response = await axios.get(`${this.apiUrl}/api/v1/health`);
            return {
                success: true,
                status: response.data.status,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get products for Whickham store from master API
     */
    async getStoreProducts(options = {}) {
        const {
            page = 1,
            limit = 50,
            category = '',
            search = '',
            sort = 'name',
            order = 'asc'
        } = options;

        try {
            const params = new URLSearchParams({
                merchant_id: this.storeId,
                page: page.toString(),
                limit: limit.toString(),
                sort,
                order
            });

            if (category) params.append('category', category);
            if (search) params.append('search', search);

            const response = await axios.get(`${this.apiUrl}/api/v1/products?${params}`);
            
            if (response.data.success) {
                return {
                    success: true,
                    products: response.data.data.products,
                    pagination: response.data.data.pagination,
                    store: response.data.data.merchant
                };
            } else {
                throw new Error(response.data.error || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching store products:', error.message);
            return {
                success: false,
                error: error.message,
                products: [],
                pagination: null
            };
        }
    }

    /**
     * Get store categories
     */
    async getStoreCategories() {
        try {
            const response = await axios.get(`${this.apiUrl}/api/v1/categories?merchant_id=${this.storeId}`);
            
            if (response.data.success) {
                return {
                    success: true,
                    categories: response.data.data.categories
                };
            } else {
                throw new Error(response.data.error || 'Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error.message);
            return {
                success: false,
                error: error.message,
                categories: []
            };
        }
    }

    /**
     * Generate production-ready integration code for Whickham store
     */
    generateWhickhamIntegrationCode() {
        return `
/**
 * Yojin Whickham Store - Live Product Integration
 * For: https://www.yojin.co.uk/en/m/yojin-whickham
 * Store ID: ${this.storeId}
 */

(function() {
    'use strict';
    
    // Configuration for live store
    const WHICKHAM_CONFIG = {
        STORE_ID: '${this.storeId}',
        STORE_NAME: '${this.storeName}',
        API_URL: '${this.publicApiUrl}',
        CACHE_DURATION: 10 * 60 * 1000, // 10 minutes for production
        ITEMS_PER_PAGE: 24,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 2000
    };
    
    // Enhanced cache system for production
    class WhickhamProductCache {
        constructor() {
            this.cache = new Map();
            this.maxSize = 100;
        }
        
        get(key) {
            const item = this.cache.get(key);
            if (item && (Date.now() - item.timestamp) < WHICKHAM_CONFIG.CACHE_DURATION) {
                return item.data;
            }
            this.cache.delete(key);
            return null;
        }
        
        set(key, data) {
            if (this.cache.size >= this.maxSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            
            this.cache.set(key, {
                data,
                timestamp: Date.now()
            });
        }
        
        clear() {
            this.cache.clear();
        }
    }
    
    const cache = new WhickhamProductCache();
    
    // Enhanced API client with error handling
    class WhickhamAPIClient {
        constructor() {
            this.baseUrl = WHICKHAM_CONFIG.API_URL;
            this.storeId = WHICKHAM_CONFIG.STORE_ID;
        }
        
        async makeRequest(endpoint, params = {}, retryCount = 0) {
            const cacheKey = this.getCacheKey(endpoint, params);
            const cachedData = cache.get(cacheKey);
            
            if (cachedData) {
                console.log('[Whickham] Using cached data for:', endpoint);
                return cachedData;
            }
            
            try {
                const url = new URL(\`\${this.baseUrl}/api/v1/\${endpoint}\`);
                
                // Add store ID to all requests
                params.merchant_id = this.storeId;
                
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                        url.searchParams.append(key, params[key]);
                    }
                });
                
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Store-ID': this.storeId,
                        'X-Store-Name': 'Yojin Whickham'
                    },
                    mode: 'cors'
                });
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    cache.set(cacheKey, data);
                    console.log('[Whickham] API success:', endpoint);
                    return data;
                } else {
                    throw new Error(data.error || 'API request failed');
                }
                
            } catch (error) {
                console.error('[Whickham] API Error:', error.message);
                
                if (retryCount < WHICKHAM_CONFIG.RETRY_ATTEMPTS) {
                    console.log(\`[Whickham] Retrying \${endpoint} (attempt \${retryCount + 1})\`);
                    await this.delay(WHICKHAM_CONFIG.RETRY_DELAY);
                    return this.makeRequest(endpoint, params, retryCount + 1);
                }
                
                throw error;
            }
        }
        
        getCacheKey(endpoint, params) {
            const sortedParams = Object.keys(params)
                .sort()
                .map(key => \`\${key}=\${params[key]}\`)
                .join('&');
            return \`\${endpoint}?\${sortedParams}\`;
        }
        
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        async getProducts(options = {}) {
            const params = {
                page: options.page || 1,
                limit: options.limit || WHICKHAM_CONFIG.ITEMS_PER_PAGE,
                sort: options.sort || 'name',
                order: options.order || 'asc'
            };
            
            if (options.category) params.category = options.category;
            if (options.search) params.search = options.search;
            
            return await this.makeRequest('products', params);
        }
        
        async getCategories() {
            return await this.makeRequest('categories');
        }
        
        async getProduct(sku) {
            return await this.makeRequest(\`products/\${sku}\`);
        }
    }
    
    // Product display manager
    class WhickhamProductDisplay {
        constructor(apiClient) {
            this.api = apiClient;
            this.currentPage = 1;
            this.currentFilters = {};
            this.isLoading = false;
        }
        
        async loadProducts(containerId, options = {}) {
            if (this.isLoading) return;
            
            this.isLoading = true;
            const container = document.getElementById(containerId);
            
            if (!container) {
                console.error('[Whickham] Container not found:', containerId);
                this.isLoading = false;
                return;
            }
            
            try {
                // Show loading state
                this.showLoading(container);
                
                const data = await this.api.getProducts(options);
                
                if (data.success && data.data.products) {
                    this.renderProducts(container, data.data.products);
                    this.updatePagination(data.data.pagination);
                    
                    // Update store info if available
                    if (data.data.merchant) {
                        this.updateStoreInfo(data.data.merchant);
                    }
                    
                    console.log(\`[Whickham] Loaded \${data.data.products.length} products\`);
                } else {
                    throw new Error('No products received');
                }
                
            } catch (error) {
                console.error('[Whickham] Failed to load products:', error.message);
                this.showError(container, 'Failed to load products. Please try again.');
            } finally {
                this.isLoading = false;
            }
        }
        
        renderProducts(container, products) {
            container.innerHTML = '';
            
            if (!products || products.length === 0) {
                container.innerHTML = '<div class="no-products">No products found</div>';
                return;
            }
            
            const productGrid = document.createElement('div');
            productGrid.className = 'whickham-products-grid';
            
            products.forEach(product => {
                const productElement = this.createProductCard(product);
                productGrid.appendChild(productElement);
            });
            
            container.appendChild(productGrid);
        }
        
        createProductCard(product) {
            const card = document.createElement('div');
            card.className = 'whickham-product-card';
            card.setAttribute('data-sku', product.sku);
            
            card.innerHTML = \`
                <div class="product-image">
                    <img src="\${product.image_url || '/images/placeholder.png'}" 
                         alt="\${product.name}" 
                         loading="lazy"
                         onerror="this.src='/images/placeholder.png'">
                </div>
                <div class="product-content">
                    <h3 class="product-name">\${product.name}</h3>
                    <p class="product-description">\${product.description}</p>
                    <div class="product-meta">
                        <span class="product-price">£\${parseFloat(product.price).toFixed(2)}</span>
                        <span class="product-category">\${product.category}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-to-cart" onclick="addToWhickhamCart('\${product.sku}', '\${product.name}', \${product.price})" 
                                \${product.is_active ? '' : 'disabled'}>
                            \${product.is_active ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            \`;
            
            return card;
        }
        
        showLoading(container) {
            container.innerHTML = \`
                <div class="whickham-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading products...</p>
                </div>
            \`;
        }
        
        showError(container, message) {
            container.innerHTML = \`
                <div class="whickham-error">
                    <p>\${message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            \`;
        }
        
        updateStoreInfo(merchant) {
            document.title = \`\${merchant.name} - Products\`;
            
            const storeInfoElements = document.querySelectorAll('.store-name');
            storeInfoElements.forEach(el => {
                el.textContent = merchant.name;
            });
        }
        
        updatePagination(pagination) {
            // Implement pagination UI updates here
            console.log('[Whickham] Pagination:', pagination);
        }
    }
    
    // Initialize API and display manager
    const apiClient = new WhickhamAPIClient();
    const productDisplay = new WhickhamProductDisplay(apiClient);
    
    // Global functions for Whickham store
    window.whickhamAPI = apiClient;
    window.whickhamDisplay = productDisplay;
    
    // Main load function
    window.loadWhickhamProducts = async function(containerId, options = {}) {
        return await productDisplay.loadProducts(containerId, options);
    };
    
    // Search function
    window.searchWhickhamProducts = async function(query, containerId) {
        return await productDisplay.loadProducts(containerId, { search: query });
    };
    
    // Category filter function
    window.filterWhickhamByCategory = async function(category, containerId) {
        return await productDisplay.loadProducts(containerId, { category });
    };
    
    // Cart integration - customize for your yojin.co.uk cart system
    window.addToWhickhamCart = function(sku, name, price) {
        console.log('[Whickham] Adding to cart:', { sku, name, price });
        
        // Check if yojin.co.uk has a global cart function
        if (typeof window.addToCart === 'function') {
            window.addToCart(sku, name, price);
        } else if (typeof window.yojinCart === 'object' && window.yojinCart.add) {
            window.yojinCart.add({ sku, name, price });
        } else {
            // Fallback - implement your cart logic here
            alert(\`Added \${name} to cart!\`);
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[Whickham] DOM ready - API initialized');
        });
    } else {
        console.log('[Whickham] API initialized immediately');
    }
    
    console.log('[Whickham] Product Integration loaded for:', window.location.href);
    
})();
`;
    }

    /**
     * Generate production-ready CSS for Whickham store
     */
    generateWhickhamStyles() {
        return `
/* Yojin Whickham Store - Production Styles */
.whickham-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin: 20px 0;
    padding: 0;
}

.whickham-product-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}

.whickham-product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
    background: #f8f9fa;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.whickham-product-card:hover .product-image img {
    transform: scale(1.05);
}

.product-content {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.product-name {
    font-size: 1.1em;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.product-description {
    color: #666;
    font-size: 0.9em;
    margin: 0 0 12px 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    flex-grow: 1;
}

.product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.product-price {
    font-size: 1.2em;
    font-weight: 700;
    color: #e74c3c;
}

.product-category {
    background: #f1f3f4;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    color: #555;
    font-weight: 500;
}

.product-actions {
    margin-top: auto;
}

.btn-add-to-cart {
    width: 100%;
    background: #28a745;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 6px;
    font-size: 0.9em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-add-to-cart:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-1px);
}

.btn-add-to-cart:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
}

/* Loading and error states */
.whickham-loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.whickham-error {
    text-align: center;
    padding: 40px;
    color: #dc3545;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 8px;
    margin: 20px 0;
}

.whickham-error button {
    background: #dc3545;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
}

.no-products {
    text-align: center;
    padding: 40px;
    color: #666;
    font-style: italic;
}

/* Responsive design */
@media (max-width: 768px) {
    .whickham-products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
        margin: 15px 0;
    }
    
    .product-content {
        padding: 12px;
    }
    
    .product-name {
        font-size: 1em;
    }
    
    .product-description {
        font-size: 0.85em;
    }
}

@media (max-width: 480px) {
    .whickham-products-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .product-image {
        height: 180px;
    }
}
`;
    }
}

module.exports = YojinWhickhamIntegration;