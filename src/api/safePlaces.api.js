/**
 * Safe Places API - Backend reale
 */
import { api } from './client.js';

/**
 * Luoghi sicuri
 * GET /api/safe-places
 */
export async function getSafePlaces() {
  const data = await api('/api/safe-places');
  return { places: data.places || [] };
}

/**
 * Aggiungi luogo sicuro
 * POST /api/safe-places
 */
export async function addSafePlace(place) {
  return api('/api/safe-places', {
    method: 'POST',
    body: JSON.stringify(place),
  });
}

/**
 * Aggiorna luogo sicuro
 * PATCH /api/safe-places/:id
 */
export async function updateSafePlace(placeId, data) {
  return api(`/api/safe-places/${placeId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Rimuovi luogo sicuro
 * DELETE /api/safe-places/:id
 */
export async function removeSafePlace(placeId) {
  return api(`/api/safe-places/${placeId}`, { method: 'DELETE' });
}
