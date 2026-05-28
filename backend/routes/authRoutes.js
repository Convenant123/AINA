const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

router.post('/register/patient', authController.registerPatient);
router.post('/register/medecin', authController.registerMedecin);
router.post('/login/patient', authController.loginPatient);
router.post('/login/medecin', authController.loginMedecin);
router.get('/profile', auth, authController.getProfile);

module.exports = router;
