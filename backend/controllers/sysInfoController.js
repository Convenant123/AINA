const db = require('../config/db');
const Paiement = require('../models/Paiement');
const ParcoursDeSoins = require('../models/ParcoursDeSoins');

exports.gererPaiement = async (req, res) => {
  try {
    const { paiement_id, statut } = req.body;
    await Paiement.updateStatus(paiement_id, statut || 'valide');
    const paiement = await Paiement.findById(paiement_id);
    res.json({ message: 'Paiement traité par Sys.Info', paiement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.afficherPharmacies = async (req, res) => {
  try {
    const [pharmacies] = await db.execute('SELECT * FROM pharmacies ORDER BY nom');
    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.informerParcours = async (req, res) => {
  try {
    const { parcours_id } = req.params;
    const parcours = await ParcoursDeSoins.findById(parcours_id);

    const [etapes] = await db.execute(
      'SELECT * FROM parcours_de_soins WHERE id = ?',
      [parcours_id]
    );

    res.json({ parcours, etapes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.genererRelevePDF = async (req, res) => {
  try {
    const { paiement_id } = req.params;
    const paiement = await Paiement.findById(paiement_id);
    if (!paiement) return res.status(404).json({ message: 'Paiement non trouvé' });

    const io = req.app.get('io');
    io.to(`patient_${paiement.patient_id}`).emit('releve_pdf', {
      paiement_id,
      message: 'Relevé PDF généré',
      date: new Date().toISOString()
    });

    res.json({ message: 'Relevé PDF généré et envoyé au patient', paiement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
