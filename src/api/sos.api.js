/**
 * SOS API - Placeholder per backend Node/Express
 *
 * Endpoint attesi:
 * - POST /api/sos
 * - GET /api/sos/events
 * - PATCH /api/sos/events/:id/resolve
 */

/**
 * Invia SOS
 * POST /api/sos
 * Body: { type, memberId, position?: { lat, lng } }
 * Response: { event: { id, type, timestamp, ... } }
 */
export async function sendSOS(type, memberId, position = null) {
  // TODO: return fetch('/api/sos', { method: 'POST', body: JSON.stringify({ type, memberId, position }) })
  return { event: null };
}

/**
 * Eventi SOS famiglia
 * GET /api/sos/events?familyId=...
 * Response: { events: [...] }
 */
export async function getSOSEvents(familyId) {
  // TODO: return fetch(`/api/sos/events?familyId=${familyId}`).then(r => r.json())
  return { events: [] };
}

/**
 * Segna evento come risolto
 * PATCH /api/sos/events/:id/resolve
 * Body: { resolved: true }
 */
export async function resolveSOSEvent(eventId) {
  // TODO: return fetch(`/api/sos/events/${eventId}/resolve`, { method: 'PATCH', body: JSON.stringify({ resolved: true }) })
  return {};
}
