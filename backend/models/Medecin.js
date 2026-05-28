const pool = require('../config/db');

const Medecin = {
  async create({ nom, prenom, specialite, carte_professionnelle, email, mot_de_passe }) {
    const [result] = await pool.execute(
      `INSERT INTO medecins (nom, prenom, specialite, carte_professionnelle, email, mot_de_passe)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, prenom, specialite, carte_professionnelle, email, mot_de_passe]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM medecins WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, nom, prenom, specialite, carte_professionnelle, email
       FROM medecins WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  async findNearby(lat, lng, radiusKm = 50) {
    const [rows] = await pool.execute(
      `SELECT m.id, m.nom, m.prenom, m.specialite, m.email,
        (6371 * ACOS(COS(RADIANS(?)) * COS(RADIANS(h.latitude)) * COS(RADIANS(h.longitude) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(h.latitude)))) AS distance
       FROM medecins m
       JOIN hopital_medecin hm ON m.id = hm.medecin_id
       JOIN hopitaux h ON hm.hopital_id = h.id
       HAVING distance <= ?
       ORDER BY distance`,
      [lat, lng, lat, radiusKm]
    );
    return rows;
  },

  async getRendezVous(medecinId) {
    const [rows] = await pool.execute(
      `SELECT rv.*, p.nom AS patient_nom, p.prenom AS patient_prenom, p.telephone
       FROM rendez_vous rv
       JOIN patients p ON rv.patient_id = p.id
       WHERE rv.medecin_id = ?
       ORDER BY rv.date_heure DESC`,
      [medecinId]
    );
    return rows;
  },

  async getAlertes(medecinId) {
    const [rows] = await pool.execute(
      `SELECT a.*, p.nom AS patient_nom, p.prenom AS patient_prenom, p.telephone
       FROM alertes a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.medecin_id = ?
       ORDER BY a.date DESC`,
      [medecinId]
    );
    return rows;
  },

  async getPatients(medecinId) {
    const [rows] = await pool.execute(
      `SELECT DISTINCT p.id, p.nom, p.prenom, p.telephone, p.email
       FROM patients p
       JOIN rendez_vous rv ON p.id = rv.patient_id
       WHERE rv.medecin_id = ?`,
      [medecinId]
    );
    return rows;
  },

  async getMessages(medecinId) {
    const [rows] = await pool.execute(
      `SELECT msg.*, p.nom AS patient_nom, p.prenom AS patient_prenom
       FROM messages msg
       LEFT JOIN patients p ON msg.patient_id = p.id
       WHERE msg.medecin_id = ?
       ORDER BY msg.date_envoi DESC`,
      [medecinId]
    );
    return rows;
  },

  async getHopitaux(medecinId) {
    const [rows] = await pool.execute(
      `SELECT h.* FROM hopitaux h
       JOIN hopital_medecin hm ON h.id = hm.hopital_id
       WHERE hm.medecin_id = ?`,
      [medecinId]
    );
    return rows;
  },

  async getPharmacies(medecinId) {
    const [rows] = await pool.execute(
      `SELECT ph.* FROM pharmacies ph
       JOIN pharmacie_medecin pm ON ph.id = pm.pharmacie_id
       WHERE pm.medecin_id = ?`,
      [medecinId]
    );
    return rows;
  }
};

module.exports = Medecin;
