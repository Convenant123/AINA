const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { destinataire_id, contenu } = req.body;
    const { id: expediteur_id, role } = req.user;

    let message;
    if (role === 'patient') {
      message = await Message.create({ patient_id: expediteur_id, medecin_id: destinataire_id, contenu });
    } else {
      message = await Message.create({ patient_id: destinataire_id, medecin_id: expediteur_id, contenu });
    }

    const io = req.app.get('io');
    if (role === 'patient') {
      io.to(`medecin_${destinataire_id}`).emit('new_message', { expediteur_id, contenu, role: 'patient' });
    } else {
      io.to(`patient_${destinataire_id}`).emit('new_message', { expediteur_id, contenu, role: 'medecin' });
    }

    res.status(201).json({ id: message, message: 'Message envoyé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { id: currentUserId, role } = req.user;

    let messages;
    if (role === 'patient') {
      messages = await Message.getConversation(currentUserId, userId);
    } else {
      messages = await Message.getConversation(userId, currentUserId);
    }

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyMessages = async (req, res) => {
  try {
    const { id, role } = req.user;
    const messages = role === 'medecin'
      ? await Message.getMedecinMessages(id)
      : await Message.getPatientMessages(id);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
