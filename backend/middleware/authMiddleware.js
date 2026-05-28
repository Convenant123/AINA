const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Accès refusé' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

const medecinAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'medecin') return res.status(403).json({ message: 'Accès réservé aux médecins' });
    next();
  });
};

module.exports = { auth, medecinAuth };
