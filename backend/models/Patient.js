const pool = require('../config/db');

const Patient = {
  async create({ nom, prenom, telephone, email, mot_de_passe }) {
    const [result] = await pool.execute(
      `INSERT INTO patients (nom, prenom, telephone, email, mot_de_passe)
       VALUES (?, ?, ?, ?, ?)`,
      [nom, prenom, telephone, email, mot_de_passe]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM patients WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.id, p.nom, p.prenom, p.telephone, p.email, p.geolocalisation_id,
              g.latitude, g.longitude, g.activee
       FROM patients p
       LEFT JOIN geolocalisation g ON p.geolocalisation_id = g.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  async updateGeolocalisation(id, geoId) {
    await pool.execute('UPDATE patients SET geolocalisation_id = ? WHERE id = ?', [geoId, id]);
  },

  async getRendezVous(patientId) {
    const [rows] = await pool.execute(
      `SELECT rv.*, m.nom AS medecin_nom, m.prenom AS medecin_prenom, m.specialite
       FROM rendez_vous rv
       JOIN medecins m ON rv.medecin_id = m.id
       WHERE rv.patient_id = ?
       ORDER BY rv.date_heure DESC`,
      [patientId]
    );
    return rows;
  },

  async getAlertes(patientId) {
    const [rows] = await pool.execute(
      `SELECT a.*, m.nom AS medecin_nom, m.prenom AS medecin_prenom
       FROM alertes a
       LEFT JOIN medecins m ON a.medecin_id = m.id
       WHERE a.patient_id = ?
       ORDER BY a.date DESC`,
      [patientId]
    );
    return rows;
  },

  async getMessages(patientId) {
    const [rows] = await pool.execute(
      `SELECT msg.*, m.nom AS medecin_nom, m.prenom AS medecin_prenom
       FROM messages msg
       LEFT JOIN medecins m ON msg.medecin_id = m.id
       WHERE msg.patient_id = ?
       ORDER BY msg.date_envoi DESC`,
      [patientId]
    );
    return rows;
  },

  async getPaiements(patientId) {
    const [rows] = await pool.execute(
      `SELECT p.*, m.nom AS medecin_nom, m.prenom AS medecin_prenom
       FROM paiements p
       LEFT JOIN medecins m ON p.medecin_id = m.id
       WHERE p.patient_id = ?
       ORDER BY p.date DESC`,
      [patientId]
    );
    return rows;
  },

  async getParcours(patientId) {
    const [rows] = await pool.execute(
      `SELECT ps.*, m.nom AS medecin_nom, m.prenom AS medecin_prenom, m.specialite
       FROM parcours_de_soins ps
       JOIN medecins m ON ps.medecin_id = m.id
       WHERE ps.patient_id = ?
       ORDER BY ps.created_at DESC`,
      [patientId]
    );
    return rows;
  }
};

module.exports = Patient;
