// Configuration for Yojin Edenbridge
// Store ID: 6855425921bb01b10405e73d
// Location: Edenbridge, TN8 6SL

const STORE_CONFIG = {
    // Store Identity
    storeId: '6855425921bb01b10405e73d',
    storeName: 'Yojin Edenbridge',
    city: 'Edenbridge',
    postcode: 'TN8 6SL',
    
    // API Configuration
    apiBase: 'https://your-domain.com/api/v1', // UPDATE THIS WITH YOUR LIVE API URL
    
    // Contact Information
    email: 'admin@yojin.co.uk',
    phone: '+447743458608',
    
    // Display Settings
    productsPerPage: 20,
    featuredProductsCount: 12,
    enableSearch: true,
    enableCategoryFilter: true,
    
    // Cache Settings
    cacheTTL: 300000, // 5 minutes
    enableCache: true
};

// Product API Service for Yojin Edenbridge
class YojinEdenbridgeProductService {
    constructor() {
        this.storeId = STORE_CONFIG.storeId;
        this.apiBase = STORE_CONFIG.apiBase;
        this.cache = new Map();
    }
    
    async getProducts(page = 1, filters = {}) {
        const cacheKey = `products-${page}-${JSON.stringify(filters)}`;
        
        if (STORE_CONFIG.enableCache) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < STORE_CONFIG.cacheTTL) {
                return cached.data;
            }
        }
        
        try {
            let url = `${this.apiBase}/products?merchant_id=${this.storeId}&page=${page}&limit=${STORE_CONFIG.productsPerPage}`;
            
            if (filters.category) url += `&category=${encodeURIComponent(filters.category)}`;
            if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
            if (filters.sort) url += `&sort=${filters.sort}`;
            if (filters.order) url += `&order=${filters.order}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (STORE_CONFIG.enableCache) {
                this.cache.set(cacheKey, { data, timestamp: Date.now() });
            }
            
            return data;
        } catch (error) {
            console.error('Failed to load products for Yojin Edenbridge:', error);
            throw error;
        }
    }
    
    async getProduct(sku) {
        try {
            const response = await fetch(`${this.apiBase}/products/${sku}?merchant_id=${this.storeId}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to load product:', error);
            throw error;
        }
    }
    
    async getCategories() {
        const cacheKey = 'categories';
        
        if (STORE_CONFIG.enableCache) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < STORE_CONFIG.cacheTTL) {
                return cached.data;
            }
        }
        
        try {
            const response = await fetch(`${this.apiBase}/categories?merchant_id=${this.storeId}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (STORE_CONFIG.enableCache) {
                this.cache.set(cacheKey, { data, timestamp: Date.now() });
            }
            
            return data;
        } catch (error) {
            console.error('Failed to load categories:', error);
            throw error;
        }
    }
}

// Usage Example:
// const productService = new YojinEdenbridgeProductService();
// productService.getProducts().then(data => console.log(data));

module.exports = { STORE_CONFIG, YojinEdenbridgeProductService };
