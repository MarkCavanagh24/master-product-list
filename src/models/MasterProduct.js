const database = require('./database');

class MasterProduct {
  static async create(productData) {
    const {
      sku, name, description, price, cost_price, category, brand, 
      weight, dimensions, image_url, tags, is_active = 1
    } = productData;

    const sql = `
      INSERT INTO master_products (
        sku, name, description, price, cost_price, category, brand,
        weight, dimensions, image_url, tags, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      sku, name, description, price, cost_price, category, brand,
      weight, dimensions, image_url, tags, is_active
    ];

    return await database.run(sql, params);
  }

  static async update(id, productData) {
    const {
      sku, name, description, price, cost_price, category, brand,
      weight, dimensions, image_url, tags, is_active
    } = productData;

    const sql = `
      UPDATE master_products SET
        sku = ?, name = ?, description = ?, price = ?, cost_price = ?,
        category = ?, brand = ?, weight = ?, dimensions = ?, image_url = ?,
        tags = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      sku, name, description, price, cost_price, category, brand,
      weight, dimensions, image_url, tags, is_active, id
    ];

    return await database.run(sql, params);
  }

  static async delete(id) {
    const sql = 'DELETE FROM master_products WHERE id = ?';
    return await database.run(sql, [id]);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM master_products WHERE id = ?';
    return await database.get(sql, [id]);
  }

  static async findBySku(sku) {
    const sql = 'SELECT * FROM master_products WHERE sku = ? AND is_active = 1';
    const rows = await database.all(sql, [sku]);
    return rows[0] || null;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM master_products WHERE 1=1';
    const params = [];

    if (filters.is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.brand) {
      sql += ' AND brand = ?';
      params.push(filters.brand);
    }

    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }

    return await database.all(sql, params);
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as count FROM master_products WHERE 1=1';
    const params = [];

    if (filters.is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';

      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const result = await database.get(sql, params);
    return result.count;
  }

  static async bulkCreate(products) {
    const sql = `
      INSERT INTO master_products (
        sku, name, description, price, cost_price, category, brand,
        weight, dimensions, image_url, tags, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const results = [];
    for (const product of products) {
      try {
        const params = [
          product.sku, product.name, product.description, product.price,
          product.cost_price, product.category, product.brand, product.weight,
          product.dimensions, product.image_url, product.tags, product.is_active || 1
        ];
        const result = await database.run(sql, params);
        results.push({ success: true, id: result.id, sku: product.sku });
      } catch (error) {
        results.push({ success: false, error: error.message, sku: product.sku });
      }
    }
    return results;
  }

  static async getCategories() {
    const sql = `
      SELECT DISTINCT category 
      FROM master_products 
      WHERE is_active = 1 AND category IS NOT NULL AND category != ''
      ORDER BY category
    `;
    const rows = await database.all(sql, []);
    return rows.map(row => row.category);
  }
}

module.exports = MasterProduct;
