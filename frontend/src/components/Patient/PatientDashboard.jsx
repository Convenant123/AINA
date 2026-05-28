import React, { useState } from 'react';
import { patientApi } from '../../services/api';
import SOSButton from './SOSButton';
import PharmacyButton from './PharmacyButton';
import DoctorAlert from './DoctorAlert';

const styles = {
  container: { maxWidth: 900, margin: '0 auto', padding: 20 },
  header: { textAlign: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { color: '#666', marginTop: 8 },
  grid: { display: 'flex', flexDirection: 'column', gap: 20 },
  tabBar: { display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #dee2e6', flexWrap: 'wrap' },
  tab: { padding: '10px 18px', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: 14, fontWeight: 500, color: '#666', borderBottom: '3px solid transparent', marginBottom: -2 },
  tabActive: { padding: '10px 18px', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: 14, fontWeight: 600, color: '#0d6efd', borderBottom: '3px solid #0d6efd', marginBottom: -2 },
  card: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#333' },
  formInput: { width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 5, marginBottom: 10, boxSizing: 'border-box', fontSize: 14 },
  formSelect: { width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 5, marginBottom: 10, boxSizing: 'border-box', fontSize: 14, background: '#fff' },
  btn: { background: '#0d6efd', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnSuccess: { background: '#198754', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14, marginRight: 8 },
  btnDanger: { background: '#dc3545', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnWarning: { background: '#ffc107', color: '#333', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  listItem: { padding: 12, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 },
};

export default function PatientDashboard({ user }) {
  const [tab, setTab] = useState('services');
  const [showForm, setShowForm] = useState(false);
  const [showRdv, setShowRdv] = useState(false);
  const [showPaiement, setShowPaiement] = useState(false);
  const [formType, setFormType] = useState('demande_soins');
  const [rdvData, setRdvData] = useState({ medecin_id: '', date_heure: '', motif: '' });
  const [paiementData, setPaiementData] = useState({ montant: '', mode_paiement: 'carte' });
  const [rendezVous, setRendezVous] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [parcours, setParcours] = useState([]);

  const handleSoumettreFormulaire = async () => {
    try {
      const pos = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
          () => resolve({})
        );
      });
      await patientApi.soumettreFormulaire({ type: formType, ...pos });
      alert('Formulaire soumis avec succès');
      setShowForm(false);
    } catch (err) {
      alert('Erreur lors de la soumission');
    }
  };

  const handlePrendreRdv = async () => {
    try {
      const pos = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
          () => resolve({})
        );
      });
      await patientApi.prendreRendezVous({ ...rdvData, ...pos });
      alert('Demande de rendez-vous envoyée');
      setShowRdv(false);
    } catch (err) {
      alert('Erreur lors de la prise de rendez-vous');
    }
  };

  const handlePaiement = async () => {
    try {
      await patientApi.effectuerPaiement(paiementData);
      alert('Paiement effectué avec succès');
      setShowPaiement(false);
    } catch (err) {
      alert('Erreur de paiement');
    }
  };

  const loadRendezVous = async () => {
    try {
      const { data } = await patientApi.getRendezVous();
      setRendezVous(data);
    } catch {}
  };

  const loadPaiements = async () => {
    try {
      const { data } = await patientApi.getPaiements();
      setPaiements(data);
    } catch {}
  };

  const loadParcours = async () => {
    try {
      const { data } = await patientApi.getParcours();
      setParcours(data);
    } catch {}
  };

  React.useEffect(() => {
    if (tab === 'rendez-vous') loadRendezVous();
    if (tab === 'paiements') loadPaiements();
    if (tab === 'parcours') loadParcours();
  }, [tab]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}><i className="fas fa-hospital-user" style={{ marginRight: 12, color: '#667eea' }} />Espace Patient</h1>
        <p style={styles.subtitle}><i className="fas fa-user" style={{ marginRight: 6 }} />Bienvenue {user?.prenom || user?.nom}</p>
      </div>

      <div style={styles.tabBar}>
        <button style={tab === 'services' ? styles.tabActive : styles.tab} onClick={() => setTab('services')}>
          <i className="fas fa-concierge-bell" style={{ marginRight: 6 }} /> Services
        </button>
        <button style={tab === 'rendez-vous' ? styles.tabActive : styles.tab} onClick={() => setTab('rendez-vous')}>
          <i className="fas fa-calendar-alt" style={{ marginRight: 6 }} /> Rendez-vous
        </button>
        <button style={tab === 'paiements' ? styles.tabActive : styles.tab} onClick={() => setTab('paiements')}>
          <i className="fas fa-credit-card" style={{ marginRight: 6 }} /> Paiements
        </button>
        <button style={tab === 'parcours' ? styles.tabActive : styles.tab} onClick={() => setTab('parcours')}>
          <i className="fas fa-heartbeat" style={{ marginRight: 6 }} /> Mon parcours
        </button>
      </div>

      {tab === 'services' && (
        <div>
          <div style={styles.grid}>
            <SOSButton />
            <PharmacyButton />
            <DoctorAlert />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
              <i className="fas fa-file-alt" style={{ marginRight: 8 }} />
              {showForm ? 'Fermer' : 'Remplir un formulaire'}
            </button>
            <button style={styles.btnSuccess} onClick={() => setShowRdv(!showRdv)}>
              <i className="fas fa-calendar-plus" style={{ marginRight: 8 }} />
              {showRdv ? 'Fermer' : 'Prendre rendez-vous'}
            </button>
            <button style={styles.btnDanger} onClick={() => setShowPaiement(!showPaiement)}>
              <i className="fas fa-money-bill-wave" style={{ marginRight: 8 }} />
              {showPaiement ? 'Fermer' : 'Effectuer un paiement'}
            </button>
          </div>

          {showForm && (
            <div style={{ ...styles.card, marginTop: 20 }}>
              <h3 style={styles.cardTitle}><i className="fas fa-file-alt" style={{ marginRight: 8, color: '#0d6efd' }} />Soumettre un formulaire</h3>
              <select style={styles.formSelect} value={formType} onChange={e => setFormType(e.target.value)}>
                <option value="demande_soins">Demande de soins</option>
                <option value="consultation">Demande de consultation</option>
                <option value="urgence">Urgence</option>
              </select>
              <button style={styles.btn} onClick={handleSoumettreFormulaire}>
                <i className="fas fa-paper-plane" style={{ marginRight: 6 }} /> Soumettre
              </button>
            </div>
          )}

          {showRdv && (
            <div style={{ ...styles.card, marginTop: 20 }}>
              <h3 style={styles.cardTitle}><i className="fas fa-calendar-plus" style={{ marginRight: 8, color: '#198754' }} />Prendre un rendez-vous</h3>
              <input style={styles.formInput} placeholder="ID du médecin" value={rdvData.medecin_id} onChange={e => setRdvData({ ...rdvData, medecin_id: e.target.value })} />
              <input style={styles.formInput} placeholder="Date et heure" type="datetime-local" value={rdvData.date_heure} onChange={e => setRdvData({ ...rdvData, date_heure: e.target.value })} />
              <input style={styles.formInput} placeholder="Motif" value={rdvData.motif} onChange={e => setRdvData({ ...rdvData, motif: e.target.value })} />
              <button style={styles.btnSuccess} onClick={handlePrendreRdv}>
                <i className="fas fa-paper-plane" style={{ marginRight: 6 }} /> Envoyer la demande
              </button>
            </div>
          )}

          {showPaiement && (
            <div style={{ ...styles.card, marginTop: 20 }}>
              <h3 style={styles.cardTitle}><i className="fas fa-credit-card" style={{ marginRight: 8, color: '#dc3545' }} />Effectuer un paiement</h3>
              <input style={styles.formInput} placeholder="Montant" type="number" value={paiementData.montant} onChange={e => setPaiementData({ ...paiementData, montant: e.target.value })} />
              <select style={styles.formSelect} value={paiementData.mode_paiement} onChange={e => setPaiementData({ ...paiementData, mode_paiement: e.target.value })}>
                <option value="carte">Carte bancaire</option>
                <option value="mobile">Mobile money</option>
                <option value="especes">Espèces</option>
              </select>
              <button style={styles.btnDanger} onClick={handlePaiement}>
                <i className="fas fa-check-circle" style={{ marginRight: 6 }} /> Payer
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'rendez-vous' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}><i className="fas fa-calendar-alt" style={{ marginRight: 8, color: '#0d6efd' }} />Mes rendez-vous</h3>
          {rendezVous.length === 0 && <p style={{ color: '#999' }}>Aucun rendez-vous</p>}
          {rendezVous.map((rdv) => (
            <div key={rdv.id} style={styles.listItem}>
              <div>
                <strong>{rdv.medecin_prenom} {rdv.medecin_nom}</strong> - {rdv.specialite}
                <br /><span style={{ fontSize: 13, color: '#666' }}>{new Date(rdv.date_heure).toLocaleString('fr-FR')}</span>
                {rdv.motif && <><br /><span style={{ fontSize: 13, color: '#666' }}>Motif: {rdv.motif}</span></>}
              </div>
              <span style={{
                ...styles.badge,
                background: rdv.statut === 'confirme' ? '#d1e7dd' : rdv.statut === 'annule' ? '#f8d7da' : '#fff3cd',
                color: rdv.statut === 'confirme' ? '#0f5132' : rdv.statut === 'annule' ? '#842029' : '#664d03'
              }}>
                {rdv.statut === 'confirme' && <i className="fas fa-check-circle" style={{ marginRight: 4 }} />}
                {rdv.statut === 'annule' && <i className="fas fa-times-circle" style={{ marginRight: 4 }} />}
                {rdv.statut === 'en_attente' && <i className="fas fa-clock" style={{ marginRight: 4 }} />}
                {rdv.statut}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'paiements' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}><i className="fas fa-credit-card" style={{ marginRight: 8, color: '#198754' }} />Mes paiements</h3>
          {paiements.length === 0 && <p style={{ color: '#999' }}>Aucun paiement</p>}
          {paiements.map((p) => (
            <div key={p.id} style={styles.listItem}>
              <div>
                <strong>{p.montant} Ar</strong> - {p.mode_paiement}
                <br /><span style={{ fontSize: 13, color: '#666' }}>{new Date(p.date).toLocaleString('fr-FR')}</span>
              </div>
              <span style={{
                ...styles.badge,
                background: p.statut === 'valide' ? '#d1e7dd' : p.statut === 'echoue' ? '#f8d7da' : '#fff3cd',
                color: p.statut === 'valide' ? '#0f5132' : p.statut === 'echoue' ? '#842029' : '#664d03'
              }}>
                {p.statut === 'valide' ? <i className="fas fa-check-circle" style={{ marginRight: 4 }} /> : <i className="fas fa-times-circle" style={{ marginRight: 4 }} />}
                {p.statut}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'parcours' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}><i className="fas fa-heartbeat" style={{ marginRight: 8, color: '#dc3545' }} />Mon parcours de soins</h3>
          {parcours.length === 0 && <p style={{ color: '#999' }}>Aucun parcours de soins</p>}
          {parcours.map((p) => (
            <div key={p.id} style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <strong>{p.description || 'Parcours de soins'}</strong>
                <br /><span style={{ fontSize: 13, color: '#666' }}>
                  <i className="fas fa-user-md" style={{ marginRight: 4 }} />
                  Médecin: {p.medecin_prenom} {p.medecin_nom} ({p.specialite})
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#666' }}>
                <span><i className="fas fa-calendar-day" style={{ marginRight: 4 }} />Début: {new Date(p.date_debut).toLocaleDateString('fr-FR')}</span>
                {p.date_fin && <span><i className="fas fa-calendar-check" style={{ marginRight: 4 }} />Fin: {new Date(p.date_fin).toLocaleDateString('fr-FR')}</span>}
              </div>
              <span style={{
                ...styles.badge,
                background: p.statut === 'termine' ? '#d1e7dd' : p.statut === 'annule' ? '#f8d7da' : '#cfe2ff',
                color: p.statut === 'termine' ? '#0f5132' : p.statut === 'annule' ? '#842029' : '#084298'
              }}>
                {p.statut === 'en_cours' && <i className="fas fa-play" style={{ marginRight: 4 }} />}
                {p.statut === 'termine' && <i className="fas fa-check-double" style={{ marginRight: 4 }} />}
                {p.statut}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
