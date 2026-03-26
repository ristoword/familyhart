/**
 * Utilità posizione e geolocalizzazione
 * TODO: Integrare reverse geocoding per indirizzi (es. OpenStreetMap Nominatim)
 */

/** Stati permesso posizione */
export const LOCATION_PERMISSION = {
  GRANTED: 'granted',
  DENIED: 'denied',
  PROMPT: 'prompt',
  UNAVAILABLE: 'unavailable',
};

/**
 * Verifica se la geolocalizzazione è supportata dal browser
 * Fallback: su desktop o browser senza API ritorna false
 */
export function isGeolocationSupported() {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Formatta "ultimo aggiornamento" in testo relativo
 * @param {Date} date
 * @returns {string}
 */
export function formatLastUpdate(date) {
  if (!(date instanceof Date)) return '—';
  const now = new Date();
  const sec = Math.floor((now - date) / 1000);
  if (sec < 10) return 'ora';
  if (sec < 60) return `${sec} sec fa`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min fa`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} h fa`;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

/**
 * Formatta lat/lng per visualizzazione
 * @param {number} lat
 * @param {number} lng
 * @returns {string}
 */
export function formatCoords(lat, lng) {
  if (lat == null || lng == null) return '—';
  return `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`;
}

/**
 * Calcola posizione percentuale su mappa da lat/lng
 * TODO: Sostituire con proiezione reale (Leaflet, Mapbox) quando si integra mappa vera
 * @param {number} lat
 * @param {number} lng
 * @param {object} bounds - { minLat, maxLat, minLng, maxLng }
 * @returns {{ left: string, top: string }}
 */
export function latLngToMapPosition(lat, lng, bounds) {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  const rangeLat = maxLat - minLat || 0.01;
  const rangeLng = maxLng - minLng || 0.01;
  const left = 10 + ((lng - minLng) / rangeLng) * 80;
  const top = 10 + ((maxLat - lat) / rangeLat) * 80;
  return {
    left: `${Math.max(5, Math.min(95, left))}%`,
    top: `${Math.max(5, Math.min(95, top))}%`,
  };
}
