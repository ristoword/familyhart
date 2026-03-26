/**
 * Location Store - Logica centralizzata posizione
 *
 * Gestisce: permessi, posizione reale utente, simulazione membri demo
 * TODO: Collegare backend per posizioni membri reali, WebSocket per live updates
 */

import { MEMBER_STATUS } from '../data';
import {
  isGeolocationSupported,
  LOCATION_PERMISSION,
  formatLastUpdate,
} from '../utils/location';

/** Opzioni per getCurrentPosition */
const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

/**
 * Richiede permesso e legge posizione reale
 * @returns {Promise<{permission: string, position?: object, error?: string}>}
 */
export function requestAndGetPosition() {
  if (!isGeolocationSupported()) {
    return Promise.resolve({
      permission: LOCATION_PERMISSION.UNAVAILABLE,
      error: 'Geolocalizzazione non supportata',
    });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          permission: LOCATION_PERMISSION.GRANTED,
          position: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            lastUpdate: new Date(),
            lastUpdateText: formatLastUpdate(new Date()),
          },
        });
      },
      (err) => {
        let permission = LOCATION_PERMISSION.DENIED;
        let error = 'Impossibile ottenere la posizione';

        if (err.code === 1) {
          permission = LOCATION_PERMISSION.DENIED;
          error = 'Permesso posizione negato';
        } else if (err.code === 2) {
          error = 'Posizione non disponibile';
        } else if (err.code === 3) {
          error = 'Timeout: riprova';
        }

        resolve({ permission, error });
      },
      GEO_OPTIONS
    );
  });
}

/**
 * Avvia watch per aggiornamenti continui posizione utente
 * @returns {number|null} watchId per clearWatch, null se non supportato
 */
export function watchUserPosition(onUpdate, onError) {
  if (!isGeolocationSupported()) return null;

  const id = navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        lastUpdate: new Date(),
        lastUpdateText: formatLastUpdate(new Date()),
      });
    },
    onError,
    GEO_OPTIONS
  );

  return id;
}

/**
 * Simula un passo di movimento per un membro
 * @param {object} member - membro con lat, lng
 * @param {number} step - intensità variazione (0.0001 = ~10m)
 */
function simulateMovement(member, step = 0.00015) {
  const angle = Math.random() * Math.PI * 2;
  const lat = member.lat + Math.cos(angle) * step * (0.5 + Math.random());
  const lng = member.lng + Math.sin(angle) * step * (0.5 + Math.random());
  return { lat, lng };
}

/**
 * Stati possibili per la simulazione
 */
const SIM_STATUSES = [
  MEMBER_STATUS.HOME,
  MEMBER_STATUS.SCHOOL,
  MEMBER_STATUS.WORK,
  MEMBER_STATUS.MOVING,
];

/**
 * Genera aggiornamento simulato per i membri demo
 * @param {Array} members - membri con posizione base
 * @returns {Array} membri aggiornati
 */
export function simulateMembersUpdate(members) {
  const now = new Date();
  return members.map((m) => {
    const moved = simulateMovement(m);
    const statusChange = Math.random() < 0.08;
    const status = statusChange
      ? SIM_STATUSES[Math.floor(Math.random() * SIM_STATUSES.length)]
      : m.status;
    const batteryChange = Math.random() < 0.1 ? -1 : 0;
    const battery = Math.max(5, Math.min(100, (m.battery || 50) + batteryChange));

    return {
      ...m,
      lat: moved.lat,
      lng: moved.lng,
      status,
      battery,
      lastUpdate: formatLastUpdate(now),
      lastUpdateRaw: now,
    };
  });
}
