import React, { useState } from 'react';
import { patientApi } from '../../services/api';

const styles = {
  card: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderLeft: '4px solid #ffc107' },
  btn: { background: '#ffc107', color: '#333', border: 'none', padding: '12px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16, width: '100%' },
  status: { marginTop: 12, padding: 12, borderRadius: 6, textAlign: 'center', fontWeight: 600 },
  error: { color: '#dc3545', marginTop: 8, fontSize: 14 },
};

export default function DoctorAlert() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const alertDoctors = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      return;
    }
    setLoading(true);
    setError('');
    setStatus(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const { data } = await patientApi.alertDoctors({ type: 'urgence', latitude, longitude });
          setStatus(`${data.message}`);
        } catch {
          setError("Erreur lors de l'envoi de l'alerte");
        } finally {
          setLoading(false);
        }
      },
      () => { setError('Veuillez activer la géolocalisation'); setLoading(false); }
    );
  };

  return (
    <div style={styles.card}>
      <button style={styles.btn} onClick={alertDoctors} disabled={loading}>
        {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} /> Envoi en cours...</> : <><i className="fas fa-exclamation-triangle" style={{ marginRight: 8 }} /> Alerter les médecins</>}
      </button>
      {error && <div style={styles.error}><i className="fas fa-times-circle" style={{ marginRight: 6 }} />{error}</div>}
      {status && (
        <div style={{ ...styles.status, background: '#d1e7dd', color: '#0f5132' }}>
          <i className="fas fa-check-circle" style={{ marginRight: 6 }} />{status}
        </div>
      )}
    </div>
  );
}
