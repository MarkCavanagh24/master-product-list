# Yojin.co.uk Store Integration Guide

This guide shows how to configure yojin.co.uk stores to use your centralized product API instead of uploading products individually to each store.

## Integration Overview

**Before (Manual Upload):**
- Upload 2000 products to each store manually
- 991 stores × 2000 products = 1.98 million operations
- Updates require re-uploading to every store

**After (API Integration):**
- Configure each store to call your API
- Real-time product data from central catalog
- Instant updates across all stores

## Your API Endpoints

**Base URL:** `https://your-domain.com/api/v1`

### Key Endpoints:
1. **Get Products:** `GET /products?merchant_id={STORE_ID}`
2. **Get Single Product:** `GET /products/{SKU}?merchant_id={STORE_ID}`
3. **Get Categories:** `GET /categories?merchant_id={STORE_ID}`

## Integration Methods

### Method 1: Frontend JavaScript Integration

If yojin.co.uk stores use JavaScript for product display:

```html
<!-- Add this to your store's product page template -->
<script>
// Your store's unique ID from the CSV
const STORE_ID = '6804ed7e609167bd23094bb3'; // Yojin Harrogate example

// API Configuration
const API_BASE = 'https://your-domain.com/api/v1';

// Load products for store homepage
async function loadStoreProducts(page = 1, category = null) {
    try {
        let url = `${API_BASE}/products?merchant_id=${STORE_ID}&page=${page}&limit=20`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.data.products);
            setupPagination(data.data.pagination);
            updateStoreInfo(data.data.merchant);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        showError('Unable to load products. Please try again.');
    }
}

// Display products in store layout
function displayProducts(products) {
    const container = document.getElementById('products-container');
    
    const productsHTML = products.map(product => `
        <div class="product-card" data-sku="${product.sku}">
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">£${product.price.toFixed(2)}</div>
            <div class="product-brand">${product.brand}</div>
            <div class="product-category">${product.category}</div>
            <button onclick="addToCart('${product.sku}')" class="add-to-cart-btn">
                Add to Cart
            </button>
        </div>
    `).join('');
    
    container.innerHTML = productsHTML;
}

// Search functionality
async function searchProducts(query) {
    try {
        const url = `${API_BASE}/products?merchant_id=${STORE_ID}&search=${encodeURIComponent(query)}&limit=50`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.data.products);
            document.getElementById('search-results-count').textContent = 
                `${data.data.pagination.total_items} products found`;
        }
    } catch (error) {
        console.error('Search failed:', error);
    }
}

// Category filtering
async function filterByCategory(category) {
    try {
        const url = `${API_BASE}/products?merchant_id=${STORE_ID}&category=${encodeURIComponent(category)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.data.products);
        }
    } catch (error) {
        console.error('Category filter failed:', error);
    }
}

// Load categories for navigation
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories?merchant_id=${STORE_ID}`);
        const data = await response.json();
        
        if (data.success) {
            const nav = document.getElementById('category-nav');
            const categoriesHTML = data.data.categories.map(category => 
                `<a href="#" onclick="filterByCategory('${category}')">${category}</a>`
            ).join('');
            nav.innerHTML = categoriesHTML;
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Get single product details
async function getProductDetails(sku) {
    try {
        const response = await fetch(`${API_BASE}/products/${sku}?merchant_id=${STORE_ID}`);
        const data = await response.json();
        
        if (data.success) {
            return data.data.product;
        }
    } catch (error) {
        console.error('Failed to get product details:', error);
    }
}

// Initialize store on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStoreProducts();
    loadCategories();
});
</script>
```

### Method 2: Server-Side Integration (PHP)

If yojin.co.uk stores use PHP backend:

```php
<?php
// config.php - Store configuration
define('STORE_ID', '6804ed7e609167bd23094bb3'); // Your store's ID
define('API_BASE', 'https://your-domain.com/api/v1');

// products.php - Product management
class YojinProductAPI {
    private $storeId;
    private $apiBase;
    
    public function __construct($storeId) {
        $this->storeId = $storeId;
        $this->apiBase = API_BASE;
    }
    
    public function getProducts($page = 1, $limit = 20, $category = null, $search = null) {
        $url = $this->apiBase . '/products?merchant_id=' . $this->storeId . 
               '&page=' . $page . '&limit=' . $limit;
        
        if ($category) $url .= '&category=' . urlencode($category);
        if ($search) $url .= '&search=' . urlencode($search);
        
        $response = file_get_contents($url);
        return json_decode($response, true);
    }
    
    public function getProduct($sku) {
        $url = $this->apiBase . '/products/' . $sku . '?merchant_id=' . $this->storeId;
        $response = file_get_contents($url);
        return json_decode($response, true);
    }
    
    public function getCategories() {
        $url = $this->apiBase . '/categories?merchant_id=' . $this->storeId;
        $response = file_get_contents($url);
        return json_decode($response, true);
    }
}

// Usage in store pages
$productAPI = new YojinProductAPI(STORE_ID);

// Homepage - show featured products
$products = $productAPI->getProducts(1, 12);
if ($products['success']) {
    foreach ($products['data']['products'] as $product) {
        echo '<div class="product">';
        echo '<h3>' . htmlspecialchars($product['name']) . '</h3>';
        echo '<p>£' . number_format($product['price'], 2) . '</p>';
        echo '<img src="' . htmlspecialchars($product['image_url']) . '" alt="' . htmlspecialchars($product['name']) . '">';
        echo '</div>';
    }
}

// Category page
if (isset($_GET['category'])) {
    $category = $_GET['category'];
    $products = $productAPI->getProducts(1, 50, $category);
    // Display products...
}

// Search results
if (isset($_GET['search'])) {
    $search = $_GET['search'];
    $products = $productAPI->getProducts(1, 50, null, $search);
    // Display search results...
}

// Product detail page
if (isset($_GET['sku'])) {
    $sku = $_GET['sku'];
    $product = $productAPI->getProduct($sku);
    if ($product['success']) {
        $product = $product['data']['product'];
        echo '<h1>' . htmlspecialchars($product['name']) . '</h1>';
        echo '<p>' . htmlspecialchars($product['description']) . '</p>';
        echo '<p>Price: £' . number_format($product['price'], 2) . '</p>';
        // Display full product details...
    }
}
?>
```

### Method 3: Node.js/Express Integration

If yojin.co.uk uses Node.js backend:

```javascript
// store-config.js
const STORE_CONFIG = {
    storeId: '6804ed7e609167bd23094bb3', // Your store's ID
    apiBase: 'https://your-domain.com/api/v1',
    storeName: 'Yojin Harrogate'
};

// product-service.js
const axios = require('axios');

class ProductService {
    constructor(storeId) {
        this.storeId = storeId;
        this.apiBase = STORE_CONFIG.apiBase;
    }
    
    async getProducts(page = 1, limit = 20, filters = {}) {
        try {
            let url = `${this.apiBase}/products?merchant_id=${this.storeId}&page=${page}&limit=${limit}`;
            
            if (filters.category) url += `&category=${encodeURIComponent(filters.category)}`;
            if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
            if (filters.sort) url += `&sort=${filters.sort}`;
            if (filters.order) url += `&order=${filters.order}`;
            
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }
    
    async getProduct(sku) {
        try {
            const response = await axios.get(`${this.apiBase}/products/${sku}?merchant_id=${this.storeId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }
    
    async getCategories() {
        try {
            const response = await axios.get(`${this.apiBase}/categories?merchant_id=${this.storeId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }
}

// routes/products.js
const express = require('express');
const ProductService = require('../services/product-service');
const router = express.Router();

const productService = new ProductService(STORE_CONFIG.storeId);

// Homepage - featured products
router.get('/', async (req, res) => {
    try {
        const products = await productService.getProducts(1, 12);
        res.render('homepage', { 
            products: products.data.products,
            store: products.data.merchant 
        });
    } catch (error) {
        res.status(500).render('error', { message: 'Failed to load products' });
    }
});

// Category page
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const page = parseInt(req.query.page) || 1;
        
        const result = await productService.getProducts(page, 20, { category });
        
        res.render('category', {
            products: result.data.products,
            pagination: result.data.pagination,
            category: category,
            store: result.data.merchant
        });
    } catch (error) {
        res.status(500).render('error', { message: 'Failed to load category' });
    }
});

// Search
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const page = parseInt(req.query.page) || 1;
        
        const result = await productService.getProducts(page, 20, { search: query });
        
        res.render('search-results', {
            products: result.data.products,
            pagination: result.data.pagination,
            searchQuery: query,
            store: result.data.merchant
        });
    } catch (error) {
        res.status(500).render('error', { message: 'Search failed' });
    }
});

// Product detail
router.get('/product/:sku', async (req, res) => {
    try {
        const sku = req.params.sku;
        const result = await productService.getProduct(sku);
        
        res.render('product-detail', {
            product: result.data.product,
            store: result.data.merchant
        });
    } catch (error) {
        res.status(404).render('error', { message: 'Product not found' });
    }
});

module.exports = router;
```

## Store Configuration Steps

### Step 1: Get Your Store ID
From your CSV file, find your store's unique ID:
- Yojin Harrogate: `6804ed7e609167bd23094bb3`
- Yojin York: `6804ed7f609167bd23094bba`
- Yojin Little Hulton: `6804ed7e609167bd23094bb5`
- [etc. for all 991 stores]

### Step 2: Replace Product Loading Logic
Instead of loading products from yojin.co.uk's database, call your API.

### Step 3: Update Templates
Modify your store templates to use API data structure.

### Step 4: Test Integration
1. Verify products load correctly
2. Test search functionality
3. Check category filtering
4. Validate pagination

## Benefits After Integration

1. **Real-time Updates**: Change prices once, update everywhere
2. **Instant New Products**: Add to master catalog, appears in all stores
3. **Consistent Data**: No sync delays or inconsistencies
4. **Reduced Storage**: No duplicate product data per store
5. **Better Performance**: Cached API responses vs heavy database queries

## Error Handling

```javascript
// Handle API failures gracefully
async function loadProductsWithFallback() {
    try {
        return await loadFromAPI();
    } catch (error) {
        console.error('API failed, using cached data:', error);
        return loadFromCache();
    }
}
```

## Caching Strategy

```javascript
// Cache API responses for better performance
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedProducts(cacheKey, apiCall) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    
    const data = await apiCall();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}
```

This integration transforms your stores from static product repositories into dynamic API consumers, solving your 1.98 million operation problem instantly!
