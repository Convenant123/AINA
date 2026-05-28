import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  registerPatient: (data) => api.post('/auth/register/patient', data),
  registerMedecin: (data) => api.post('/auth/register/medecin', data),
  loginPatient: (data) => api.post('/auth/login/patient', data),
  loginMedecin: (data) => api.post('/auth/login/medecin', data),
  profile: () => api.get('/auth/profile'),
};

export const patientApi = {
  getHospitals: (params) => api.get('/patient/hospitals', { params }),
  getPharmacies: (params) => api.get('/patient/pharmacies', { params }),
  activerGeolocalisation: (data) => api.post('/patient/geolocalisation', data),
  soumettreFormulaire: (data) => api.post('/patient/formulaire', data),
  alertDoctors: (data) => api.post('/patient/alert-doctors', data),
  getProfile: () => api.get('/patient/profile'),
  getRendezVous: () => api.get('/patient/rendez-vous'),
  prendreRendezVous: (data) => api.post('/patient/rendez-vous', data),
  getAlertes: () => api.get('/patient/alertes'),
  getPaiements: () => api.get('/patient/paiements'),
  effectuerPaiement: (data) => api.post('/patient/paiements', data),
  getParcours: () => api.get('/patient/parcours'),
};

export const medecinApi = {
  getVillages: () => api.get('/medecin/villages'),
  optimizeRoute: (data) => api.post('/medecin/optimize-route', data),
  getAlerts: () => api.get('/medecin/alerts'),
  getAlertsPending: () => api.get('/medecin/alerts/pending'),
  respondAlert: (data) => api.put('/medecin/alerts/respond', data),
  getPatients: () => api.get('/medecin/patients'),
  getPatientsAccepted: () => api.get('/medecin/patients/accepted'),
  getRendezVous: () => api.get('/medecin/rendez-vous'),
  getDemandesRendezVous: () => api.get('/medecin/rendez-vous/demandes'),
  repondreRendezVous: (data) => api.put('/medecin/rendez-vous/repondre', data),
  planifierParcours: (data) => api.post('/medecin/parcours', data),
  getParcours: () => api.get('/medecin/parcours'),
  suivrePatient: (patientId) => api.get(`/medecin/patients/${patientId}/suivi`),
  getPharmacies: () => api.get('/medecin/pharmacies'),
  getPaiements: () => api.get('/medecin/paiements'),
  parametrerPaiement: (data) => api.put('/medecin/paiements/parametrer', data),
  getProfile: () => api.get('/medecin/profile'),
};

export const messageApi = {
  send: (data) => api.post('/messages/send', data),
  conversation: (userId) => api.get(`/messages/conversation/${userId}`),
  mine: () => api.get('/messages/mine'),
};

export const sysInfoApi = {
  traiterPaiement: (paiementId, data) => api.put(`/sysinfo/paiements/${paiementId}/traiter`, data),
  getPharmacies: () => api.get('/sysinfo/pharmacies'),
  getParcours: (parcoursId) => api.get(`/sysinfo/parcours/${parcoursId}`),
  genererReleve: (paiementId) => api.get(`/sysinfo/paiements/${paiementId}/releve`),
};

export default api;
