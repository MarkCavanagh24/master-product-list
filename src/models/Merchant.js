const database = require('./database');

class Merchant {
  static async create(merchantData) {
    const { merchant_id, name, api_key, is_active = 1 } = merchantData;

    const sql = `
      INSERT INTO merchants (merchant_id, name, api_key, is_active)
      VALUES (?, ?, ?, ?)
    `;

    return await database.run(sql, [merchant_id, name, api_key, is_active]);
  }

  static async update(merchant_id, merchantData) {
    const { name, api_key, is_active } = merchantData;

    const sql = `
      UPDATE merchants SET
        name = ?, api_key = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE merchant_id = ?
    `;

    return await database.run(sql, [name, api_key, is_active, merchant_id]);
  }

  static async delete(merchant_id) {
    const sql = 'DELETE FROM merchants WHERE merchant_id = ?';
    return await database.run(sql, [merchant_id]);
  }

  static async findById(merchant_id) {
    const sql = 'SELECT * FROM merchants WHERE merchant_id = ?';
    return await database.get(sql, [merchant_id]);
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM merchants WHERE 1=1';
    const params = [];

    if (filters.is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    sql += ' ORDER BY created_at DESC';

    return await database.all(sql, params);
  }

  static async updateLastSync(merchant_id) {
    const sql = `
      UPDATE merchants SET
        last_sync = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE merchant_id = ?
    `;

    return await database.run(sql, [merchant_id]);
  }

  static async bulkCreate(merchants) {
    const sql = `
      INSERT INTO merchants (merchant_id, name, api_key, is_active)
      VALUES (?, ?, ?, ?)
    `;

    const results = [];
    for (const merchant of merchants) {
      try {
        const params = [
          merchant.merchant_id, merchant.name, merchant.api_key, merchant.is_active || 1
        ];
        const result = await database.run(sql, params);
        results.push({ success: true, id: result.id, merchant_id: merchant.merchant_id });
      } catch (error) {
        results.push({ success: false, error: error.message, merchant_id: merchant.merchant_id });
      }
    }
    return results;
  }
}

module.exports = Merchant;
