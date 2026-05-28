import React, { useState, useEffect } from 'react';
import { medecinApi } from '../../services/api';

const styles = {
  listItem: { padding: 12, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  btn: { background: '#0d6efd', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
};

export default function PatientFollowUp({ onSuivre }) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    medecinApi.getPatients().then(({ data }) => setPatients(data)).catch(() => {});
  }, []);

  if (patients.length === 0) {
    return <p style={{ color: '#999' }}><i className="fas fa-info-circle" style={{ marginRight: 6 }} />Aucun patient trouvé</p>;
  }

  return (
    <div>
      {patients.map((p) => (
        <div key={p.id} style={styles.listItem}>
          <div>
            <strong><i className="fas fa-user" style={{ marginRight: 6, color: '#0d6efd' }} />{p.prenom} {p.nom}</strong>
            <br /><span style={{ fontSize: 13, color: '#666' }}><i className="fas fa-phone" style={{ marginRight: 4 }} />{p.telephone || 'Pas de téléphone'}</span>
          </div>
          <button style={styles.btn} onClick={() => onSuivre(p.id)}>
            <i className="fas fa-eye" style={{ marginRight: 4 }} /> Suivre
          </button>
        </div>
      ))}
    </div>
  );
}
