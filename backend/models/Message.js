const pool = require('../config/db');

const Message = {
  async create({ patient_id, medecin_id, contenu }) {
    const [result] = await pool.execute(
      `INSERT INTO messages (patient_id, medecin_id, contenu)
       VALUES (?, ?, ?)`,
      [patient_id || null, medecin_id || null, contenu]
    );
    return result.insertId;
  },

  async getConversation(patientId, medecinId) {
    const [rows] = await pool.execute(
      `SELECT msg.*, 
              p.nom AS patient_nom, p.prenom AS patient_prenom,
              m.nom AS medecin_nom, m.prenom AS medecin_prenom
       FROM messages msg
       LEFT JOIN patients p ON msg.patient_id = p.id
       LEFT JOIN medecins m ON msg.medecin_id = m.id
       WHERE (msg.patient_id = ? AND msg.medecin_id = ?)
          OR (msg.patient_id = ? AND msg.medecin_id = ?)
       ORDER BY msg.date_envoi ASC`,
      [patientId, medecinId, patientId, medecinId]
    );
    return rows;
  },

  async getPatientMessages(patientId) {
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

  async getMedecinMessages(medecinId) {
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

  async markAsRead(messageId) {
    await pool.execute("UPDATE messages SET statut = 'lu' WHERE id = ?", [messageId]);
  }
};

module.exports = Message;
