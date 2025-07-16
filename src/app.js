const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const database = require('./models/database');

// Import routes
const productsRouter = require('./routes/products');
const merchantsRouter = require('./routes/merchants');
const syncRouter = require('./routes/sync');
const publicApiRouter = require('./routes/public-api');

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/static', express.static(path.join(__dirname, '../public')));

// Serve static files for integration testing
app.use('/integration', express.static(path.join(__dirname, '../')));

// Create necessary directories
const requiredDirs = [
  'data/uploads',
  'data/exports'
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/merchants', merchantsRouter);
app.use('/api/sync', syncRouter);

// Public API for stores to consume (no auth required)
app.use('/api/v1', publicApiRouter);

// Add integration routes
const integrationRoutes = require('./routes/integration');
app.use('/integration', integrationRoutes);

// Add Whickham integration routes
const whickhamRoutes = require('./routes/whickham-integration');
app.use('/whickham', whickhamRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Master Product List API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Master Product List API',
    version: '1.0.0',
    endpoints: {
      products: {
        'GET /api/products': 'Get all products with filtering and pagination',
        'GET /api/products/:id': 'Get single product by ID',
        'POST /api/products': 'Create new product',
        'PUT /api/products/:id': 'Update product',
        'DELETE /api/products/:id': 'Delete product',
        'POST /api/products/bulk': 'Bulk create products',
        'POST /api/products/import-csv': 'Import products from CSV',
        'GET /api/products/export/csv': 'Export products to CSV',
        'POST /api/products/:id/sync/:merchantId': 'Sync product to specific merchant',
        'POST /api/products/:id/sync-all': 'Sync product to all merchants'
      },
      merchants: {
        'GET /api/merchants': 'Get all merchants',
        'GET /api/merchants/:id': 'Get single merchant by ID',
        'POST /api/merchants': 'Create new merchant',
        'PUT /api/merchants/:id': 'Update merchant',
        'DELETE /api/merchants/:id': 'Delete merchant',
        'POST /api/merchants/bulk': 'Bulk create merchants',
        'POST /api/merchants/import-csv': 'Import merchants from CSV',
        'GET /api/merchants/export/csv': 'Export merchants to CSV',
        'POST /api/merchants/:id/sync-all': 'Sync all products to merchant'
      },
      sync: {
        'GET /api/sync/test-connection': 'Test Yojin API connection',
        'GET /api/sync/limits': 'Get API rate limits',
        'POST /api/sync/sync-all': 'Sync all products to all merchants',
        'GET /api/sync/sync-jobs': 'Get sync job history',
        'GET /api/sync/sync-jobs/:id': 'Get specific sync job status',
        'GET /api/sync/sync-report': 'Get sync status report'
      }
    }
  });
});

// Serve the main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

async function startServer() {
  try {
    // Initialize database
    await database.init();
    console.log('Database initialized successfully');

    // Start server
    const PORT = config.server.port;
    app.listen(PORT, () => {
      console.log(`\n🚀 Master Product List API Server running on port ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}`);
      console.log(`🔍 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`\nEnvironment: ${config.server.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await database.close();
  process.exit(0);
});

module.exports = { app, startServer };

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}
