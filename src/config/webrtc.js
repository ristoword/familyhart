/**
 * WebRTC config - STUN/TURN
 * Sviluppo: STUN pubblico. Produzione: aggiungere TURN (vedi README)
 */
const STUN_URL = import.meta.env.VITE_STUN_URL || 'stun:stun.l.google.com:19302';
const TURN_URL = import.meta.env.VITE_TURN_URL || '';
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME || '';
const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL || '';

const iceServers = [{ urls: STUN_URL }, { urls: 'stun:stun1.l.google.com:19302' }];

if (TURN_URL) {
  iceServers.push({
    urls: TURN_URL,
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  });
}

export const ICE_SERVERS = iceServers;

export const CALL_TIMEOUT_MS = 45000; // Timeout chiamata non risposta
export const MAX_GROUP_PARTICIPANTS = 4; // Limite V1 chiamate gruppo
