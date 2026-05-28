const pool = require('../config/db');

const RendezVous = {
  async create({ patient_id, medecin_id, date_heure, motif }) {
    const [result] = await pool.execute(
      `INSERT INTO rendez_vous (patient_id, medecin_id, date_heure, motif)
       VALUES (?, ?, ?, ?)`,
      [patient_id, medecin_id, date_heure, motif || null]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT rv.*, p.nom AS patient_nom, p.prenom AS patient_prenom,
              m.nom AS medecin_nom, m.prenom AS medecin_prenom
       FROM rendez_vous rv
       JOIN patients p ON rv.patient_id = p.id
       JOIN medecins m ON rv.medecin_id = m.id
       WHERE rv.id = ?`,
      [id]
    );
    return rows[0];
  },

  async updateStatus(id, statut) {
    await pool.execute('UPDATE rendez_vous SET statut = ? WHERE id = ?', [statut, id]);
  },

  async getAllPending() {
    const [rows] = await pool.execute(
      `SELECT rv.*, p.nom AS patient_nom, p.prenom AS patient_prenom, p.telephone
       FROM rendez_vous rv
       JOIN patients p ON rv.patient_id = p.id
       WHERE rv.statut = 'en_attente'
       ORDER BY rv.date_heure ASC`
    );
    return rows;
  }
};

module.exports = RendezVous;
