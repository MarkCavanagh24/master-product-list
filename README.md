# Master Product List

A centralized product management system designed for the yojin.co.uk SaaS platform, enabling efficient bulk synchronization of products across 3000+ UK stores.

## 🚀 Features

### Core Functionality
- **Master Product Catalog** - Centralized product management with full CRUD operations
- **Merchant Management** - Store/merchant configuration and API key management
- **Bulk Synchronization** - Efficient batch processing for syncing products across multiple stores
- **CSV Import/Export** - Bulk data operations for easy product and merchant management
- **Sync Job Tracking** - Real-time monitoring of synchronization progress
- **Web Dashboard** - User-friendly interface for managing all operations

### Technical Features
- **RESTful API** - Well-structured endpoints for all operations
- **Rate Limiting** - Intelligent request throttling to respect API limits
- **Error Handling** - Comprehensive error tracking and retry logic
- **Database Management** - SQLite-based storage with proper indexing
- **Batch Processing** - Configurable batch sizes for optimal performance

## 📋 Problem Solved

Instead of manually uploading 2000 products to each of 3000+ stores (6 million total operations), this system:
1. Maintains a single master product catalog
2. Bulk synchronizes products to all stores efficiently
3. Tracks sync status and handles failures gracefully
4. Provides tools for easy product and merchant management

## 🛠️ Installation

1. **Clone or download** the project files
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment** (copy `.env.example` to `.env` and update):
   ```bash
   cp .env.example .env
   ```
4. **Start the application**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Configuration

Update the `.env` file with your yojin.co.uk API credentials:

```env
YOJIN_API_URL=https://api.yojin.co.uk
YOJIN_API_KEY=your_api_key_here
YOJIN_API_SECRET=your_api_secret_here
PORT=3000
```

## 📊 Usage

### Web Dashboard
Access the dashboard at `http://localhost:3000` for:
- Product management (add, edit, import/export)
- Merchant management (add, edit, import/export)
- Bulk synchronization operations
- Sync job monitoring
- System utilities

### API Endpoints

#### Products
- `GET /api/products` - List all products with filtering
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/import-csv` - Import products from CSV
- `GET /api/products/export/csv` - Export products to CSV

#### Merchants
- `GET /api/merchants` - List all merchants
- `POST /api/merchants` - Create new merchant
- `PUT /api/merchants/:id` - Update merchant
- `DELETE /api/merchants/:id` - Delete merchant
- `POST /api/merchants/import-csv` - Import merchants from CSV

#### Synchronization
- `POST /api/sync/sync-all` - Sync all products to all merchants
- `POST /api/products/:id/sync-all` - Sync specific product to all merchants
- `POST /api/merchants/:id/sync-all` - Sync all products to specific merchant
- `GET /api/sync/sync-jobs` - Get sync job history
- `GET /api/sync/sync-report` - Get detailed sync report

## 📁 Project Structure

```
master-product-list/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Database models
│   ├── services/        # Business logic & API integration
│   ├── routes/          # Express.js routes
│   └── app.js           # Main application
├── public/              # Web dashboard
├── data/                # Database and file storage
├── .env.example         # Environment configuration template
└── package.json         # Project dependencies
```

## 🔄 Synchronization Process

1. **Master Products** - Create/update products in the master catalog
2. **Merchant Setup** - Configure store connections and API keys
3. **Bulk Sync** - Choose from multiple sync options:
   - All products to all merchants
   - Specific product to all merchants
   - All products to specific merchant
4. **Monitoring** - Track progress via the dashboard or API
5. **Reporting** - View detailed sync reports and handle failures

## 🚦 Batch Configuration

The system includes configurable batch processing:
- **Batch Size** - Number of products per batch (default: 100)
- **Concurrency** - Maximum concurrent requests (default: 10)
- **Delays** - Request delays to respect rate limits (default: 100ms)

## 📝 CSV Format

### Products CSV
```csv
SKU,Name,Description,Price,Cost Price,Category,Brand,Weight,Dimensions,Image URL,Tags,Is Active
PROD001,Sample Product,Description,29.99,15.00,Electronics,Brand,0.5,10x5x2,https://example.com/image.jpg,tag1,1
```

### Merchants CSV
```csv
Merchant ID,Name,API Key,Is Active
MERCHANT001,Store Name,api_key_here,1
```

## 🔍 Monitoring & Reporting

- **Real-time Dashboard** - Live sync job status and progress
- **Sync History** - Complete history of all sync operations
- **Error Tracking** - Detailed error reporting and retry status
- **Export Reports** - CSV export of sync results for analysis

## 🛡️ Error Handling

- **Retry Logic** - Automatic retry for failed API calls
- **Rate Limiting** - Intelligent request spacing
- **Error Logging** - Comprehensive error tracking
- **Graceful Degradation** - Continues processing despite individual failures

## 🧪 Testing

Test the API connection:
```bash
curl http://localhost:3000/api/sync/test-connection
```

## 📞 Support

For issues or questions:
1. Check the sync job logs in the dashboard
2. Review the API error responses
3. Verify your yojin.co.uk API credentials
4. Check the sync report for detailed error information

## 🔐 Security

- Environment variables for sensitive data
- API key validation
- Input sanitization
- Error message sanitization

---

**Note**: This system is designed specifically for the yojin.co.uk SaaS platform. Ensure you have proper API credentials and understand the platform's rate limits before running large sync operations.
