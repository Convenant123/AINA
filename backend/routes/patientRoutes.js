const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { auth } = require('../middleware/authMiddleware');

router.get('/hospitals', auth, patientController.getNearbyHospitals);
router.get('/pharmacies', auth, patientController.getNearbyPharmacies);
router.post('/geolocalisation', auth, patientController.activerGeolocalisation);
router.post('/formulaire', auth, patientController.soumettreFormulaire);
router.post('/alert-doctors', auth, patientController.alertDoctors);
router.get('/profile', auth, patientController.getProfile);
router.get('/rendez-vous', auth, patientController.getMesRendezVous);
router.post('/rendez-vous', auth, patientController.prendreRendezVous);
router.get('/alertes', auth, patientController.getMesAlertes);
router.get('/paiements', auth, patientController.getMesPaiements);
router.post('/paiements', auth, patientController.effectuerPaiement);
router.get('/parcours', auth, patientController.consulterParcours);

module.exports = router;
