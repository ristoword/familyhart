/**
 * Geofence Events API - backend reale con fallback
 */
import { api } from './client.js';

/**
 * Luoghi sicuri famiglia
 * GET /api/families/:id/safe-places
 * Response: { places: [...] }
 */
export async function getGeofenceEvents(limit = 100) {
  try {
    const res = await api(`/api/geofence-events?limit=${limit}`);
    return { events: res.events || [], ok: true };
  } catch {
    return { events: [], ok: false };
  }
}

/**
 * Aggiungi luogo sicuro
 * POST /api/families/:id/safe-places
 * Body: { name, address, lat, lng, radius, memberIds, notifyEntry, notifyExit }
 */
export async function createGeofenceEvent(payload) {
  try {
    const res = await api('/api/geofence-events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { ok: true, id: res.id };
  } catch {
    return { ok: false, id: null };
  }
}
