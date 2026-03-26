/**
 * Profile - Profilo e impostazioni
 * Famiglia, membri, inviti, permessi da stato centrale
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import LocationBanner from '../components/LocationBanner';
import { useApp } from '../store/AppContext';
import { formatCoords, LOCATION_PERMISSION } from '../utils/location';
import { MEMBER_ROLE, PERMISSION } from '../data/constants';
import './Profile.css';

const ROLE_LABELS = {
  admin: 'Amministratore famiglia',
  partner: 'Genitore',
  child: 'Figlio/a',
  guest: 'Ospite',
};

function getRoleLabel(roleType) {
  return ROLE_LABELS[roleType] || 'Membro';
}

export default function Profile() {
  const navigate = useNavigate();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', surname: '', roleType: MEMBER_ROLE.CHILD, email: '' });
  const [editingMemberId, setEditingMemberId] = useState(null);

  const {
    user,
    members,
    invites,
    logout,
    locationPermission,
    locationError,
    userPosition,
    requestLocationPermission,
    canUser,
    removeMember,
    updateMemberRole,
    toggleLocationSharing,
    createInvite,
    acceptInvite,
    declineInvite,
    callHistory,
  } = useApp();

  const formatCallDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCallDuration = (s) => {
    if (!s) return '-';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const outcomeLabels = { completed: 'Completata', no_answer: 'Senza risposta', cancelled: 'Annullata', in_progress: 'In corso' };

  const canManage = canUser(PERMISSION.MANAGE_MEMBERS);
  const canInvite = canUser(PERMISSION.INVITE_MEMBERS);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>Profilo</h1>
        <p className="header-subtitle">Impostazioni e preferenze</p>
      </header>

      <section className="profile-section">
        <div className="user-card">
          <div className="user-avatar">{user.avatar}</div>
          <div className="user-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span className="user-role">{getRoleLabel(user.roleType) || user.role}</span>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <h3>Famiglia</h3>
        <Link to="/dashboard" className="settings-row">
          <span>Visualizza famiglia</span>
          <span className="arrow">→</span>
        </Link>
        <Link to="/safe-places" className="settings-row">
          <span>📍 Luoghi sicuri</span>
          <span className="arrow">→</span>
        </Link>
        <Link to="/agenda" className="settings-row">
          <span>📅 Agenda famiglia</span>
          <span className="arrow">→</span>
        </Link>

        <div className="family-members-list">
          <h4>Membri ({members?.length || 0})</h4>
          {(members || []).map((m) => (
            <div key={m.id} className="family-member-row">
              <span className="member-avatar-sm">{m.avatar}</span>
              <div className="member-detail">
                <span className="member-name">{m.name} {m.surname}</span>
                <span className="member-role-badge">{getRoleLabel(m.roleType)}</span>
                {m.locationSharingEnabled !== false ? (
                  <span className="member-loc-status">📍 Posizione attiva</span>
                ) : (
                  <span className="member-loc-status muted">📍 Posizione disattivata</span>
                )}
              </div>
              {canManage && m.id !== user.id && (
                <div className="member-actions">
                  {editingMemberId === m.id ? (
                    <>
                      <select
                        value={m.roleType}
                        onChange={(e) => updateMemberRole(m.id, e.target.value)}
                        className="role-select"
                      >
                        {Object.entries(ROLE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => toggleLocationSharing(m.id)}
                        title={m.locationSharingEnabled ? 'Disattiva posizione' : 'Attiva posizione'}
                      >
                        {m.locationSharingEnabled ? '📍' : '🚫'}
                      </button>
                      <button type="button" className="btn-icon danger" onClick={() => removeMember(m.id)} title="Rimuovi">
                        ✕
                      </button>
                      <button type="button" className="btn-icon" onClick={() => setEditingMemberId(null)}>✓</button>
                    </>
                  ) : (
                    <button type="button" className="btn-icon" onClick={() => setEditingMemberId(m.id)} title="Modifica">
                      ✎
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {canInvite && (
          <>
            {showInviteForm ? (
              <form
                className="invite-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  createInvite(inviteForm);
                  setInviteForm({ name: '', surname: '', roleType: MEMBER_ROLE.CHILD, email: '' });
                  setShowInviteForm(false);
                }}
              >
                <h4>Invita membro</h4>
                <input
                  type="text"
                  placeholder="Nome"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Cognome"
                  value={inviteForm.surname}
                  onChange={(e) => setInviteForm((f) => ({ ...f, surname: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Email o telefono"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                />
                <select
                  value={inviteForm.roleType}
                  onChange={(e) => setInviteForm((f) => ({ ...f, roleType: e.target.value }))}
                >
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <div className="invite-form-actions">
                  <button type="submit" className="fh-btn fh-btn-primary">Invia invito</button>
                  <button type="button" className="fh-btn fh-btn-secondary" onClick={() => setShowInviteForm(false)}>
                    Annulla
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="fh-btn fh-btn-secondary btn-invite"
                onClick={() => setShowInviteForm(true)}
              >
                + Invita membro
              </button>
            )}

            {invites?.length > 0 && (
              <div className="pending-invites">
                <h4>Inviti in attesa</h4>
                {invites.map((inv) => (
                  <div key={inv.id} className="invite-row">
                    <span>{inv.name} {inv.surname}</span>
                    <span className="invite-role">{getRoleLabel(inv.roleType)}</span>
                    <span className="invite-contact">{inv.email || inv.phone || ''}</span>
                    <div className="invite-actions">
                      <button
                        type="button"
                        className="fh-btn fh-btn-primary btn-sm"
                        onClick={() => acceptInvite(inv.id)}
                        title="Accetta (simula)"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        className="fh-btn fh-btn-secondary btn-sm"
                        onClick={() => declineInvite(inv.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <LocationBanner
        permission={locationPermission}
        error={locationError}
        onRetry={requestLocationPermission}
      />

      <section className="profile-section">
        <h3>Posizione</h3>
        {userPosition ? (
          <div className="profile-position">
            <p>{formatCoords(userPosition.lat, userPosition.lng)}</p>
            <span className="profile-position-time">Aggiornato {userPosition.lastUpdateText}</span>
          </div>
        ) : (
          <div className="profile-position profile-position-prompt">
            {locationPermission === LOCATION_PERMISSION.PROMPT && (
              <button
                type="button"
                className="fh-btn fh-btn-primary"
                onClick={requestLocationPermission}
              >
                Abilita posizione
              </button>
            )}
            {locationPermission === LOCATION_PERMISSION.DENIED && (
              <p className="profile-position-denied">Permesso negato. Abilita nelle impostazioni.</p>
            )}
          </div>
        )}
      </section>

      <section className="profile-section">
        <h3>Permessi</h3>
        <div className="settings-row">
          <span>📍 Posizione</span>
          <span className={`toggle ${locationPermission === LOCATION_PERMISSION.GRANTED ? 'active' : ''}`}>
            {locationPermission === LOCATION_PERMISSION.GRANTED ? 'Attivo' : 'Non attivo'}
          </span>
        </div>
        <div className="settings-row">
          <span>🔔 Notifiche</span>
          <span className="toggle active">Attivo</span>
        </div>
        <div className="settings-row">
          <span>🎤 Microfono</span>
          <span className="toggle active">Attivo</span>
        </div>
        <div className="settings-row">
          <span>🔒 Privacy</span>
          <span className="arrow">→</span>
        </div>
      </section>

      <section className="profile-section">
        <h3>Storico chiamate</h3>
        {callHistory?.length > 0 ? (
          <div className="call-history-list">
            {callHistory.slice(0, 20).map((entry) => (
              <div key={entry.id} className="call-history-row">
                <span className="call-history-icon">{entry.type === 'video' ? '📹' : '📞'}</span>
                <div className="call-history-detail">
                  <span className="call-history-name">{entry.targetName}</span>
                  <span className="call-history-meta">
                    {formatCallDate(entry.startTime)} · {formatCallDuration(entry.duration)} · {outcomeLabels[entry.outcome] || entry.outcome}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="call-history-empty">Nessuna chiamata recente</p>
        )}
      </section>

      <section className="profile-section">
        <h3>Dispositivi collegati</h3>
        <div className="device-item">
          <span>📱 iPhone 15 Pro</span>
          <span className="device-status">Questo dispositivo</span>
        </div>
      </section>

      <div className="profile-actions">
        <button type="button" className="fh-btn fh-btn-secondary btn-logout" onClick={handleLogout}>
          Esci
        </button>
      </div>

      <div className="page-bottom-spacer" />
      <BottomNav />
    </div>
  );
}
