const express = require('express');
const cors = require('cors');
const config = require('./src/config');
const database = require('./src/models/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Master Product List API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve the dashboard
app.get('/', (req, res) => {
  res.send(`
    <h1>Master Product List Dashboard</h1>
    <p>Server is running successfully!</p>
    <p><a href="/api/health">Health Check</a></p>
  `);
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
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

module.exports = { app, startServer };

if (require.main === module) {
  startServer();
}
