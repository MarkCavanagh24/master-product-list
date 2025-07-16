const dotenv = require('dotenv');
dotenv.config();

const config = {
  // Yojin API Configuration
  yojin: {
    apiUrl: process.env.YOJIN_API_URL || 'https://api.yojin.co.uk',
    apiKey: process.env.YOJIN_API_KEY,
    tenant: process.env.YOJIN_TENANT,
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 8080,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Database Configuration
  database: {
    path: process.env.DB_PATH || './data/products.db',
  },

  // Batch Processing Configuration
  batch: {
    size: parseInt(process.env.BATCH_SIZE) || 100,
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 10,
    requestDelayMs: parseInt(process.env.REQUEST_DELAY_MS) || 100,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = config;
