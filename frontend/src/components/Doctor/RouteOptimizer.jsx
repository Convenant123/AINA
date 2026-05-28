import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
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

export default function RouteOptimizer({ route, totalDistance, acceptedPatients }) {
  if ((!route || route.length === 0) && (!acceptedPatients || acceptedPatients.length === 0)) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        <i className="fas fa-map" style={{ fontSize: 48, marginBottom: 12, display: 'block', opacity: 0.3 }} />
        Aucun itinéraire généré
        <br /><span style={{ fontSize: 13 }}>Sélectionnez des villages ou utilisez des alertes acceptées</span>
      </div>
    );
  }

  let positions = [];
  let waypoints = [];

  if (acceptedPatients && acceptedPatients.length > 0) {
    const patientWps = acceptedPatients.map(p => ({
      latitude: parseFloat(p.latitude),
      longitude: parseFloat(p.longitude),
      nom: `${p.prenom} ${p.nom}`,
      type: 'patient',
      patient_id: p.patient_id,
    }));
    waypoints.push(...patientWps);
  }

  if (route && route.length > 0) {
    const routeWps = route.slice(1).map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
      nom: p.nom,
      type: 'village',
    }));
    waypoints.push(...routeWps);
  }

  waypoints = waypoints.filter((wp, i, arr) =>
    arr.findIndex(w => Math.abs(w.latitude - wp.latitude) < 0.001 && Math.abs(w.longitude - wp.longitude) < 0.001) === i
  );

  // Algorithme Haversine - tri par plus proche voisin
  let ordered = [];
  let startPos = route && route.length > 0
    ? { lat: route[0].latitude, lng: route[0].longitude }
    : { lat: parseFloat(waypoints[0].latitude), lng: parseFloat(waypoints[0].longitude) };

  ordered.push({ nom: 'Départ', latitude: startPos.lat, longitude: startPos.lng, type: 'start' });

  let remaining = [...waypoints];
  let current = startPos;

  while (remaining.length > 0) {
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(current.lat, current.lng, remaining[i].latitude, remaining[i].longitude);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    }
    ordered.push(remaining[nearest]);
    current = { lat: remaining[nearest].latitude, lng: remaining[nearest].longitude };
    remaining.splice(nearest, 1);
  }
  // fin

  positions = ordered.map(p => [p.latitude, p.longitude]);
  const center = positions[0];

  let totalDist = 0;
  for (let i = 0; i < ordered.length - 1; i++) {
    totalDist += haversine(ordered[i].latitude, ordered[i].longitude, ordered[i + 1].latitude, ordered[i + 1].longitude);
  }

  const patientCount = ordered.filter(p => p.type === 'patient').length;
  const villageCount = ordered.filter(p => p.type === 'village').length;

  return (
    <div>
      <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#0d6efd' }}>
            <i className="fas fa-road" style={{ marginRight: 6 }} /> {Math.round(totalDist * 100) / 100} km
          </span>
          <span style={{ color: '#666' }}>
            <i className="fas fa-flag-checkered" style={{ marginRight: 6 }} /> {ordered.length - 1} étape(s)
          </span>
          {patientCount > 0 && (
            <span style={{ color: '#dc3545' }}>
              <i className="fas fa-user-injured" style={{ marginRight: 6 }} /> {patientCount} patient(s)
            </span>
          )}
          {villageCount > 0 && (
            <span style={{ color: '#0d6efd' }}>
              <i className="fas fa-map-marker-alt" style={{ marginRight: 6 }} /> {villageCount} village(s)
            </span>
          )}
        </div>
      </div>
      <div style={{ height: 300, borderRadius: 8, overflow: 'hidden' }}>
        <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={positions} color="#0d6efd" weight={3} />
          {ordered.map((p, i) => {
            let icon = new L.Icon.Default();
            if (i === 0) icon = startIcon;
            else if (p.type === 'patient') icon = patientIcon;
            return (
              <Marker key={i} position={[p.latitude, p.longitude]} icon={icon}>
                <Popup>
                  <strong>{i === 0 ? 'Départ' : `Étape ${i}`}</strong><br />
                  {p.nom}<br />
                  {p.type === 'patient' && <span style={{ color: '#dc3545' }}>Patient avec alerte</span>}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      <ol style={{ marginTop: 12, fontSize: 14, paddingLeft: 20 }}>
        {ordered.map((p, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            {i === 0 ? (
              <strong><i className="fas fa-play" style={{ marginRight: 6, color: '#198754' }} /> Départ</strong>
            ) : (
              <>
                {p.type === 'patient' ? (
                  <span style={{ color: '#dc3545' }}>
                    <i className="fas fa-user-injured" style={{ marginRight: 6 }} /> {p.nom}
                  </span>
                ) : (
                  <span><i className="fas fa-map-pin" style={{ marginRight: 6, color: '#0d6efd' }} /> {p.nom}</span>
                )}
                <span style={{ color: '#666', marginLeft: 8, fontSize: 12 }}>
                  ({Math.round(haversine(ordered[i-1].latitude, ordered[i-1].longitude, p.latitude, p.longitude) * 100) / 100} km)
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// Algorithme Haversine
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
// fin
