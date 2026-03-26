/**
 * Notifications Service - Avvisi e notifiche
 *
 * Stato attuale: gestito da AppContext + localStorage.
 * Le pagine usano useApp() per alerts, markAlertRead.
 *
 * TODO Backend Realtime:
 * - Web Push API / FCM per notifiche push
 * - WebSocket: nuovi avvisi in tempo reale
 * - GET /api/notifications?filter=position|safety|battery|chat
 * - PATCH /api/notifications/:id { read: true }
 */

import { loadAlerts, saveAlerts } from '../utils/storage';

/**
 * Carica avvisi da storage (fallback per init)
 * @returns {Array}
 */
export function loadNotifications() {
  return loadAlerts();
}

/**
 * Salva avvisi (usato da AppContext)
 * @param {Array} alerts
 */
export function persistAlerts(alerts) {
  saveAlerts(alerts);
}
