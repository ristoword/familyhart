/**
 * SOS - Schermata emergenza
 * Pulsante SOS centrale e pulsanti rapidi collegati a stato centrale
 * TODO: Backend per invio SOS reali, notifiche push
 */

import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../store/AppContext';
import { SOS_TYPES, CALL_TYPE } from '../data/constants';
import './SOS.css';

const quickActions = [
  { id: 'call', icon: '📞', label: SOS_TYPES.CALL, color: 'accent' },
  { id: 'help', icon: '🆘', label: SOS_TYPES.HELP, color: 'danger' },
  { id: 'pickup', icon: '🚗', label: SOS_TYPES.PICKUP, color: 'accent' },
  { id: 'battery', icon: '🔋', label: SOS_TYPES.BATTERY, color: 'warning' },
];

export default function SOS() {
  const { sosEvents, addSosEvent, resolveSosEvent, startCall } = useApp();

  const handleQuickCall = (event) => {
    if (event.memberId && event.memberName) {
      startCall({ type: CALL_TYPE.AUDIO, targetId: event.memberId, targetName: event.memberName });
    }
  };
  const [isSosActive, setIsSosActive] = useState(false);

  const handleSosPress = () => {
    addSosEvent(SOS_TYPES.SOS);
    setIsSosActive(true);
    setTimeout(() => setIsSosActive(false), 1500);
  };

  const handleQuickAction = (type) => {
    addSosEvent(type);
  };

  return (
    <div className="sos-page">
      <header className="page-header">
        <h1>SOS / Emergenza</h1>
        <p className="header-subtitle">Aiuto rapido per la tua famiglia</p>
      </header>

      {/* Pulsante SOS centrale */}
      <section className="sos-main">
        <button
          className={`sos-button ${isSosActive ? 'active' : ''}`}
          onClick={handleSosPress}
        >
          <span className="sos-button-text">SOS</span>
          <span className="sos-button-hint">Tieni premuto per inviare</span>
        </button>
      </section>

      {/* Pulsanti rapidi */}
      <section className="quick-actions">
        <h3>Azioni rapide</h3>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className={`quick-action-btn ${action.color}`}
              onClick={() => handleQuickAction(action.label)}
            >
              <span className="qa-icon">{action.icon}</span>
              <span className="qa-label">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Cronologia SOS */}
      <section className="sos-history">
        <h3>Cronologia eventi</h3>
        <div className="history-list">
          {sosEvents.map((event) => (
            <div key={event.id} className="history-item">
              <div className="history-icon">🆘</div>
              <div className="history-content">
                <p className="history-title">{event.memberName} - {event.type}</p>
                <p className="history-time">{event.time}</p>
              </div>
              <span className={`history-status ${event.resolved ? 'resolved' : ''}`}>
                {event.resolved ? (
                  '✓ Risolto'
                ) : (
                  <>
                    <button
                      type="button"
                      className="sos-call-btn"
                      onClick={() => handleQuickCall(event)}
                      title="Chiama"
                    >
                      📞
                    </button>
                    <button
                      type="button"
                      className="resolve-btn"
                      onClick={() => resolveSosEvent(event.id)}
                    >
                      Segna risolto
                    </button>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="page-bottom-spacer" />
      <BottomNav />
    </div>
  );
}
