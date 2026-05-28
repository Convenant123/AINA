import React, { useState } from 'react';
import { patientApi } from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const styles = {
  card: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderLeft: '4px solid #dc3545' },
  btn: { background: '#dc3545', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16, width: '100%' },
  error: { color: '#dc3545', marginTop: 8, fontSize: 14 },
  map: { height: 300, marginTop: 12, borderRadius: 8, overflow: 'hidden' },
};

export default function SOSButton() {
  const [hospitals, setHospitals] = useState([]);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const findHospitals = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        try {
          const { data } = await patientApi.getHospitals({ latitude, longitude });
          setHospitals(data);
          if (data.length === 0) setError('Aucun hôpital trouvé à proximité');
        } catch {
          setError('Erreur lors de la recherche');
        } finally {
          setLoading(false);
        }
      },
      () => { setError('Veuillez activer la géolocalisation'); setLoading(false); }
    );
  };

  return (
    <div style={styles.card}>
      <button style={styles.btn} onClick={findHospitals} disabled={loading}>
        {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} /> Recherche en cours...</> : <><i className="fas fa-hospital" style={{ marginRight: 8 }} /> Hôpitaux à proximité</>}
      </button>
      {error && <div style={styles.error}><i className="fas fa-exclamation-triangle" style={{ marginRight: 6 }} />{error}</div>}
      {position && hospitals.length > 0 && (
        <div style={styles.map}>
          <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position}>
              <Popup><i className="fas fa-user" style={{ marginRight: 4 }} />Vous êtes ici</Popup>
            </Marker>
            {hospitals.map((h) => (
              <Marker key={h.id} position={[h.latitude, h.longitude]}>
                <Popup>
                  <strong><i className="fas fa-hospital" style={{ marginRight: 4 }} />{h.nom}</strong><br />{h.adresse}<br />{h.telephone}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
