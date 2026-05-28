const pool = require('../config/db');

const Alerte = {
  async create({ patient_id, type, latitude, longitude }) {
    const [result] = await pool.execute(
      `INSERT INTO alertes (patient_id, type, latitude, longitude)
       VALUES (?, ?, ?, ?)`,
      [patient_id, type || 'urgence', latitude || null, longitude || null]
    );
    return result.insertId;
  },

  async assignDoctor(alertId, medecin_id) {
    await pool.execute('UPDATE alertes SET medecin_id = ? WHERE id = ?', [medecin_id, alertId]);
  },

  async updateStatus(alertId, statut) {
    await pool.execute('UPDATE alertes SET statut = ? WHERE id = ?', [statut, alertId]);
  },

  async getPending() {
    const [rows] = await pool.execute(
      `SELECT a.*, p.nom AS patient_nom, p.prenom AS patient_prenom, p.telephone
       FROM alertes a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.statut = 'pending'
       ORDER BY a.date DESC`
    );
    return rows;
  },

  async getForPatient(patientId) {
    const [rows] = await pool.execute(
      `SELECT a.*, m.nom AS medecin_nom, m.prenom AS medecin_prenom
       FROM alertes a
       LEFT JOIN medecins m ON a.medecin_id = m.id
       WHERE a.patient_id = ?
       ORDER BY a.date DESC`,
      [patientId]
    );
    return rows;
  }
};

module.exports = Alerte;
