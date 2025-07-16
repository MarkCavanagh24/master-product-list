const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./src/config');
const database = require('./src/models/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

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

// Basic routes first
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
        'POST /api/products': 'Create new product',
        'PUT /api/products/:id': 'Update product',
        'DELETE /api/products/:id': 'Delete product'
      },
      merchants: {
        'GET /api/merchants': 'Get all merchants',
        'POST /api/merchants': 'Create new merchant'
      },
      sync: {
        'GET /api/sync/test-connection': 'Test Yojin API connection'
      }
    }
  });
});

// Add routes one by one to identify the issue
try {
  const productsRouter = require('./src/routes/products');
  app.use('/api/products', productsRouter);
  console.log('✓ Products routes loaded');
} catch (error) {
  console.error('✗ Error loading products routes:', error.message);
}

try {
  const merchantsRouter = require('./src/routes/merchants');
  app.use('/api/merchants', merchantsRouter);
  console.log('✓ Merchants routes loaded');
} catch (error) {
  console.error('✗ Error loading merchants routes:', error.message);
}

try {
  const syncRouter = require('./src/routes/sync');
  app.use('/api/sync', syncRouter);
  console.log('✓ Sync routes loaded');
} catch (error) {
  console.error('✗ Error loading sync routes:', error.message);
}

// Serve the main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
    console.log('✓ Database initialized successfully');

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
