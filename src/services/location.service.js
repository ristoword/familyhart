/**
 * Location Service - GPS e posizione live
 *
 * Implementazione attuale: store/locationStore.js (permessi, posizione reale)
 * Simulazione membri: AppContext (liveMembers)
 *
 * TODO: Integrare con backend
 * - POST posizione utente a /api/locations
 * - WebSocket o polling per posizioni membri reali
 * - Reverse geocoding (OpenStreetMap Nominatim, Google Geocoding)
 */

import { requestAndGetPosition } from '../store/locationStore';

/**
 * Posizione corrente - delega a locationStore
 */
export async function getCurrentPosition() {
  const result = await requestAndGetPosition();
  return result.position || null;
}
