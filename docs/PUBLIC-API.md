# Public Product API Documentation

This API allows yojin.co.uk stores to fetch products in real-time from your centralized master catalog, eliminating the need to sync/upload products to each store.

## Base URL
```
https://your-domain.com/api/v1
```

## Architecture Benefits

### ✅ **API-First Approach (Recommended)**
- **Real-time updates**: Product changes appear instantly across all stores
- **Single source of truth**: 2000 products hosted centrally
- **Instant propagation**: Price/inventory updates reflect immediately
- **Scalable**: Add new stores without bulk uploads
- **Bandwidth efficient**: Stores only fetch what they need

### ❌ **Old Sync Approach**
- Manual uploads to each store
- Delays in updates across stores
- 6 million operations for full catalog
- Storage duplication across stores

## Endpoints

### 1. Get Products for Store
```http
GET /api/v1/products?merchant_id={STORE_ID}
```

**Required Parameters:**
- `merchant_id` - Your store's unique ID from the CSV

**Optional Parameters:**
- `category` - Filter by product category
- `search` - Search products by name/description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 200)
- `sort` - Sort by: name, price, created_at (default: name)
- `order` - asc or desc (default: asc)

**Example Request:**
```bash
curl "https://your-domain.com/api/v1/products?merchant_id=6804ed7e609167bd23094bb3&category=Groceries&limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "UK001",
        "name": "Weetabix Original 24 Biscuits",
        "description": "Nutritious whole grain breakfast cereal",
        "price": 3.25,
        "sku": "UK001",
        "category": "Groceries",
        "brand": "Weetabix",
        "weight": "430g",
        "image_url": "https://example.com/weetabix.jpg",
        "tags": ["cereal", "breakfast", "whole grain"],
        "is_active": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 2000,
      "total_pages": 100,
      "has_next": true,
      "has_prev": false
    },
    "merchant": {
      "id": "6804ed7e609167bd23094bb3",
      "name": "Yojin Harrogate"
    }
  }
}
```

### 2. Get Single Product
```http
GET /api/v1/products/{SKU}?merchant_id={STORE_ID}
```

**Example:**
```bash
curl "https://your-domain.com/api/v1/products/UK001?merchant_id=6804ed7e609167bd23094bb3"
```

### 3. Get Categories
```http
GET /api/v1/categories?merchant_id={STORE_ID}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": ["Groceries", "Beverages", "Household", "Personal Care"],
    "merchant": {
      "id": "6804ed7e609167bd23094bb3",
      "name": "Yojin Harrogate"
    }
  }
}
```

### 4. Health Check
```http
GET /api/v1/health
```

## Integration Examples

### For yojin.co.uk Stores

Instead of uploading products, configure each store to call your API:

**Store Frontend JavaScript:**
```javascript
// Fetch products for store page
async function loadProducts(storeId, page = 1) {
  const response = await fetch(
    `https://your-domain.com/api/v1/products?merchant_id=${storeId}&page=${page}&limit=20`
  );
  const data = await response.json();
  
  if (data.success) {
    displayProducts(data.data.products);
    setupPagination(data.data.pagination);
  }
}

// Search products
async function searchProducts(storeId, query) {
  const response = await fetch(
    `https://your-domain.com/api/v1/products?merchant_id=${storeId}&search=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.data.products;
}
```

**Store Backend (if using server-side rendering):**
```php
// PHP example for yojin.co.uk backend
function getStoreProducts($storeId, $page = 1) {
    $url = "https://your-domain.com/api/v1/products?merchant_id={$storeId}&page={$page}";
    $response = file_get_contents($url);
    return json_decode($response, true);
}
```

## Store Configuration

Each of your 991 active stores needs to be configured to use your API instead of local product storage:

### Store IDs from your CSV:
- Yojin Harrogate: `6804ed7e609167bd23094bb3`
- Yojin Little Hulton: `6804ed7e609167bd23094bb5`
- Yojin York: `6804ed7f609167bd23094bba`
- (and 988 more...)

## Error Handling

**Common Error Responses:**
```json
{
  "error": "merchant_id is required",
  "message": "Please provide your store ID in the merchant_id parameter"
}
```

```json
{
  "error": "Merchant not found",
  "message": "Invalid merchant_id provided"
}
```

## Rate Limiting & Performance

- **No rate limits** for authenticated store requests
- **Caching recommended**: Implement Redis/CDN for high-traffic stores
- **Pagination**: Use appropriate page sizes to optimize load times
- **Search optimization**: Search is indexed for fast results

## Yojin/Hyperzod Integration Status

### ✅ **Confirmed with Hyperzod Support**
- **Payment API**: Available at `https://api.hyperzod.app/public/v1/`
- **Product Management**: Only through admin panel interface
- **No Product API**: No direct API endpoints for product catalog management
- **Authentication**: Bearer Token in Authorization header

### 🎯 **Our Solution: Centralized Product API**
Since Yojin doesn't provide product management APIs, our centralized system is the perfect solution!

## Next Steps

1. **Deploy your API** to a public server (Heroku, AWS, DigitalOcean, etc.)
2. **Configure yojin.co.uk stores** to call your API instead of using local products
3. **Update product catalog** via your admin dashboard
4. **Monitor usage** via API logs

### Quick Deploy Commands
```bash
# Deploy to Heroku (example)
heroku create your-product-api
heroku config:set NODE_ENV=production
git push heroku main

# Your API will be available at:
# https://your-product-api.herokuapp.com/api/v1/products
```

This approach transforms your 6 million upload operations into simple API calls that scale effortlessly!
