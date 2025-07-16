const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(config.database.path, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createTablesSQL = `
        -- Master Products Table
        CREATE TABLE IF NOT EXISTS master_products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sku TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          cost_price DECIMAL(10,2),
          category TEXT,
          brand TEXT,
          weight DECIMAL(10,3),
          dimensions TEXT,
          image_url TEXT,
          tags TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Merchants/Stores Table
        CREATE TABLE IF NOT EXISTS merchants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          merchant_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          api_key TEXT,
          is_active BOOLEAN DEFAULT 1,
          last_sync DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Product Sync Status Table
        CREATE TABLE IF NOT EXISTS product_sync_status (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          master_product_id INTEGER,
          merchant_id TEXT,
          yojin_product_id TEXT,
          sync_status TEXT DEFAULT 'pending',
          last_sync DATETIME,
          error_message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (master_product_id) REFERENCES master_products(id),
          FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
        );

        -- Sync Jobs Table
        CREATE TABLE IF NOT EXISTS sync_jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_type TEXT NOT NULL,
          merchant_id TEXT,
          status TEXT DEFAULT 'pending',
          progress INTEGER DEFAULT 0,
          total_items INTEGER DEFAULT 0,
          error_message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_master_products_sku ON master_products(sku);
        CREATE INDEX IF NOT EXISTS idx_master_products_active ON master_products(is_active);
        CREATE INDEX IF NOT EXISTS idx_merchants_merchant_id ON merchants(merchant_id);
        CREATE INDEX IF NOT EXISTS idx_sync_status_merchant ON product_sync_status(merchant_id);
        CREATE INDEX IF NOT EXISTS idx_sync_status_product ON product_sync_status(master_product_id);
        CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);
      `;

      this.db.exec(createTablesSQL, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database tables created successfully');
          resolve();
        }
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();
