const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Production deployment script
 * Handles deployment to various cloud platforms
 */
class ProductionDeployer {
    constructor() {
        this.platforms = {
            heroku: this.deployToHeroku.bind(this),
            railway: this.deployToRailway.bind(this),
            digitalocean: this.deployToDigitalOcean.bind(this)
        };
    }

    async deployToHeroku(appName) {
        console.log('🚀 Deploying to Heroku...');
        
        try {
            // Create Heroku app
            execSync(`heroku create ${appName}`, { stdio: 'inherit' });
            
            // Set environment variables
            execSync('heroku config:set NODE_ENV=production', { stdio: 'inherit' });
            execSync('heroku config:set PORT=8080', { stdio: 'inherit' });
            
            // Deploy
            execSync('git add .', { stdio: 'inherit' });
            execSync('git commit -m "Production deployment"', { stdio: 'inherit' });
            execSync('git push heroku main', { stdio: 'inherit' });
            
            const url = `https://${appName}.herokuapp.com`;
            console.log(`✅ Deployed successfully to: ${url}`);
            
            return url;
        } catch (error) {
            console.error('❌ Heroku deployment failed:', error.message);
            throw error;
        }
    }

    async deployToRailway(appName) {
        console.log('🚀 Deploying to Railway...');
        
        try {
            execSync('railway login', { stdio: 'inherit' });
            execSync(`railway new ${appName}`, { stdio: 'inherit' });
            execSync('railway up', { stdio: 'inherit' });
            
            const url = await this.getRailwayUrl();
            console.log(`✅ Deployed successfully to: ${url}`);
            
            return url;
        } catch (error) {
            console.error('❌ Railway deployment failed:', error.message);
            throw error;
        }
    }

    async updateStoreConfigs(productionUrl) {
        console.log('🔄 Updating store configurations...');
        
        const configDir = path.join(__dirname, '../store-configs');
        const files = fs.readdirSync(configDir);
        
        let updatedCount = 0;
        
        files.forEach(file => {
            if (file.endsWith('.js')) {
                const filePath = path.join(configDir, file);
                let content = fs.readFileSync(filePath, 'utf8');
                
                // Update API URL
                content = content.replace(
                    /apiUrl:\s*['"`]https:\/\/yummy-seals-battle\.loca\.lt['"`]/g,
                    `apiUrl: '${productionUrl}'`
                );
                
                fs.writeFileSync(filePath, content);
                updatedCount++;
            }
        });
        
        console.log(`✅ Updated ${updatedCount} store configuration files`);
    }
}

// Command line usage
if (require.main === module) {
    const deployer = new ProductionDeployer();
    const platform = process.argv[2] || 'heroku';
    const appName = process.argv[3] || 'yojin-product-api';
    
    deployer[platform](appName)
        .then(url => deployer.updateStoreConfigs(url))
        .catch(console.error);
}

module.exports = ProductionDeployer;