/**
 * Notifications - Avvisi e notifiche
 * Legge alerts da stato centrale
 */

import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../store/AppContext';
import './Notifications.css';

const FILTERS = [
  { id: 'all', label: 'Tutti' },
  { id: 'position', label: 'Posizione' },
  { id: 'safety', label: 'Sicurezza' },
  { id: 'battery', label: 'Batteria' },
  { id: 'chat', label: 'Chat' },
];

export default function Notifications() {
  const { alerts, markAlertRead } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredNotifications =
    activeFilter === 'all' ? alerts : alerts.filter((n) => n.type === activeFilter);

  return (
    <div className="notifications-page">
      <header className="page-header">
        <h1>Avvisi</h1>
        <p className="header-subtitle">Rimani aggiornato sulla tua famiglia</p>
      </header>

      <div className="filters-scroll">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="notifications-list">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`notification-item ${notif.read ? 'read' : ''}`}
            onClick={() => !notif.read && markAlertRead(notif.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !notif.read && markAlertRead(notif.id); } }}
            role="button"
            tabIndex={0}
            aria-label={notif.read ? 'Avviso letto' : 'Segna come letto'}
          >
            <div className="notif-icon">{notif.icon}</div>
            <div className="notif-content">
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <span className="notif-time">{notif.time}</span>
            </div>
            {!notif.read && <span className="unread-dot" />}
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="empty-state">
          <p>Nessun avviso in questa categoria</p>
        </div>
      )}

      <div className="page-bottom-spacer" />
      <BottomNav />
    </div>
  );
}
