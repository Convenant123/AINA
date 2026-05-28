const express = require('express');
const router = express.Router();
const sysInfoController = require('../controllers/sysInfoController');
const { auth } = require('../middleware/authMiddleware');

router.put('/paiements/:paiement_id/traiter', auth, sysInfoController.gererPaiement);
router.get('/pharmacies', auth, sysInfoController.afficherPharmacies);
router.get('/parcours/:parcours_id', auth, sysInfoController.informerParcours);
router.get('/paiements/:paiement_id/releve', auth, sysInfoController.genererRelevePDF);

module.exports = router;
