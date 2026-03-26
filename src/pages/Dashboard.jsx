/**
 * Dashboard - Home famiglia
 * Legge family da stato centrale, posizioni live
 */

import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import LocationBanner from '../components/LocationBanner';
import { useApp } from '../store/AppContext';
import { MEMBER_STATUS } from '../data';
import { getStatusClass } from '../utils/status';
import { formatCoords, LOCATION_PERMISSION } from '../utils/location';
import './Dashboard.css';

export default function Dashboard() {
  const { family, locationPermission, locationError, userPosition, requestLocationPermission, backendError, showSocketOfflineBanner, useBackend, refreshBackendData } = useApp();
  const { members } = family;

  const allSafe = members.every((m) => m.status !== MEMBER_STATUS.OFFLINE);
  const onlineCount = members.filter((m) => m.status !== MEMBER_STATUS.OFFLINE).length;

  return (
    <div className="dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <h1>{family.group.name}</h1>
          <p className="header-subtitle">Tutti connessi e al sicuro</p>
        </div>
        <Link to="/sos" className="sos-quick-btn" title="SOS">
          🆘
        </Link>
      </header>

      {locationPermission === LOCATION_PERMISSION.PROMPT && (
        <div className="dashboard-location-prompt">
          <p>Abilita la posizione per vedere la tua posizione sulla mappa</p>
          <button type="button" className="fh-btn fh-btn-primary btn-sm" onClick={requestLocationPermission}>
            Abilita posizione
          </button>
        </div>
      )}

      <LocationBanner
        permission={locationPermission}
        error={locationError}
        onRetry={requestLocationPermission}
      />

      {useBackend && backendError && (
        <div className="backend-error-banner" style={{ background: '#FEF3C7', padding: '8px 12px', borderRadius: 8, margin: '0 16px 12px', fontSize: 14 }}>
          <span>Server non disponibile — dati in cache</span>
          <button type="button" className="fh-btn btn-sm" style={{ marginLeft: 8 }} onClick={refreshBackendData}>
            Riprova
          </button>
        </div>
      )}

      {useBackend && showSocketOfflineBanner && (
        <div className="backend-error-banner" style={{ background: '#E0E7FF', padding: '8px 12px', borderRadius: 8, margin: '0 16px 12px', fontSize: 14 }}>
          <span>Connessione realtime in pausa — aggiornamenti periodici attivi</span>
        </div>
      )}

      {userPosition && (
        <section className="user-position-card">
          <h4>📍 La tua posizione</h4>
          <p>{formatCoords(userPosition.lat, userPosition.lng)}</p>
          <span className="user-position-time">{userPosition.lastUpdateText}</span>
        </section>
      )}

      <section className="status-card">
        <div className="status-indicator" data-safe={allSafe}>
          <span className="status-icon">{allSafe ? '✓' : '!'}</span>
          <div>
            <h3>{allSafe ? 'Tutto ok' : 'Attenzione'}</h3>
            <p>
              {onlineCount}/{members.length} membri connessi
            </p>
          </div>
        </div>
      </section>

      <section className="members-section">
        <h2>Membri famiglia</h2>
        <div className="member-cards">
          {members.map((member) => (
            <div key={member.id} className="member-card">
              <div className="member-avatar" style={{ background: `${member.color}20` }}>
                {member.avatar}
              </div>
              <div className="member-info">
                <h3>{member.name}</h3>
                <span className={`fh-status ${getStatusClass(member.status)}`}>
                  {member.status}
                </span>
                <p className="member-meta">
                  🔋 {member.battery}% · {member.lastUpdate}
                </p>
              </div>
              <Link
                to={`/member/${member.id}`}
                className="fh-btn fh-btn-secondary btn-small"
              >
                Vedi posizione
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="page-bottom-spacer" />
      <BottomNav />
    </div>
  );
}
