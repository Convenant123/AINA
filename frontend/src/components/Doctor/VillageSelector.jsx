import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const patientIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function VillageSelector({ villages, selectedIds, onToggle, center, acceptedPatients }) {
  return (
    <div style={{ height: 400, borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {acceptedPatients && acceptedPatients.map((p) => (
          <Marker
            key={`patient-${p.patient_id}`}
            position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
            icon={patientIcon}
          >
            <Popup>
              <strong><i className="fas fa-user-injured" /> {p.prenom} {p.nom}</strong>
              <br /><span style={{ color: '#dc3545' }}>Alerte acceptée</span>
              <br />Type: {p.type}
              <br />Date: {new Date(p.alerte_date).toLocaleString('fr-FR')}
            </Popup>
          </Marker>
        ))}
        {villages.map((v) => {
          const isSelected = selectedIds.includes(v.id);
          return (
            <Marker
              key={v.id}
              position={[v.latitude, v.longitude]}
              icon={isSelected ? selectedIcon : new L.Icon.Default()}
              eventHandlers={{ click: () => onToggle(v.id) }}
            >
              <Popup>
                <strong>{v.nom}</strong><br />
                {v.district && <span>{v.district}<br /></span>}
                {v.region && <span>{v.region}<br /></span>}
                <em style={{ fontSize: 11 }}>Cliquez pour {isSelected ? 'désélectionner' : 'sélectionner'}</em>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
