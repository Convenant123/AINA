const pool = require('../config/db');

const Hospital = {
  async getAll() {
    const [rows] = await pool.execute('SELECT * FROM hopitaux ORDER BY nom');
    return rows;
  },

  async findNearby(lat, lng, radiusKm = 50) {
    const [rows] = await pool.execute(
      `SELECT *,
        (6371 * ACOS(COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(latitude)))) AS distance
       FROM hopitaux
       HAVING distance <= ?
       ORDER BY distance`,
      [lat, lng, lat, radiusKm]
    );
    return rows;
  }
};

module.exports = Hospital;
