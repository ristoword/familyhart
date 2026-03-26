/**
 * SOS Service - Emergenze e richieste aiuto
 *
 * Stato attuale: gestito da AppContext + localStorage.
 * Le pagine usano useApp() per addSosEvent, resolveSosEvent, sosEvents.
 *
 * TODO Backend Realtime:
 * - POST /api/sos { type, memberId, position } → notifiche push a famiglia
 * - WebSocket: broadcast evento SOS a tutti i dispositivi
 * - PATCH /api/sos/:id { resolved: true }
 * - Integrazione 112: invio posizione + dettagli
 */

import { loadSosEvents, saveSosEvents } from '../utils/storage';

/**
 * Carica eventi SOS da storage (fallback per init)
 * @returns {Array}
 */
export function loadEvents() {
  return loadSosEvents();
}

/**
 * Salva eventi (usato da AppContext)
 * @param {Array} events
 */
export function persistEvents(events) {
  saveSosEvents(events);
}
