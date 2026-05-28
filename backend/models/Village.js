const pool = require('../config/db');

const Village = {
  async getAll() {
    const [rows] = await pool.execute('SELECT * FROM villages ORDER BY nom');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM villages WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ nom, latitude, longitude, district, region }) {
    const [result] = await pool.execute(
      'INSERT INTO villages (nom, latitude, longitude, district, region) VALUES (?, ?, ?, ?, ?)',
      [nom, latitude, longitude, district, region]
    );
    return result.insertId;
  }
};

module.exports = Village;
