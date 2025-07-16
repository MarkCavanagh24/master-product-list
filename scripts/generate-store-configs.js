const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Script to generate yojin.co.uk store configurations for API integration

async function generateStoreConfigurations() {
    console.log('🏪 Generating Yojin Store API Configurations...\n');

    const stores = [];
    const merchantsFile = path.join(__dirname, '../merchants-1.csv');

    // Read merchant data
    return new Promise((resolve, reject) => {
        fs.createReadStream(merchantsFile)
            .pipe(csv())
            .on('data', (row) => {
                // Only process active UK stores
                if (row['MERCHANT.STATUS'] === 'ACTIVE' && row['MERCHANT.COUNTRY.CODE'] === 'GB') {
                    stores.push({
                        id: row['MERCHANT.ID'],
                        name: row['MERCHANT.NAME'],
                        city: row['MERCHANT.CITY'],
                        postcode: row['MERCHANT.POST.CODE'],
                        email: row['MERCHANT.EMAIL'],
                        phone: row['MERCHANT.PHONE']
                    });
                }
            })
            .on('end', () => {
                console.log(`📊 Found ${stores.length} active UK stores\n`);
                generateConfigurations(stores);
                resolve();
            })
            .on('error', reject);
    });
}

function generateConfigurations(stores) {
    // Create output directory
    const outputDir = path.join(__dirname, '../store-configs');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate JavaScript configuration for each store
    stores.forEach((store, index) => {
        const storeName = store.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const fileName = `${storeName}-config.js`;
        
        const config = generateStoreConfig(store);
        fs.writeFileSync(path.join(outputDir, fileName), config);
        
        if (index < 5) { // Show first 5 as examples
            console.log(`✅ Generated: ${fileName}`);
        }
    });

    // Generate master configuration file
    const masterConfig = generateMasterConfig(stores);
    fs.writeFileSync(path.join(outputDir, 'all-stores-config.js'), masterConfig);

    // Generate PHP configuration
    const phpConfig = generatePHPConfig(stores);
    fs.writeFileSync(path.join(outputDir, 'stores-config.php'), phpConfig);

    // Generate deployment instructions
    const instructions = generateDeploymentInstructions(stores);
    fs.writeFileSync(path.join(outputDir, 'DEPLOYMENT-INSTRUCTIONS.md'), instructions);

    console.log(`\n🎉 Generated configurations for ${stores.length} stores!`);
    console.log(`📁 Files saved to: ${outputDir}`);
    console.log('\n📋 Next steps:');
    console.log('1. Deploy your master API to a public server');
    console.log('2. Update API_BASE_URL in generated configs');
    console.log('3. Integrate store configs into yojin.co.uk stores');
    console.log('4. Test with a few stores before rolling out to all 991');
}

function generateStoreConfig(store) {
    return `// Configuration for ${store.name}
// Store ID: ${store.id}
// Location: ${store.city}, ${store.postcode}

const STORE_CONFIG = {
    // Store Identity
    storeId: '${store.id}',
    storeName: '${store.name}',
    city: '${store.city}',
    postcode: '${store.postcode}',
    
    // API Configuration
    apiBase: 'https://your-domain.com/api/v1', // UPDATE THIS WITH YOUR LIVE API URL
    
    // Contact Information
    email: '${store.email || 'admin@yojin.co.uk'}',
    phone: '${store.phone || '+447743458511'}',
    
    // Display Settings
    productsPerPage: 20,
    featuredProductsCount: 12,
    enableSearch: true,
    enableCategoryFilter: true,
    
    // Cache Settings
    cacheTTL: 300000, // 5 minutes
    enableCache: true
};

// Product API Service for ${store.name}
class ${store.name.replace(/[^a-zA-Z0-9]/g, '')}ProductService {
    constructor() {
        this.storeId = STORE_CONFIG.storeId;
        this.apiBase = STORE_CONFIG.apiBase;
        this.cache = new Map();
    }
    
    async getProducts(page = 1, filters = {}) {
        const cacheKey = \`products-\${page}-\${JSON.stringify(filters)}\`;
        
        if (STORE_CONFIG.enableCache) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < STORE_CONFIG.cacheTTL) {
                return cached.data;
            }
        }
        
        try {
            let url = \`\${this.apiBase}/products?merchant_id=\${this.storeId}&page=\${page}&limit=\${STORE_CONFIG.productsPerPage}\`;
            
            if (filters.category) url += \`&category=\${encodeURIComponent(filters.category)}\`;
            if (filters.search) url += \`&search=\${encodeURIComponent(filters.search)}\`;
            if (filters.sort) url += \`&sort=\${filters.sort}\`;
            if (filters.order) url += \`&order=\${filters.order}\`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
            
            const data = await response.json();
            
            if (STORE_CONFIG.enableCache) {
                this.cache.set(cacheKey, { data, timestamp: Date.now() });
            }
            
            return data;
        } catch (error) {
            console.error('Failed to load products for ${store.name}:', error);
            throw error;
        }
    }
    
    async getProduct(sku) {
        try {
            const response = await fetch(\`\${this.apiBase}/products/\${sku}?merchant_id=\${this.storeId}\`);
            if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
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
            const response = await fetch(\`\${this.apiBase}/categories?merchant_id=\${this.storeId}\`);
            if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
            
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
// const productService = new ${store.name.replace(/[^a-zA-Z0-9]/g, '')}ProductService();
// productService.getProducts().then(data => console.log(data));

module.exports = { STORE_CONFIG, ${store.name.replace(/[^a-zA-Z0-9]/g, '')}ProductService };
`;
}

function generateMasterConfig(stores) {
    const storeList = stores.map(store => `    {
        id: '${store.id}',
        name: '${store.name}',
        city: '${store.city}',
        postcode: '${store.postcode}'
    }`).join(',\n');

    return `// Master configuration for all ${stores.length} active Yojin stores
// Generated: ${new Date().toISOString()}

const ALL_STORES = [
${storeList}
];

const MASTER_CONFIG = {
    apiBase: 'https://your-domain.com/api/v1', // UPDATE THIS
    totalStores: ${stores.length},
    defaultProductsPerPage: 20,
    maxProductsPerPage: 200,
    cacheEnabled: true,
    cacheTTL: 300000 // 5 minutes
};

// Utility functions
function getStoreById(storeId) {
    return ALL_STORES.find(store => store.id === storeId);
}

function getStoresByCity(city) {
    return ALL_STORES.filter(store => store.city.toLowerCase().includes(city.toLowerCase()));
}

function getAllStoreIds() {
    return ALL_STORES.map(store => store.id);
}

// Generic API service that works for any store
class UniversalYojinProductService {
    constructor(storeId) {
        this.storeId = storeId;
        this.store = getStoreById(storeId);
        this.apiBase = MASTER_CONFIG.apiBase;
        
        if (!this.store) {
            throw new Error(\`Store with ID \${storeId} not found\`);
        }
    }
    
    async getProducts(page = 1, filters = {}) {
        try {
            let url = \`\${this.apiBase}/products?merchant_id=\${this.storeId}&page=\${page}&limit=\${MASTER_CONFIG.defaultProductsPerPage}\`;
            
            if (filters.category) url += \`&category=\${encodeURIComponent(filters.category)}\`;
            if (filters.search) url += \`&search=\${encodeURIComponent(filters.search)}\`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
            return await response.json();
        } catch (error) {
            console.error(\`Failed to load products for \${this.store.name}:\`, error);
            throw error;
        }
    }
}

module.exports = { ALL_STORES, MASTER_CONFIG, getStoreById, getStoresByCity, getAllStoreIds, UniversalYojinProductService };
`;
}

function generatePHPConfig(stores) {
    const storeArray = stores.map(store => `    [
        'id' => '${store.id}',
        'name' => '${store.name}',
        'city' => '${store.city}',
        'postcode' => '${store.postcode}',
        'email' => '${store.email || 'admin@yojin.co.uk'}',
        'phone' => '${store.phone || '+447743458511'}'
    ]`).join(',\n');

    return `<?php
// PHP Configuration for all ${stores.length} active Yojin stores
// Generated: ${new Date().toISOString()}

class YojinStoresConfig {
    const API_BASE = 'https://your-domain.com/api/v1'; // UPDATE THIS
    const CACHE_TTL = 300; // 5 minutes
    
    public static $stores = [
${storeArray}
    ];
    
    public static function getStoreById($storeId) {
        foreach (self::$stores as $store) {
            if ($store['id'] === $storeId) {
                return $store;
            }
        }
        return null;
    }
    
    public static function getStoresByCity($city) {
        return array_filter(self::$stores, function($store) use ($city) {
            return stripos($store['city'], $city) !== false;
        });
    }
    
    public static function getAllStoreIds() {
        return array_column(self::$stores, 'id');
    }
}

// Universal PHP API service for any Yojin store
class YojinProductAPI {
    private $storeId;
    private $store;
    private $apiBase;
    
    public function __construct($storeId) {
        $this->storeId = $storeId;
        $this->store = YojinStoresConfig::getStoreById($storeId);
        $this->apiBase = YojinStoresConfig::API_BASE;
        
        if (!$this->store) {
            throw new Exception("Store with ID $storeId not found");
        }
    }
    
    public function getProducts($page = 1, $filters = []) {
        $url = $this->apiBase . '/products?merchant_id=' . $this->storeId . '&page=' . $page . '&limit=20';
        
        if (isset($filters['category'])) {
            $url .= '&category=' . urlencode($filters['category']);
        }
        if (isset($filters['search'])) {
            $url .= '&search=' . urlencode($filters['search']);
        }
        
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
    
    public function getStoreInfo() {
        return $this->store;
    }
}

// Usage examples:
// $api = new YojinProductAPI('6804ed7e609167bd23094bb3'); // Yojin Harrogate
// $products = $api->getProducts(1, ['category' => 'Groceries']);
// $store = $api->getStoreInfo();
?>`;
}

function generateDeploymentInstructions(stores) {
    return `# Yojin Store API Integration Deployment Guide

Generated: ${new Date().toISOString()}
Total Stores: ${stores.length}

## Quick Start Guide

### 1. Deploy Your Master API

First, deploy your centralized product API to a public server:

\`\`\`bash
# Example using a cloud provider
# Replace with your preferred hosting solution

# Option A: Deploy to Heroku
heroku create your-yojin-api
git push heroku main

# Option B: Deploy to DigitalOcean
# Use their app platform or droplet

# Option C: Deploy to AWS
# Use Elastic Beanstalk or EC2
\`\`\`

### 2. Update API URLs

Replace \`https://your-domain.com/api/v1\` in all generated config files with your live API URL:

\`\`\`bash
# Linux/Mac
find ./store-configs -name "*.js" -exec sed -i 's|https://your-domain.com/api/v1|https://your-live-api.com/api/v1|g' {} +

# Windows PowerShell
Get-ChildItem ./store-configs -Filter "*.js" | ForEach-Object { 
    (Get-Content $_.FullName) -replace 'https://your-domain.com/api/v1', 'https://your-live-api.com/api/v1' | Set-Content $_.FullName 
}
\`\`\`

### 3. Integration Methods

Choose the integration method that matches your yojin.co.uk store technology:

#### Method A: JavaScript Frontend Integration
For stores using modern JavaScript frameworks:

\`\`\`javascript
// Use the generated *-config.js files
import { STORE_CONFIG, YojinHarrogateProductService } from './yojin-harrogate-config.js';

const productService = new YojinHarrogateProductService();
const products = await productService.getProducts(1, { category: 'Groceries' });
\`\`\`

#### Method B: PHP Backend Integration
For stores using PHP:

\`\`\`php
<?php
require_once 'stores-config.php';

$api = new YojinProductAPI('6804ed7e609167bd23094bb3'); // Harrogate
$products = $api->getProducts(1, ['category' => 'Groceries']);
?>
\`\`\`

### 4. Test Integration

Start with a few stores to validate the integration:

#### Recommended Test Stores:
${stores.slice(0, 5).map(store => `- **${store.name}** (ID: \`${store.id}\`) - ${store.city}`).join('\n')}

#### Test Checklist:
- [ ] Products load correctly
- [ ] Search functionality works
- [ ] Category filtering works
- [ ] Pagination functions
- [ ] Product details display properly
- [ ] Performance is acceptable
- [ ] Error handling works

### 5. Rollout Strategy

#### Phase 1: Pilot (5 stores)
- Deploy to 5 test stores
- Monitor for 1 week
- Gather feedback and fix issues

#### Phase 2: Regional (50 stores)
- Deploy to one region (e.g., all Yorkshire stores)
- Monitor performance and stability
- Optimize based on load patterns

#### Phase 3: Full Rollout (${stores.length} stores)
- Deploy to all remaining stores
- Monitor API performance
- Have rollback plan ready

### 6. Monitoring & Maintenance

#### API Monitoring
- Set up health checks for your API
- Monitor response times
- Track API usage patterns
- Set up alerts for failures

#### Performance Optimization
- Implement caching (Redis recommended)
- Use CDN for static assets
- Monitor database performance
- Scale server resources as needed

### 7. Store-Specific Configurations

Each store has been configured with:
- Unique Store ID from your CSV
- Store name and location
- Contact information
- Optimized cache settings

#### Example Store Configs Generated:
${stores.slice(0, 10).map(store => `- \`${store.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-config.js\` - ${store.city}`).join('\n')}
- ... and ${stores.length - 10} more

### 8. Benefits After Integration

#### Before (Current State):
- Manual upload to each store: **${stores.length} × 2000 = ${(stores.length * 2000).toLocaleString()} operations**
- Time to update all stores: **Days/Weeks**
- Inconsistent product data across stores
- Storage duplication: **${stores.length} × product catalog size**

#### After (API Integration):
- Central product management: **1 update → ${stores.length} stores updated**
- Time to update all stores: **Instant**
- Consistent product data everywhere
- Storage efficiency: **Single source of truth**

### 9. Support & Troubleshooting

#### Common Issues:
1. **CORS errors**: Configure CORS headers on your API
2. **Rate limiting**: Implement proper rate limiting
3. **Cache issues**: Set appropriate TTL values
4. **Network timeouts**: Implement retry logic

#### Contact Information:
- API Health Check: \`https://your-api.com/api/v1/health\`
- Documentation: Available in the \`docs/\` folder

### 10. Next Steps

1. **Deploy your API** to production
2. **Update API URLs** in all config files
3. **Start with pilot stores** for testing
4. **Monitor and optimize** performance
5. **Roll out to all ${stores.length} stores**

🎉 **Result**: Transform your 6+ million product upload operations into simple API calls that scale effortlessly!
`;
}

// Run the generator
generateStoreConfigurations().catch(console.error);

module.exports = { generateStoreConfigurations };
