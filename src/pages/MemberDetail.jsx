/**
 * MemberDetail - Dettaglio membro famiglia
 * Legge membro da stato centrale (family.members)
 */

import { useParams, Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useApp } from '../store/AppContext';
import { CALL_TYPE } from '../data/constants';
import { getStatusClass } from '../utils/status';
import { formatCoords } from '../utils/location';
import './MemberDetail.css';

export default function MemberDetail() {
  const { id } = useParams();
  const { family, startCall } = useApp();
  const member = family.members.find((m) => m.id === id) || family.members[0];

  const handleCall = (type) => {
    if (member) startCall({ type, targetId: member.id, targetName: `${member.name} ${member.surname || ''}`.trim() });
  };

  if (!member) return null;

  return (
    <div className="member-detail-page">
      <header className="page-header">
        <Link to="/dashboard" className="back-link">
          ← Indietro
        </Link>
        <h1>Dettaglio</h1>
      </header>

      <section className="member-profile">
        <div className="member-photo" style={{ background: `${member.color}25` }}>
          {member.avatar}
        </div>
        <h2>{member.name} {member.surname || ''}</h2>
        <span className="member-role-label">{member.role}</span>
        <span className={`fh-status ${getStatusClass(member.status)} status-badge`}>
          {member.status}
        </span>
        <p className="member-meta">
          🔋 {member.battery}% · Ultimo aggiornamento {member.lastUpdate}
        </p>
        <p className="member-location">📍 {member.location || formatCoords(member.lat, member.lng)}</p>
      </section>

      <section className="info-boxes">
        <div className="info-box">
          <h4>📍 Posizione attuale</h4>
          <p>
            {member.locationSharingEnabled !== false
              ? (member.location || formatCoords(member.lat, member.lng))
              : 'Non condivisa'}
          </p>
          {member.lat != null && (
            <span className="info-box-coords">{formatCoords(member.lat, member.lng)}</span>
          )}
        </div>
        <div className="info-box">
          <h4>🛤️ Percorso di oggi</h4>
          <p>Casa → Scuola → Centro città (simulato)</p>
        </div>
        <div className="info-box">
          <h4>🏠 Luoghi visitati</h4>
          <p>Casa, Scuola, Piazza Duomo</p>
        </div>
      </section>

      <section className="action-buttons">
        <button type="button" className="fh-btn fh-btn-primary action-btn-full" onClick={() => handleCall(CALL_TYPE.AUDIO)}>
          📞 Chiama
        </button>
        <button type="button" className="fh-btn fh-btn-secondary action-btn-full" onClick={() => handleCall(CALL_TYPE.VIDEO)}>
          📹 Videochiamata
        </button>
        <Link to="/chat" className="fh-btn fh-btn-secondary action-btn-full">
          💬 Chat
        </Link>
        <button type="button" className="fh-btn fh-btn-secondary action-btn-full">
          🧭 Naviga
        </button>
        <button type="button" className="fh-btn fh-btn-secondary action-btn-full">
          📍 Condividi posizione
        </button>
      </section>

      <div className="page-bottom-spacer" />
      <BottomNav />
    </div>
  );
}
