const pool = require('../config/db');

const ParcoursDeSoins = {
  async create({ patient_id, medecin_id, description, date_debut, date_fin }) {
    const [result] = await pool.execute(
      `INSERT INTO parcours_de_soins (patient_id, medecin_id, description, date_debut, date_fin)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, medecin_id, description, date_debut, date_fin || null]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ps.*, p.nom AS patient_nom, p.prenom AS patient_prenom,
              m.nom AS medecin_nom, m.prenom AS medecin_prenom, m.specialite
       FROM parcours_de_soins ps
       JOIN patients p ON ps.patient_id = p.id
       JOIN medecins m ON ps.medecin_id = m.id
       WHERE ps.id = ?`,
      [id]
    );
    return rows[0];
  },

  async updateStatus(id, statut) {
    await pool.execute('UPDATE parcours_de_soins SET statut = ? WHERE id = ?', [statut, id]);
  },

  async updateDateFin(id, date_fin) {
    await pool.execute('UPDATE parcours_de_soins SET date_fin = ? WHERE id = ?', [date_fin, id]);
  },

  async getForPatient(patientId) {
    const [rows] = await pool.execute(
      `SELECT ps.*, m.nom AS medecin_nom, m.prenom AS medecin_prenom, m.specialite
       FROM parcours_de_soins ps
       JOIN medecins m ON ps.medecin_id = m.id
       WHERE ps.patient_id = ?
       ORDER BY ps.created_at DESC`,
      [patientId]
    );
    return rows;
  },

  async getForMedecin(medecinId) {
    const [rows] = await pool.execute(
      `SELECT ps.*, p.nom AS patient_nom, p.prenom AS patient_prenom
       FROM parcours_de_soins ps
       JOIN patients p ON ps.patient_id = p.id
       WHERE ps.medecin_id = ?
       ORDER BY ps.created_at DESC`,
      [medecinId]
    );
    return rows;
  }
};

module.exports = ParcoursDeSoins;
