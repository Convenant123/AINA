const Hospital = require('../models/Hospital');
const Pharmacy = require('../models/Pharmacy');
const Patient = require('../models/Patient');
const Geolocalisation = require('../models/Geolocalisation');
const Formulaire = require('../models/Formulaire');
const Alerte = require('../models/Alerte');
const RendezVous = require('../models/RendezVous');
const Paiement = require('../models/Paiement');

exports.getNearbyHospitals = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const hospitals = await Hospital.findNearby(latitude, longitude);
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNearbyPharmacies = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const pharmacies = await Pharmacy.findNearby(latitude, longitude);
    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.activerGeolocalisation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const geoId = await Geolocalisation.create(latitude, longitude);
    await Patient.updateGeolocalisation(req.user.id, geoId);
    res.json({ geolocalisation_id: geoId, message: 'Géolocalisation activée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.soumettreFormulaire = async (req, res) => {
  try {
    const { type, latitude, longitude } = req.body;
    let geoId = null;
    if (latitude && longitude) {
      geoId = await Geolocalisation.create(latitude, longitude);
    }
    const id = await Formulaire.create({ patient_id: req.user.id, type, geolocalisation_id: geoId });
    res.status(201).json({ id, message: 'Formulaire soumis' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.alertDoctors = async (req, res) => {
  try {
    const { type, latitude, longitude } = req.body;
    const alertId = await Alerte.create({ patient_id: req.user.id, type, latitude, longitude });

    const Medecin = require('../models/Medecin');
    const doctors = await Medecin.findNearby(latitude, longitude);

    const io = req.app.get('io');
    for (const doc of doctors) {
      await Alerte.assignDoctor(alertId, doc.id);
      io.to(`medecin_${doc.id}`).emit('new_alert', { alert_id: alertId, patient_id: req.user.id, type });
    }

    res.json({ message: `${doctors.length} médecin(s) alerté(s)`, alert_id: alertId, doctors: doctors.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await Patient.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMesRendezVous = async (req, res) => {
  try {
    const rendezVous = await Patient.getRendezVous(req.user.id);
    res.json(rendezVous);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.prendreRendezVous = async (req, res) => {
  try {
    const { medecin_id, date_heure, motif } = req.body;
    const { latitude, longitude } = req.body;

    if (latitude && longitude) {
      const geoId = await Geolocalisation.create(latitude, longitude);
      await Patient.updateGeolocalisation(req.user.id, geoId);
    }

    const id = await RendezVous.create({ patient_id: req.user.id, medecin_id, date_heure, motif });
    const io = req.app.get('io');
    io.to(`medecin_${medecin_id}`).emit('new_rendez_vous', { id, patient_id: req.user.id });

    res.status(201).json({ id, message: 'Demande de rendez-vous envoyée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMesAlertes = async (req, res) => {
  try {
    const alertes = await Patient.getAlertes(req.user.id);
    res.json(alertes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMesPaiements = async (req, res) => {
  try {
    const paiements = await Patient.getPaiements(req.user.id);
    res.json(paiements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.effectuerPaiement = async (req, res) => {
  try {
    const { medecin_id, montant, mode_paiement } = req.body;
    const id = await Paiement.create({ patient_id: req.user.id, medecin_id, montant, mode_paiement });
    await Paiement.updateStatus(id, 'valide');

    const io = req.app.get('io');
    const PaiementModel = require('../models/Paiement');
    const paiement = await PaiementModel.findById(id);

    if (medecin_id) {
      io.to(`medecin_${medecin_id}`).emit('paiement_recu', paiement);
    }

    res.status(201).json({ id, message: 'Paiement effectué avec succès', paiement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.consulterParcours = async (req, res) => {
  try {
    const parcours = await Patient.getParcours(req.user.id);
    res.json(parcours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
