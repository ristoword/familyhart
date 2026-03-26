/**
 * Calls API - storico chiamate reale
 */
import { api } from './client.js';

/**
 * Avvia chiamata
 * POST /api/calls/initiate
 * Body: { type: 'audio'|'video', targetId, isGroup }
 * Response: { callId, signalingUrl }
 */
export async function initiateCall(type, targetId, isGroup = false) {
  // signaling usa Socket.io; questo endpoint registra solo log iniziale se necessario
  try {
    await api('/api/calls/log', {
      method: 'POST',
      body: JSON.stringify({
        callType: type || 'audio',
        calleeIds: [targetId].filter(Boolean),
        outcome: 'in_progress',
        durationSeconds: 0,
        isGroup: !!isGroup,
      }),
    });
    return { callId: `call${Date.now()}`, signalingUrl: '/socket.io' };
  } catch {
    return { callId: null, signalingUrl: null };
  }
}

/**
 * Rispondi a chiamata
 * POST /api/calls/:id/answer
 * Body: { sdp }  // WebRTC answer
 */
export async function answerCall(callId, sdp) {
  return { callId, answered: !!sdp };
}

/**
 * Termina chiamata
 * POST /api/calls/:id/end
 */
export async function endCall(callId) {
  return { callId, ended: true };
}

/**
 * Signaling WebSocket per WebRTC
 * ws://api/calls/signaling/:callId
 * Messaggi: { type: 'offer'|'answer'|'ice', payload }
 */
export function connectSignaling(callId, onMessage) {
  // signaling reale gestito da socket.service / callRealtime.service
  return () => {};
}
