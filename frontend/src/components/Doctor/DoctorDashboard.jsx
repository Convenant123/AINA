import React, { useState, useEffect, useCallback } from 'react';
import { medecinApi } from '../../services/api';
import VillageSelector from './VillageSelector';
import RouteOptimizer from './RouteOptimizer';
import PatientFollowUp from './PatientFollowUp';

const styles = {
  tabBar: { display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #dee2e6', flexWrap: 'wrap' },
  tab: { padding: '10px 18px', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: 14, fontWeight: 500, color: '#666', borderBottom: '3px solid transparent', marginBottom: -2 },
  tabActive: { padding: '10px 18px', cursor: 'pointer', border: 'none', background: 'transparent', fontSize: 14, fontWeight: 600, color: '#0d6efd', borderBottom: '3px solid #0d6efd', marginBottom: -2 },
  card: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#333' },
  formInput: { padding: 8, border: '1px solid #ddd', borderRadius: 5, width: '100%', boxSizing: 'border-box', marginBottom: 10 },
  formTextarea: { padding: 8, border: '1px solid #ddd', borderRadius: 5, width: '100%', boxSizing: 'border-box', marginBottom: 10, minHeight: 60, resize: 'vertical' },
  btn: { background: '#0d6efd', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnSuccess: { background: '#198754', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  btnDanger: { background: '#dc3545', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnWarning: { background: '#ffc107', color: '#333', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  listItem: { padding: 12, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  infoBox: { background: '#e7f3ff', padding: '10px 16px', borderRadius: 8, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
};

export default function DoctorDashboard({ user }) {
  const [tab, setTab] = useState('carte');
  const [villages, setVillages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [route, setRoute] = useState(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState([-18.8792, 47.5079]);
  const [demandes, setDemandes] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [acceptedPatients, setAcceptedPatients] = useState([]);
  const [showParcours, setShowParcours] = useState(false);
  const [parcoursData, setParcoursData] = useState({ patient_id: '', description: '', date_debut: '', date_fin: '' });
  const [rendezVous, setRendezVous] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [showParamPaiement, setShowParamPaiement] = useState(false);
  const [paiementParam, setPaiementParam] = useState({ paiement_id: '', mode_paiement: 'carte' });

  useEffect(() => {
    medecinApi.getVillages().then(({ data }) => setVillages(data)).catch(() => {});
    loadAcceptedPatients();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  const loadAcceptedPatients = async () => {
    try {
      const { data } = await medecinApi.getPatientsAccepted();
      setAcceptedPatients(data);
    } catch {}
  };

  const toggleVillage = useCallback((id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const handleOptimize = async () => {
    if (selectedIds.length === 0 && acceptedPatients.length === 0) {
      return alert('Sélectionnez au moins un village ou ayez des alertes acceptées');
    }
    setLoading(true);
    try {
      const { data } = await medecinApi.optimizeRoute({
        start_lat: center[0],
        start_lng: center[1],
        village_ids: selectedIds,
      });
      setRoute(data.route);
      setTotalDistance(data.total_distance_km);
    } catch (err) {
      alert("Erreur d'optimisation");
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setRoute(null);
    setTotalDistance(0);
  };

  const loadDemandes = async () => {
    try {
      const { data } = await medecinApi.getDemandesRendezVous();
      setDemandes(data);
    } catch {}
  };

  const loadRendezVous = async () => {
    try {
      const { data } = await medecinApi.getRendezVous();
      setRendezVous(data);
    } catch {}
  };

  const loadAlertes = async () => {
    try {
      const { data } = await medecinApi.getAlerts();
      setAlertes(data);
    } catch {}
  };

  const loadPaiements = async () => {
    try {
      const { data } = await medecinApi.getPaiements();
      setPaiements(data);
    } catch {}
  };

  const handleRepondreRdv = async (rendezVousId, statut) => {
    try {
      await medecinApi.repondreRendezVous({ rendezVousId, statut });
      alert(`Rendez-vous ${statut === 'confirme' ? 'confirmé' : 'refusé'}`);
      loadDemandes();
      loadRendezVous();
    } catch (err) {
      alert('Erreur');
    }
  };

  const handleRepondreAlerte = async (alertId, statut) => {
    try {
      await medecinApi.respondAlert({ alertId, statut });
      loadAlertes();
      if (statut === 'accepted') loadAcceptedPatients();
    } catch {}
  };

  const handlePlanifierParcours = async () => {
    try {
      await medecinApi.planifierParcours(parcoursData);
      alert('Parcours de soins planifié');
      setShowParcours(false);
      setParcoursData({ patient_id: '', description: '', date_debut: '', date_fin: '' });
    } catch {
      alert('Erreur');
    }
  };

  const handleParamPaiement = async () => {
    try {
      await medecinApi.parametrerPaiement(paiementParam);
      alert('Mode de paiement paramétré');
      setShowParamPaiement(false);
      loadPaiements();
    } catch {
      alert('Erreur');
    }
  };

  const handleSuivrePatient = async (patientId) => {
    try {
      const { data } = await medecinApi.suivrePatient(patientId);
      alert(`Patient: ${data.patient.prenom} ${data.patient.nom}\nParcours: ${data.parcours.length}\nMessages: ${data.messages.length}\nRendez-vous: ${data.rendezVous.length}`);
    } catch {}
  };

  useEffect(() => {
    if (tab === 'patients') { loadDemandes(); loadAlertes(); }
    if (tab === 'rendez-vous') loadRendezVous();
    if (tab === 'paiements') loadPaiements();
  }, [tab]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <div style={styles.tabBar}>
        <button style={tab === 'carte' ? styles.tabActive : styles.tab} onClick={() => setTab('carte')}>
          <i className="fas fa-map-marked-alt" style={{ marginRight: 6 }} /> Carte & Itinéraire
        </button>
        <button style={tab === 'patients' ? styles.tabActive : styles.tab} onClick={() => setTab('patients')}>
          <i className="fas fa-users" style={{ marginRight: 6 }} /> Patients & Alertes
        </button>
        <button style={tab === 'rendez-vous' ? styles.tabActive : styles.tab} onClick={() => setTab('rendez-vous')}>
          <i className="fas fa-calendar-check" style={{ marginRight: 6 }} /> Rendez-vous
        </button>
        <button style={tab === 'paiements' ? styles.tabActive : styles.tab} onClick={() => setTab('paiements')}>
          <i className="fas fa-credit-card" style={{ marginRight: 6 }} /> Paiements
        </button>
      </div>

      {tab === 'carte' && (
        <div>
          {acceptedPatients.length > 0 && (
            <div style={{ ...styles.card, marginBottom: 16, borderLeft: '4px solid #ffc107' }}>
              <h3 style={styles.cardTitle}>
                <i className="fas fa-ambulance" style={{ marginRight: 8, color: '#ffc107' }} />
                Patients avec alertes acceptées ({acceptedPatients.length})
              </h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                Ces patients seront inclus automatiquement dans l'itinéraire de visite
              </p>
              {acceptedPatients.map((p) => (
                <div key={p.patient_id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <i className="fas fa-user-injured" style={{ marginRight: 6, color: '#dc3545' }} />
                    {p.prenom} {p.nom}
                  </span>
                  <span style={{ color: '#666', fontSize: 12 }}>
                    <i className="fas fa-map-pin" style={{ marginRight: 4 }} />
                    {parseFloat(p.latitude).toFixed(4)}, {parseFloat(p.longitude).toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={styles.grid2}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <i className="fas fa-map-marker-alt" style={{ marginRight: 8, color: '#0d6efd' }} />
                Sélection des villages
              </h3>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 10 }}>
                <i className="fas fa-info-circle" style={{ marginRight: 4 }} />
                Cliquez sur les villages sur la carte pour les sélectionner
              </p>
              <VillageSelector
                villages={villages}
                selectedIds={selectedIds}
                onToggle={toggleVillage}
                center={center}
                acceptedPatients={acceptedPatients}
              />
              <div style={styles.infoBox}>
                <span>
                  <i className="fas fa-check-circle" style={{ marginRight: 6, color: '#0d6efd' }} />
                  {selectedIds.length} village(s) sélectionné(s)
                  {acceptedPatients.length > 0 && (
                    <span style={{ marginLeft: 8, color: '#ffc107' }}>
                      + {acceptedPatients.length} patient(s) avec alerte
                    </span>
                  )}
                </span>
                {selectedIds.length > 0 && (
                  <button style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }} onClick={clearSelection}>
                    <i className="fas fa-times" style={{ marginRight: 4 }} /> Effacer
                  </button>
                )}
              </div>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <i className="fas fa-route" style={{ marginRight: 8, color: '#198754' }} />
                Itinéraire optimisé
              </h3>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 10 }}>
                <i className="fas fa-sync-alt" style={{ marginRight: 4 }} />
                La position de départ est détectée automatiquement
              </p>
              <button style={styles.btn} onClick={handleOptimize} disabled={loading}>
                {loading ? (
                  <><i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }} /> Optimisation...</>
                ) : (
                  <><i className="fas fa-route" style={{ marginRight: 6 }} /> Optimiser le trajet</>
                )}
              </button>
              <div style={{ marginTop: 16 }}>
                <RouteOptimizer route={route} totalDistance={totalDistance} acceptedPatients={acceptedPatients} />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'patients' && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <button style={styles.btnSuccess} onClick={() => setShowParcours(!showParcours)}>
              {showParcours ? (
                <><i className="fas fa-times" style={{ marginRight: 6 }} /> Fermer</>
              ) : (
                <><i className="fas fa-plus-circle" style={{ marginRight: 6 }} /> Planifier un parcours de soins</>
              )}
            </button>
          </div>

          {showParcours && (
            <div style={{ ...styles.card, marginBottom: 20 }}>
              <h3 style={styles.cardTitle}>
                <i className="fas fa-clipboard-list" style={{ marginRight: 8, color: '#198754' }} />
                Planifier un parcours de soins
              </h3>
              <input style={styles.formInput} placeholder="ID du patient" value={parcoursData.patient_id} onChange={e => setParcoursData({ ...parcoursData, patient_id: e.target.value })} />
              <textarea style={styles.formTextarea} placeholder="Description du parcours" value={parcoursData.description} onChange={e => setParcoursData({ ...parcoursData, description: e.target.value })} />
              <input style={styles.formInput} placeholder="Date de début" type="date" value={parcoursData.date_debut} onChange={e => setParcoursData({ ...parcoursData, date_debut: e.target.value })} />
              <input style={styles.formInput} placeholder="Date de fin (optionnelle)" type="date" value={parcoursData.date_fin} onChange={e => setParcoursData({ ...parcoursData, date_fin: e.target.value })} />
              <button style={styles.btnSuccess} onClick={handlePlanifierParcours}>
                <i className="fas fa-save" style={{ marginRight: 6 }} /> Planifier
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <i className="fas fa-calendar-alt" style={{ marginRight: 8, color: '#0d6efd' }} />
                Demandes de rendez-vous
              </h3>
              <button style={{ ...styles.btn, marginBottom: 10 }} onClick={loadDemandes}>
                <i className="fas fa-sync-alt" style={{ marginRight: 6 }} /> Actualiser
              </button>
              {demandes.length === 0 && <p style={{ color: '#999' }}>Aucune demande</p>}
              {demandes.map((d) => (
                <div key={d.id} style={styles.listItem}>
                  <div>
                    <strong>{d.patient_prenom} {d.patient_nom}</strong>
                    <br /><span style={{ fontSize: 12, color: '#666' }}>{new Date(d.date_heure).toLocaleString('fr-FR')}</span>
                    {d.motif && <><br /><span style={{ fontSize: 12, color: '#666' }}>{d.motif}</span></>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: '#198754', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }} onClick={() => handleRepondreRdv(d.id, 'confirme')}>
                      <i className="fas fa-check" /> Accepter
                    </button>
                    <button style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }} onClick={() => handleRepondreRdv(d.id, 'annule')}>
                      <i className="fas fa-times" /> Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <i className="fas fa-bell" style={{ marginRight: 8, color: '#ffc107' }} />
                Alertes
              </h3>
              <button style={{ ...styles.btn, marginBottom: 10 }} onClick={loadAlertes}>
                <i className="fas fa-sync-alt" style={{ marginRight: 6 }} /> Actualiser
              </button>
              {alertes.length === 0 && <p style={{ color: '#999' }}>Aucune alerte</p>}
              {alertes.map((a) => (
                <div key={a.id} style={styles.listItem}>
                  <div>
                    <strong>{a.patient_prenom} {a.patient_nom}</strong>
                    <br /><span style={{ fontSize: 12, color: '#666' }}>{a.type} - {a.statut}</span>
                    <br /><span style={{ fontSize: 12, color: '#666' }}>{new Date(a.date).toLocaleString('fr-FR')}</span>
                  </div>
                  {a.statut === 'pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ background: '#198754', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }} onClick={() => handleRepondreAlerte(a.id, 'accepted')}>
                        <i className="fas fa-check" /> Accepter
                      </button>
                      <button style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }} onClick={() => handleRepondreAlerte(a.id, 'refused')}>
                        <i className="fas fa-times" /> Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...styles.card, marginTop: 20 }}>
            <h3 style={styles.cardTitle}>
              <i className="fas fa-user-friends" style={{ marginRight: 8, color: '#0d6efd' }} />
              Patients
            </h3>
            <PatientFollowUp onSuivre={handleSuivrePatient} />
          </div>
        </div>
      )}

      {tab === 'rendez-vous' && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <i className="fas fa-calendar-check" style={{ marginRight: 8, color: '#0d6efd' }} />
            Mes rendez-vous
          </h3>
          <button style={{ ...styles.btn, marginBottom: 10 }} onClick={loadRendezVous}>
            <i className="fas fa-sync-alt" style={{ marginRight: 6 }} /> Actualiser
          </button>
          {rendezVous.length === 0 && <p style={{ color: '#999' }}>Aucun rendez-vous</p>}
          {rendezVous.map((rdv) => (
            <div key={rdv.id} style={styles.listItem}>
              <div>
                <strong>{rdv.patient_prenom} {rdv.patient_nom}</strong>
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
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button style={styles.btn} onClick={() => setShowParamPaiement(!showParamPaiement)}>
              {showParamPaiement ? (
                <><i className="fas fa-times" style={{ marginRight: 6 }} /> Fermer</>
              ) : (
                <><i className="fas fa-cog" style={{ marginRight: 6 }} /> Paramétrer un paiement</>
              )}
            </button>
          </div>

          {showParamPaiement && (
            <div style={{ ...styles.card, marginBottom: 20 }}>
              <h3 style={styles.cardTitle}>
                <i className="fas fa-sliders-h" style={{ marginRight: 8, color: '#0d6efd' }} />
                Paramétrer le mode de paiement
              </h3>
              <input style={styles.formInput} placeholder="ID du paiement" value={paiementParam.paiement_id} onChange={e => setPaiementParam({ ...paiementParam, paiement_id: e.target.value })} />
              <select style={styles.formInput} value={paiementParam.mode_paiement} onChange={e => setPaiementParam({ ...paiementParam, mode_paiement: e.target.value })}>
                <option value="carte">Carte bancaire</option>
                <option value="mobile">Mobile money</option>
                <option value="especes">Espèces</option>
              </select>
              <button style={styles.btnSuccess} onClick={handleParamPaiement}>
                <i className="fas fa-save" style={{ marginRight: 6 }} /> Enregistrer
              </button>
            </div>
          )}

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <i className="fas fa-credit-card" style={{ marginRight: 8, color: '#198754' }} />
              Paiements reçus
            </h3>
            <button style={{ ...styles.btn, marginBottom: 10 }} onClick={loadPaiements}>
              <i className="fas fa-sync-alt" style={{ marginRight: 6 }} /> Actualiser
            </button>
            {paiements.length === 0 && <p style={{ color: '#999' }}>Aucun paiement</p>}
            {paiements.map((p) => (
              <div key={p.id} style={styles.listItem}>
                <div>
                  <strong>{p.patient_prenom} {p.patient_nom}</strong> - {p.montant} Ar
                  <br /><span style={{ fontSize: 13, color: '#666' }}>{p.mode_paiement} - {new Date(p.date).toLocaleString('fr-FR')}</span>
                </div>
                <span style={{
                  ...styles.badge,
                  background: p.statut === 'valide' ? '#d1e7dd' : '#fff3cd',
                  color: p.statut === 'valide' ? '#0f5132' : '#664d03'
                }}>
                  {p.statut === 'valide' ? <i className="fas fa-check-circle" style={{ marginRight: 4 }} /> : <i className="fas fa-clock" style={{ marginRight: 4 }} />}
                  {p.statut}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
