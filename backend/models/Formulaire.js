const pool = require('../config/db');

const Formulaire = {
  async create({ patient_id, type, geolocalisation_id }) {
    const [result] = await pool.execute(
      `INSERT INTO formulaires (patient_id, type, geolocalisation_id)
       VALUES (?, ?, ?)`,
      [patient_id, type, geolocalisation_id || null]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT f.*, p.nom AS patient_nom, p.prenom AS patient_prenom
       FROM formulaires f
       JOIN patients p ON f.patient_id = p.id
       WHERE f.id = ?`,
      [id]
    );
    return rows[0];
  },

  async getForPatient(patientId) {
    const [rows] = await pool.execute(
      `SELECT f.* FROM formulaires f
       WHERE f.patient_id = ?
       ORDER BY f.date_creation DESC`,
      [patientId]
    );
    return rows;
  },

  async valider(id) {
    const [rows] = await pool.execute('SELECT * FROM formulaires WHERE id = ?', [id]);
    return rows[0];
  }
};

module.exports = Formulaire;
