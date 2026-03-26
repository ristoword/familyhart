/**
 * Geofence Service - Luoghi sicuri e trigger entrata/uscita
 *
 * Stato attuale: gestito da AppContext + localStorage.
 * Le pagine usano useApp() per places, addPlace, updatePlace.
 * La logica di check viene eseguita nell'intervallo di simulazione AppContext.
 *
 * TODO Backend Realtime:
 * - GET/POST/PATCH /api/families/:id/safe-places
 * - WebSocket: notifiche geofence in tempo reale
 * - Backend calcola entrata/uscita da posizioni ricevute
 */

/** Raggio Terra in metri */
const EARTH_RADIUS_M = 6371000;

/**
 * Calcola distanza in metri tra due punti (formula di Haversine)
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distanza in metri
 */
export function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/**
 * Verifica se un punto è dentro il raggio di un luogo
 * @param {number} memberLat
 * @param {number} memberLng
 * @param {object} place - { lat, lng, radius }
 * @returns {boolean}
 */
export function isInsidePlace(memberLat, memberLng, place) {
  if (memberLat == null || memberLng == null) return false;
  const dist = getDistanceMeters(memberLat, memberLng, place.lat, place.lng);
  return dist <= (place.radius || 100);
}

/**
 * Chiave per stato geofence membro-luogo
 * @param {string} memberId
 * @param {string} placeId
 */
export function geofenceKey(memberId, placeId) {
  return `${memberId}:${placeId}`;
}

/**
 * Calcola i cambi di stato entrata/uscita per tutti i membri e luoghi
 * @param {Array} members - con lat, lng, id
 * @param {Array} places - con lat, lng, radius, id, memberIds, notifyEntry, notifyExit
 * @param {Object} prevState - { "memberId:placeId": boolean }
 * @returns {Array<{memberId, memberName, placeId, placeName, type: 'entry'|'exit', notify: boolean}>}
 */
export function computeStateChanges(members, places, prevState) {
  const changes = [];
  const nextState = { ...prevState };

  for (const place of places) {
    const memberIds = place.memberIds || [];
    for (const memberId of memberIds) {
      const member = members.find((m) => m.id === memberId);
      if (!member) continue;

      const key = geofenceKey(memberId, place.id);
      const inside = isInsidePlace(member.lat, member.lng, place);
      const wasInside = prevState[key];
      nextState[key] = inside;

      // Evita eventi al primo run (stato sconosciuto)
      if (wasInside === undefined) continue;

      if (inside && wasInside === false) {
        changes.push({
          memberId,
          memberName: member.name,
          placeId: place.id,
          placeName: place.name,
          type: 'entry',
          notify: place.notifyEntry !== false,
        });
      } else if (!inside && wasInside === true) {
        changes.push({
          memberId,
          memberName: member.name,
          placeId: place.id,
          placeName: place.name,
          type: 'exit',
          notify: place.notifyExit !== false,
        });
      }
    }
  }

  return { changes, nextState };
}
