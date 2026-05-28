const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecinController');
const { auth, medecinAuth } = require('../middleware/authMiddleware');

router.get('/villages', auth, medecinController.getVillages);
router.post('/optimize-route', auth, medecinAuth, medecinController.optimizeRoute);
router.get('/alerts', auth, medecinAuth, medecinController.getAlertes);
router.get('/alerts/pending', auth, medecinAuth, medecinController.getAlertesEnAttente);
router.put('/alerts/respond', auth, medecinAuth, medecinController.respondAlert);
router.get('/patients', auth, medecinAuth, medecinController.getPatients);
router.get('/patients/accepted', auth, medecinAuth, medecinController.getPatientsAccepted);
router.get('/rendez-vous', auth, medecinAuth, medecinController.getRendezVous);
router.get('/rendez-vous/demandes', auth, medecinAuth, medecinController.getDemandesEnAttente);
router.put('/rendez-vous/repondre', auth, medecinAuth, medecinController.repondreRendezVous);
router.post('/parcours', auth, medecinAuth, medecinController.planifierParcours);
router.get('/parcours', auth, medecinAuth, medecinController.getParcours);
router.get('/patients/:patient_id/suivi', auth, medecinAuth, medecinController.suivrePatient);
router.get('/pharmacies', auth, medecinAuth, medecinController.afficherPharmacies);
router.get('/paiements', auth, medecinAuth, medecinController.getPaiements);
router.put('/paiements/parametrer', auth, medecinAuth, medecinController.parametrerPaiement);
router.get('/profile', auth, medecinAuth, medecinController.getProfile);

module.exports = router;
