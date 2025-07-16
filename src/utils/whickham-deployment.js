const fs = require('fs');
const path = require('path');
const YojinWhickhamIntegration = require('../services/YojinWhickhamIntegration');

/**
 * Generate deployment package for Whickham store
 */
function generateWhickhamDeployment() {
    const integration = new YojinWhickhamIntegration();
    
    const deploymentPackage = {
        store_url: 'https://www.yojin.co.uk/en/m/yojin-whickham',
        store_id: integration.storeId,
        store_name: integration.storeName,
        integration_instructions: `
# Whickham Store Integration

## 1. Add to your existing store page
Add this code to https://www.yojin.co.uk/en/m/yojin-whickham

## 2. Replace existing product section with:
<div id="whickham-products"></div>

## 3. Add integration script:
<script>
${integration.generateWhickhamIntegrationCode()}
</script>

## 4. Add styles:
<style>
${integration.generateWhickhamStyles()}
</style>

## 5. Initialize products:
<script>
window.addEventListener('load', function() {
    loadWhickhamProducts('whickham-products');
});
</script>
        `,
        api_endpoints: {
            products: `${integration.publicApiUrl}/api/v1/products?merchant_id=${integration.storeId}`,
            categories: `${integration.publicApiUrl}/api/v1/categories?merchant_id=${integration.storeId}`,
            test: `${integration.publicApiUrl}/whickham/test`
        },
        testing: {
            local_test: 'http://localhost:8080/whickham/test',
            integration_code: 'http://localhost:8080/whickham/integration-code'
        }
    };
    
    // Save deployment package
    const outputPath = path.join(__dirname, '../../deployment/whickham-deployment.json');
    fs.writeFileSync(outputPath, JSON.stringify(deploymentPackage, null, 2));
    
    console.log('✅ Whickham deployment package generated:', outputPath);
    return deploymentPackage;
}

module.exports = { generateWhickhamDeployment };