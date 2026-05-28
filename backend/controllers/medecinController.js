const Medecin = require('../models/Medecin');
const Village = require('../models/Village');
const ParcoursDeSoins = require('../models/ParcoursDeSoins');
const RendezVous = require('../models/RendezVous');
const Alerte = require('../models/Alerte');
const Paiement = require('../models/Paiement');

exports.getVillages = async (req, res) => {
  try {
    const villages = await Village.getAll();
    res.json(villages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.optimizeRoute = async (req, res) => {
  try {
    const { start_lat, start_lng, village_ids } = req.body;
    if (!village_ids || village_ids.length === 0) {
      return res.status(400).json({ message: 'Aucun village sélectionné' });
    }

    const villages = [];
    for (const id of village_ids) {
      const v = await Village.getById(id);
      if (v) villages.push(v);
    }

    const points = [{ nom: 'Départ', latitude: start_lat, longitude: start_lng }, ...villages];

    const visited = new Set([0]);
    const route = [0];
    let current = 0;

    while (route.length < points.length) {
      let nearest = -1;
      let minDist = Infinity;
      for (let i = 1; i < points.length; i++) {
        if (visited.has(i)) continue;
        const d = haversine(points[current].latitude, points[current].longitude, points[i].latitude, points[i].longitude);
        if (d < minDist) {
          minDist = d;
          nearest = i;
        }
      }
      visited.add(nearest);
      route.push(nearest);
      current = nearest;
    }

    const ordered = route.map(i => points[i]);
    let totalDistance = 0;
    for (let i = 0; i < ordered.length - 1; i++) {
      totalDistance += haversine(ordered[i].latitude, ordered[i].longitude, ordered[i + 1].latitude, ordered[i + 1].longitude);
    }

    res.json({ route: ordered, total_distance_km: Math.round(totalDistance * 100) / 100 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAlertes = async (req, res) => {
  try {
    const alertes = await Medecin.getAlertes(req.user.id);
    res.json(alertes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAlertesEnAttente = async (req, res) => {
  try {
    const alertes = await Alerte.getPending();
    res.json(alertes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.respondAlert = async (req, res) => {
  try {
    const { alertId, statut } = req.body;
    await Alerte.updateStatus(alertId, statut);
    res.json({ message: `Alerte ${statut === 'accepted' ? 'acceptée' : 'refusée'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const patients = await Medecin.getPatients(req.user.id);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRendezVous = async (req, res) => {
  try {
    const rendezVous = await Medecin.getRendezVous(req.user.id);
    res.json(rendezVous);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDemandesEnAttente = async (req, res) => {
  try {
    const demandes = await RendezVous.getAllPending();
    const filtered = demandes.filter(rv => rv.medecin_id === req.user.id);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.repondreRendezVous = async (req, res) => {
  try {
    const { rendezVousId, statut } = req.body;
    await RendezVous.updateStatus(rendezVousId, statut);
    const rdv = await RendezVous.findById(rendezVousId);

    const io = req.app.get('io');
    io.to(`patient_${rdv.patient_id}`).emit('rendez_vous_reponse', { rendez_vous_id: rendezVousId, statut });

    res.json({ message: `Rendez-vous ${statut === 'confirme' ? 'confirmé' : 'refusé'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.planifierParcours = async (req, res) => {
  try {
    const { patient_id, description, date_debut, date_fin } = req.body;
    const id = await ParcoursDeSoins.create({
      patient_id, medecin_id: req.user.id, description, date_debut, date_fin
    });

    const io = req.app.get('io');
    io.to(`patient_${patient_id}`).emit('nouveau_parcours', { id });

    res.status(201).json({ id, message: 'Parcours de soins planifié' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getParcours = async (req, res) => {
  try {
    const parcours = await ParcoursDeSoins.getForMedecin(req.user.id);
    res.json(parcours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.suivrePatient = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const Patient = require('../models/Patient');
    const patient = await Patient.findById(patient_id);
    const parcours = await Patient.getParcours(patient_id);
    const messages = await Patient.getMessages(patient_id);
    const rendezVous = await Patient.getRendezVous(patient_id);

    res.json({ patient, parcours, messages, rendezVous });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.afficherPharmacies = async (req, res) => {
  try {
    const pharmacies = await Medecin.getPharmacies(req.user.id);
    res.json(pharmacies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPaiements = async (req, res) => {
  try {
    const db = require('../config/db');
    const [rows] = await db.execute(
      `SELECT pa.*, p.nom AS patient_nom, p.prenom AS patient_prenom
       FROM paiements pa
       JOIN patients p ON pa.patient_id = p.id
       WHERE pa.medecin_id = ?
       ORDER BY pa.date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.parametrerPaiement = async (req, res) => {
  try {
    const { paiement_id, mode_paiement } = req.body;
    const PaiementModel = require('../models/Paiement');
    await PaiementModel.updateModePaiement(paiement_id, mode_paiement);
    res.json({ message: 'Mode de paiement paramétré' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPatientsAccepted = async (req, res) => {
  try {
    const db = require('../config/db');
    const [rows] = await db.execute(
      `SELECT DISTINCT a.patient_id, p.nom, p.prenom, p.telephone,
              a.latitude, a.longitude, a.type, a.date AS alerte_date
       FROM alertes a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.medecin_id = ? AND a.statut = 'accepted'
       ORDER BY a.date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const medecin = await Medecin.findById(req.user.id);
    const hopitaux = await Medecin.getHopitaux(req.user.id);
    res.json({ ...medecin, hopitaux });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Algorithme Haversine
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}
// fin
