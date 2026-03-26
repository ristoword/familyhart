/**
 * Map - Mappa live con marker membri famiglia
 * Legge da stato centralizzato, posizioni da lat/lng
 * TODO: Integrare mappa reale (Leaflet, Mapbox, Google Maps)
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import LocationBanner from '../components/LocationBanner';
import { useApp } from '../store/AppContext';
import { getStatusClass } from '../utils/status';
import { latLngToMapPosition, LOCATION_PERMISSION } from '../utils/location';
import './Map.css';

export default function Map() {
  const {
    family,
    locationPermission,
    locationError,
    userPosition,
    requestLocationPermission,
    refreshUserPosition,
  } = useApp();
  const members = family.members;
  const [selectedMember, setSelectedMember] = useState(members[0] || null);
  const [showAll, setShowAll] = useState(true);

  const allPoints = useMemo(() => {
    const pts = members.map((m) => ({ lat: m.lat, lng: m.lng }));
    if (userPosition) pts.push({ lat: userPosition.lat, lng: userPosition.lng });
    if (pts.length === 0) return null;
    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [members, userPosition]);

  const bounds = allPoints || {
    minLat: 45.45,
    maxLat: 45.48,
    minLng: 9.17,
    maxLng: 9.21,
  };

  return (
    <div className="map-page">
      <header className="page-header map-header">
        <h1>Mappa live</h1>
        <div className="map-header-actions">
          {locationPermission === LOCATION_PERMISSION.GRANTED && (
            <button
              type="button"
              className="fh-btn fh-btn-secondary btn-refresh"
              onClick={refreshUserPosition}
              title="Aggiorna posizione"
            >
              ⟳
            </button>
          )}
          {locationPermission === LOCATION_PERMISSION.PROMPT && (
            <button
              type="button"
              className="fh-btn fh-btn-primary btn-enable-location"
              onClick={requestLocationPermission}
            >
              Abilita posizione
            </button>
          )}
          <button
            type="button"
            className={`fh-btn fh-btn-secondary btn-toggle ${showAll ? 'active' : ''}`}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Vedi tutti' : 'Seleziona'}
          </button>
        </div>
      </header>

      <LocationBanner
        permission={locationPermission}
        error={locationError}
        onRetry={requestLocationPermission}
      />

      <div className="map-container">
        <div className="map-placeholder">
          <div className="map-grid" />
          <div className="map-watermark">Mappa demo</div>
          {members.map((member) => {
            const pos = latLngToMapPosition(member.lat, member.lng, bounds);
            return (
              <button
                key={member.id}
                type="button"
                className={`map-marker ${selectedMember?.id === member.id ? 'selected' : ''}`}
                style={{
                  left: pos.left,
                  top: pos.top,
                  '--marker-color': member.color,
                }}
                onClick={() => setSelectedMember(member)}
              >
                {member.avatar}
              </button>
            );
          })}
          {userPosition && (() => {
            const pos = latLngToMapPosition(userPosition.lat, userPosition.lng, bounds);
            return (
              <div
                className="map-marker map-marker-user"
                style={{
                  left: pos.left,
                  top: pos.top,
                  '--marker-color': 'var(--fh-accent)',
                }}
                title="La tua posizione"
              >
                ●
              </div>
            );
          })()}
        </div>
      </div>

      <div className="member-selector">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            className={`selector-btn ${selectedMember?.id === member.id ? 'active' : ''}`}
            onClick={() => setSelectedMember(member)}
          >
            {member.avatar}
          </button>
        ))}
      </div>

      {selectedMember && (
        <div className="map-member-card">
          <div className="map-card-header">
            <div className="map-card-avatar" style={{ background: `${selectedMember.color}25` }}>
              {selectedMember.avatar}
            </div>
            <div className="map-card-info">
              <h3>{selectedMember.name}</h3>
              <span className={`fh-status ${getStatusClass(selectedMember.status)}`}>
                {selectedMember.status}
              </span>
              <p>🔋 {selectedMember.battery}% · {selectedMember.lastUpdate}</p>
            </div>
          </div>
          <div className="map-card-actions">
            <button type="button" className="action-btn">
              📞 Chiama
            </button>
            <Link to="/chat" className="action-btn">
              💬 Messaggio
            </Link>
            <Link to={`/sos?member=${selectedMember.id}`} className="action-btn sos">
              🆘 SOS
            </Link>
          </div>
        </div>
      )}

      <div className="page-bottom-spacer" />
      <BottomNav />
    </div>
  );
}
