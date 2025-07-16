# 🚀 Yojin Store Integration Guide

## Step-by-Step Implementation

### 1. Test Your Integration First

Open the test page to verify everything works:
```bash
# Open in browser
start yojin-integration-test.html
```

### 2. Add to Your yojin.co.uk Store Template

#### Option A: Simple Integration (Recommended)
Add this to your store's HTML template:

```html
<!-- Add this to your <head> section -->
<link rel="stylesheet" href="yojin-integration.css">
<script src="yojin-integration.js"></script>
<script>
    // Set your store ID
    window.YOJIN_STORE_ID = '6848451969ae1c9bcb0500da';
</script>

<!-- Add this where you want products to appear -->
<div id="yojin-search-container"></div>
<div id="yojin-products" class="yojin-products-grid"></div>

<script>
    // Initialize when page loads
    document.addEventListener('DOMContentLoaded', function() {
        // Create search widget
        yojinAPI.createSearchWidget('yojin-search-container');
        
        // Load initial products
        loadYojinProducts('yojin-products', { limit: 20 });
    });
</script>
```

#### Option B: Advanced Integration
```html
<script>
    // Custom implementation
    const api = new YojinProductAPI('6848451969ae1c9bcb0500da');
    
    async function loadStorePage() {
        try {
            // Load categories for navigation
            const categories = await api.getCategories();
            createCategoryNavigation(categories);
            
            // Load featured products
            const featuredProducts = await api.getProducts({ limit: 8 });
            displayFeaturedProducts(featuredProducts.products);
            
            // Set up search functionality
            setupSearchHandlers();
            
        } catch (error) {
            console.error('Failed to load store:', error);
        }
    }
    
    function createCategoryNavigation(categories) {
        const nav = document.getElementById('category-nav');
        nav.innerHTML = categories.map(cat => 
            `<button class="yojin-category-btn" onclick="loadByCategory('${cat}')">${cat}</button>`
        ).join('');
    }
    
    async function loadByCategory(category) {
        const products = await api.getProductsByCategory(category);
        api.displayProducts(products.products, 'yojin-products');
    }
    
    // Initialize
    loadStorePage();
</script>
```

### 3. Configure Your Store Settings

Update your store configuration:

```javascript
// Store Configuration
const STORE_CONFIG = {
    storeId: '6848451969ae1c9bcb0500da',
    apiUrl: 'https://yummy-seals-battle.loca.lt', // Your tunnel URL
    productsPerPage: 20,
    enableSearch: true,
    enableCategories: true,
    enableCache: true,
    cacheTimeout: 300000 // 5 minutes
};
```

### 4. Test Individual Features

#### Test Products Loading
```javascript
// Test in browser console
loadYojinProducts('yojin-products', { limit: 5 });
```

#### Test Search
```javascript
// Test search functionality
yojinAPI.searchProducts('coca').then(data => {
    console.log('Search results:', data.products);
});
```

#### Test Categories
```javascript
// Test category loading
yojinAPI.getCategories().then(categories => {
    console.log('Categories:', categories);
});
```

### 5. Add to Multiple Stores

For each store, just change the store ID:

```javascript
// Store 1: Yojin Whickham
window.YOJIN_STORE_ID = '6848451969ae1c9bcb0500da';

// Store 2: Yojin Harrogate
window.YOJIN_STORE_ID = '6804ed7e609167bd23094bb3';

// Store 3: Yojin Little Hulton
window.YOJIN_STORE_ID = '6804ed7e609167bd23094bb5';
```

### 6. Monitor and Debug

Add error handling and logging:

```javascript
// Enhanced error handling
window.addEventListener('error', function(e) {
    console.error('Page Error:', e);
});

// API error monitoring
yojinAPI.onError = function(error) {
    console.error('API Error:', error);
    // Send to your error tracking service
};
```

### 7. Performance Optimization

```javascript
// Enable caching
yojinAPI.enableCache = true;

// Preload categories
yojinAPI.preloadCategories();

// Lazy load images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});
```

## 🔧 Troubleshooting

### Common Issues

1. **Products not loading**
   - Check if your tunnel is still running
   - Verify the store ID is correct
   - Check browser console for errors

2. **CORS errors**
   - Your API already has CORS enabled
   - If issues persist, check tunnel configuration

3. **Search not working**
   - Ensure search input has correct ID
   - Check if API endpoint is accessible

### Testing Commands

```bash
# Test API directly
curl "https://yummy-seals-battle.loca.lt/api/v1/products?merchant_id=6848451969ae1c9bcb0500da&limit=3"

# Test health
curl "https://yummy-seals-battle.loca.lt/api/v1/health"

# Test categories
curl "https://yummy-seals-battle.loca.lt/api/v1/categories?merchant_id=6848451969ae1c9bcb0500da"
```

## 🎯 Next Steps

1. **Test the integration** using `yojin-integration-test.html`
2. **Add to one store** first as a pilot
3. **Verify functionality** with real users
4. **Roll out to all stores** once confirmed working
5. **Deploy to production** when ready

Your API is ready for integration! 🚀
