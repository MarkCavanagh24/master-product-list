// Yojin Store Integration Library
// Add this to your yojin.co.uk store templates

class YojinProductAPI {
    constructor(storeId, apiUrl = 'https://yummy-seals-battle.loca.lt') {
        this.storeId = storeId;
        this.apiUrl = apiUrl;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    async makeRequest(endpoint, params = {}) {
        const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }
        
        try {
            const url = new URL(`${this.apiUrl}/api/v1${endpoint}`);
            url.searchParams.append('merchant_id', this.storeId);
            
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    url.searchParams.append(key, value);
                }
            });
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                // Cache the result
                this.cache.set(cacheKey, {
                    data: data.data,
                    timestamp: Date.now()
                });
                return data.data;
            } else {
                throw new Error(data.error || 'API request failed');
            }
        } catch (error) {
            console.error('YojinProductAPI Error:', error);
            throw error;
        }
    }
    
    async getProducts(options = {}) {
        const {
            page = 1,
            limit = 20,
            search = '',
            category = '',
            sort = 'name',
            order = 'asc'
        } = options;
        
        return await this.makeRequest('/products', {
            page,
            limit,
            search,
            category,
            sort,
            order
        });
    }
    
    async getProduct(sku) {
        const result = await this.makeRequest(`/products/${sku}`);
        return result.product;
    }
    
    async getCategories() {
        const result = await this.makeRequest('/categories');
        return result.categories;
    }
    
    async searchProducts(query, limit = 20) {
        return await this.getProducts({ search: query, limit });
    }
    
    async getProductsByCategory(category, limit = 20) {
        return await this.getProducts({ category, limit });
    }
    
    // Helper method to display products in HTML
    displayProducts(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="yojin-product-card" data-sku="${product.sku}">
                <div class="product-image">
                    <img src="${product.image_url || '/placeholder.jpg'}" alt="${product.name}" />
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">£${product.price}</p>
                    <p class="product-category">${product.category}</p>
                    <p class="product-description">${product.description}</p>
                    <button class="add-to-cart-btn" onclick="addToCart('${product.sku}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Helper method to create search functionality
    createSearchWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="yojin-search-widget">
                <input type="text" id="yojin-search-input" placeholder="Search products..." />
                <select id="yojin-category-filter">
                    <option value="">All Categories</option>
                </select>
                <button onclick="yojinSearch()">Search</button>
            </div>
        `;
        
        // Load categories
        this.getCategories().then(categories => {
            const select = document.getElementById('yojin-category-filter');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        });
    }
}

// Global functions for easy integration
let yojinAPI = null;

function initializeYojinAPI(storeId) {
    yojinAPI = new YojinProductAPI(storeId);
    console.log('Yojin Product API initialized for store:', storeId);
}

async function loadYojinProducts(containerId, options = {}) {
    if (!yojinAPI) {
        console.error('Yojin API not initialized. Call initializeYojinAPI(storeId) first.');
        return;
    }
    
    try {
        const data = await yojinAPI.getProducts(options);
        yojinAPI.displayProducts(data.products, containerId);
        return data;
    } catch (error) {
        console.error('Failed to load products:', error);
        document.getElementById(containerId).innerHTML = '<p>Failed to load products. Please try again.</p>';
    }
}

async function yojinSearch() {
    if (!yojinAPI) return;
    
    const searchTerm = document.getElementById('yojin-search-input').value;
    const category = document.getElementById('yojin-category-filter').value;
    
    try {
        const data = await yojinAPI.getProducts({ search: searchTerm, category });
        yojinAPI.displayProducts(data.products, 'yojin-products');
    } catch (error) {
        console.error('Search failed:', error);
    }
}

// Example usage functions
function addToCart(sku) {
    console.log('Adding to cart:', sku);
    // Implement your cart logic here
    alert(`Added ${sku} to cart! (Implement your cart logic here)`);
}

// Auto-initialize if store ID is provided
if (window.YOJIN_STORE_ID) {
    initializeYojinAPI(window.YOJIN_STORE_ID);
}
