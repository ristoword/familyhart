/**
 * LocationBanner - Messaggi permesso posizione
 * Mostra stato: negato, non disponibile, errore
 */

import { LOCATION_PERMISSION } from '../utils/location';

const MESSAGES = {
  [LOCATION_PERMISSION.DENIED]: 'Permesso posizione negato. Abilita nelle impostazioni per vedere la tua posizione.',
  [LOCATION_PERMISSION.UNAVAILABLE]: 'Geolocalizzazione non supportata su questo dispositivo.',
};

export default function LocationBanner({ permission, error, onRetry }) {
  const show = permission === LOCATION_PERMISSION.DENIED ||
    permission === LOCATION_PERMISSION.UNAVAILABLE ||
    (error && permission !== LOCATION_PERMISSION.GRANTED);

  if (!show) return null;

  const text = error || MESSAGES[permission] || MESSAGES[LOCATION_PERMISSION.DENIED];

  return (
    <div className="location-banner">
      <span className="location-banner-icon">📍</span>
      <p className="location-banner-text">{text}</p>
      {permission !== LOCATION_PERMISSION.UNAVAILABLE && onRetry && (
        <button type="button" className="location-banner-btn" onClick={onRetry}>
          Riprova
        </button>
      )}
    </div>
  );
}
