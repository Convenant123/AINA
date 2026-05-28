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
  card: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderLeft: '4px solid #198754' },
  btn: { background: '#198754', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16, width: '100%' },
  error: { color: '#dc3545', marginTop: 8, fontSize: 14 },
  map: { height: 300, marginTop: 12, borderRadius: 8, overflow: 'hidden' },
};

export default function PharmacyButton() {
  const [pharmacies, setPharmacies] = useState([]);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const findPharmacies = () => {
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
          const { data } = await patientApi.getPharmacies({ latitude, longitude });
          setPharmacies(data);
          if (data.length === 0) setError('Aucune pharmacie trouvée à proximité');
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
      <button style={styles.btn} onClick={findPharmacies} disabled={loading}>
        {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} /> Recherche en cours...</> : <><i className="fas fa-prescription-bottle-alt" style={{ marginRight: 8 }} /> Pharmacies à proximité</>}
      </button>
      {error && <div style={styles.error}><i className="fas fa-exclamation-triangle" style={{ marginRight: 6 }} />{error}</div>}
      {position && pharmacies.length > 0 && (
        <div style={styles.map}>
          <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position}>
              <Popup><i className="fas fa-user" style={{ marginRight: 4 }} />Vous êtes ici</Popup>
            </Marker>
            {pharmacies.map((p) => (
              <Marker key={p.id} position={[p.latitude, p.longitude]}>
                <Popup>
                  <strong><i className="fas fa-prescription-bottle-alt" style={{ marginRight: 4 }} />{p.nom}</strong><br />{p.adresse}<br />{p.telephone}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
