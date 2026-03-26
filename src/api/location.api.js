/**
 * Location API - backend reale con fallback
 */
import { api } from './client.js';

/**
 * Invia posizione corrente
 * POST /api/location
 * Body: { lat, lng, accuracy?, userId }
 * Response: { ok: true }
 */
export async function sendPosition(latitude, longitude, options = {}) {
  try {
    const res = await api('/api/locations', {
      method: 'POST',
      body: JSON.stringify({
        memberId: options.memberId,
        latitude,
        longitude,
        accuracy: options.accuracy,
        source: options.source || 'device',
        batteryLevel: options.batteryLevel,
        isMoving: options.isMoving,
        recordedAt: options.recordedAt,
      }),
    });
    return { ok: true, location: res.location || null };
  } catch {
    return { ok: false, location: null };
  }
}

/**
 * Posizioni membri famiglia
 * GET /api/families/:id/positions
 * Response: { positions: [{ memberId, lat, lng, lastUpdate }] }
 */
export async function getFamilyPositions() {
  try {
    const res = await api('/api/locations');
    return { positions: res.locations || [], ok: true };
  } catch {
    return { positions: [], ok: false };
  }
}

/**
 * Ultima posizione membro
 */
export async function getLatestMemberPosition(memberId) {
  try {
    const res = await api(`/api/locations/${memberId}/latest`);
    return { location: res.location || null, ok: true };
  } catch {
    return { location: null, ok: false };
  }
}

/**
 * WebSocket per posizioni live
 * ws://api/families/:id/positions
 * Messaggi: { type: 'position', memberId, lat, lng, ... }
 */
export function subscribeToPositions(familyId, onUpdate) {
  // TODO: const ws = new WebSocket(...); ws.onmessage = (e) => onUpdate(JSON.parse(e.data)); return () => ws.close();
  return () => {};
}
