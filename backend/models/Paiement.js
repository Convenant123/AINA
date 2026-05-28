const pool = require('../config/db');

const Paiement = {
  async create({ patient_id, medecin_id, montant, mode_paiement }) {
    const [result] = await pool.execute(
      `INSERT INTO paiements (patient_id, medecin_id, montant, mode_paiement)
       VALUES (?, ?, ?, ?)`,
      [patient_id, medecin_id || null, montant, mode_paiement || 'carte']
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT pa.*, p.nom AS patient_nom, p.prenom AS patient_prenom,
              m.nom AS medecin_nom, m.prenom AS medecin_prenom
       FROM paiements pa
       JOIN patients p ON pa.patient_id = p.id
       LEFT JOIN medecins m ON pa.medecin_id = m.id
       WHERE pa.id = ?`,
      [id]
    );
    return rows[0];
  },

  async updateStatus(id, statut) {
    await pool.execute('UPDATE paiements SET statut = ? WHERE id = ?', [statut, id]);
  },

  async updateModePaiement(id, mode_paiement) {
    await pool.execute('UPDATE paiements SET mode_paiement = ? WHERE id = ?', [mode_paiement, id]);
  },

  async getForPatient(patientId) {
    const [rows] = await pool.execute(
      `SELECT pa.*, m.nom AS medecin_nom, m.prenom AS medecin_prenom
       FROM paiements pa
       LEFT JOIN medecins m ON pa.medecin_id = m.id
       WHERE pa.patient_id = ?
       ORDER BY pa.date DESC`,
      [patientId]
    );
    return rows;
  }
};

module.exports = Paiement;
