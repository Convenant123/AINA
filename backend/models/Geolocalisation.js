const pool = require('../config/db');

const Geolocalisation = {
  async create(latitude, longitude) {
    const [result] = await pool.execute(
      'INSERT INTO geolocalisation (latitude, longitude, activee) VALUES (?, ?, TRUE)',
      [latitude, longitude]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM geolocalisation WHERE id = ?', [id]);
    return rows[0];
  },

  async activer(id) {
    await pool.execute('UPDATE geolocalisation SET activee = TRUE WHERE id = ?', [id]);
  },

  async updatePosition(id, latitude, longitude) {
    await pool.execute(
      'UPDATE geolocalisation SET latitude = ?, longitude = ? WHERE id = ?',
      [latitude, longitude, id]
    );
  }
};

module.exports = Geolocalisation;
