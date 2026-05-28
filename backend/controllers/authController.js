const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Medecin = require('../models/Medecin');
require('dotenv').config();

const signToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.registerPatient = async (req, res) => {
  try {
    const { nom, prenom, telephone, email, mot_de_passe } = req.body;
    const existing = await Patient.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

    const hashed = await bcrypt.hash(mot_de_passe, 10);
    const id = await Patient.create({ nom, prenom, telephone, email, mot_de_passe: hashed });

    const token = signToken(id, 'patient');
    res.status(201).json({ token, user: { id, nom, prenom, telephone, email, role: 'patient' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerMedecin = async (req, res) => {
  try {
    const { nom, prenom, specialite, carte_professionnelle, email, mot_de_passe } = req.body;
    const existing = await Medecin.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

    const hashed = await bcrypt.hash(mot_de_passe, 10);
    const id = await Medecin.create({ nom, prenom, specialite, carte_professionnelle, email, mot_de_passe: hashed });

    const token = signToken(id, 'medecin');
    res.status(201).json({ token, user: { id, nom, prenom, specialite, email, role: 'medecin' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginPatient = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const user = await Patient.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

    const token = signToken(user.id, 'patient');
    res.json({ token, user: { id: user.id, nom: user.nom, prenom: user.prenom, telephone: user.telephone, email: user.email, role: 'patient' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginMedecin = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const user = await Medecin.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

    const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!match) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

    const token = signToken(user.id, 'medecin');
    res.json({ token, user: { id: user.id, nom: user.nom, prenom: user.prenom, specialite: user.specialite, email: user.email, role: 'medecin' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { role } = req.user;
    let user;
    if (role === 'patient') user = await Patient.findById(req.user.id);
    else user = await Medecin.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
