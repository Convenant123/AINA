const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/authMiddleware');

router.post('/send', auth, messageController.sendMessage);
router.get('/conversation/:userId', auth, messageController.getConversation);
router.get('/mine', auth, messageController.getMyMessages);

module.exports = router;
