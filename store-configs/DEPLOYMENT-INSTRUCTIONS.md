# Yojin Store API Integration Deployment Guide

Generated: 2025-07-15T23:51:51.604Z
Total Stores: 991

## Quick Start Guide

### 1. Deploy Your Master API

First, deploy your centralized product API to a public server:

```bash
# Example using a cloud provider
# Replace with your preferred hosting solution

# Option A: Deploy to Heroku
heroku create your-yojin-api
git push heroku main

# Option B: Deploy to DigitalOcean
# Use their app platform or droplet

# Option C: Deploy to AWS
# Use Elastic Beanstalk or EC2
```

### 2. Update API URLs

Replace `https://your-domain.com/api/v1` in all generated config files with your live API URL:

```bash
# Linux/Mac
find ./store-configs -name "*.js" -exec sed -i 's|https://your-domain.com/api/v1|https://your-live-api.com/api/v1|g' {} +

# Windows PowerShell
Get-ChildItem ./store-configs -Filter "*.js" | ForEach-Object { 
    (Get-Content $_.FullName) -replace 'https://your-domain.com/api/v1', 'https://your-live-api.com/api/v1' | Set-Content $_.FullName 
}
```

### 3. Integration Methods

Choose the integration method that matches your yojin.co.uk store technology:

#### Method A: JavaScript Frontend Integration
For stores using modern JavaScript frameworks:

```javascript
// Use the generated *-config.js files
import { STORE_CONFIG, YojinHarrogateProductService } from './yojin-harrogate-config.js';

const productService = new YojinHarrogateProductService();
const products = await productService.getProducts(1, { category: 'Groceries' });
```

#### Method B: PHP Backend Integration
For stores using PHP:

```php
<?php
require_once 'stores-config.php';

$api = new YojinProductAPI('6804ed7e609167bd23094bb3'); // Harrogate
$products = $api->getProducts(1, ['category' => 'Groceries']);
?>
```

### 4. Test Integration

Start with a few stores to validate the integration:

#### Recommended Test Stores:
- **Yojin Harrogate** (ID: `6804ed7e609167bd23094bb3`) - Harrogate
- **Yojin Little Hulton** (ID: `6804ed7e609167bd23094bb5`) - Little Hulton
- **Yojin York** (ID: `6804ed7f609167bd23094bba`) - York
- **Yojin Thirlwall** (ID: `6855417c21bb01b10405e412`) - Thirlwall
- **Yojin Once Brewed** (ID: `6855417c21bb01b10405e413`) - Once Brewed

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

#### Phase 3: Full Rollout (991 stores)
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
- `yojin-harrogate-config.js` - Harrogate
- `yojin-little-hulton-config.js` - Little Hulton
- `yojin-york-config.js` - York
- `yojin-thirlwall-config.js` - Thirlwall
- `yojin-once-brewed-config.js` - Once Brewed
- `yojin-bardon-mill-config.js` - Bardon Mill
- `yojin-fourstones-config.js` - Fourstones
- `yojin-acomb-config.js` - Acomb
- `yojin-heddon-on-the-wall-config.js` - Heddon-on-the-Wall
- `yojin-blucher-config.js` - Blucher
- ... and 981 more

### 8. Benefits After Integration

#### Before (Current State):
- Manual upload to each store: **991 × 2000 = 1,982,000 operations**
- Time to update all stores: **Days/Weeks**
- Inconsistent product data across stores
- Storage duplication: **991 × product catalog size**

#### After (API Integration):
- Central product management: **1 update → 991 stores updated**
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
- API Health Check: `https://your-api.com/api/v1/health`
- Documentation: Available in the `docs/` folder

### 10. Next Steps

1. **Deploy your API** to production
2. **Update API URLs** in all config files
3. **Start with pilot stores** for testing
4. **Monitor and optimize** performance
5. **Roll out to all 991 stores**

🎉 **Result**: Transform your 6+ million product upload operations into simple API calls that scale effortlessly!
