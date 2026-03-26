/**
 * Call Service - Chiamate audio/video
 *
 * Stato attuale: chiamate simulate lato front-end.
 * Gestione stato centralizzata in AppContext.
 *
 * Le funzioni placeholder hanno parametri prefissati con _ (intenzionalmente non usati).
 */

/* eslint-disable no-unused-vars -- placeholder WebRTC, params per signature futura */

// TODO WebRTC reale: Signaling, getUserMedia, RTCPeerConnection, ICE, TURN/STUN

import { CALL_TYPE, CALL_STATE, PARTICIPANT_STATE } from '../data/constants';

/**
 * Placeholder per creare RTCPeerConnection
 * TODO: new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
 */
export function createPeerConnection(_remoteUserId) {
  // TODO: return new RTCPeerConnection(config);
  return null;
}

/**
 * Placeholder per ottenere stream locale (microfono/camera)
 * TODO: navigator.mediaDevices.getUserMedia({ audio: true, video: videoEnabled })
 */
export function getLocalStream(videoEnabled = false) {
  // TODO: return navigator.mediaDevices.getUserMedia({ audio: true, video: videoEnabled });
  return Promise.resolve(null);
}

/**
 * Placeholder per inviare offer SDP al peer
 * TODO: signaling.send({ type: 'offer', sdp: await pc.createOffer() })
 */
export function sendOffer(_peerConnection, _remoteUserId) {
  // TODO: peerConnection.createOffer().then(offer => ...)
  return Promise.resolve();
}

/**
 * Placeholder per rispondere con answer
 * TODO: signaling.send({ type: 'answer', sdp: await pc.createAnswer() })
 */
export function sendAnswer(_peerConnection, _offer) {
  // TODO: peerConnection.setRemoteDescription(offer).then(() => pc.createAnswer())
  return Promise.resolve();
}

/**
 * Placeholder per gestire ICE candidate
 * TODO: pc.onicecandidate = (e) => e.candidate && signaling.send({ type: 'ice', candidate: e.candidate })
 */
export function handleIceCandidate(_peerConnection, _onCandidate) {
  // TODO: peerConnection.onicecandidate = onCandidate;
}

/**
 * Placeholder per gestire stream remoto
 * TODO: pc.ontrack = (e) => onRemoteStream(e.streams[0])
 */
export function handleRemoteStream(_peerConnection, _onStream) {
  // TODO: peerConnection.ontrack = (e) => onStream(e.streams[0]);
}

/**
 * Placeholder per cleanup connessione
 * TODO: pc.close(); localStream.getTracks().forEach(t => t.stop())
 */
export function cleanupCall(_peerConnection, _localStream) {
  // TODO: peerConnection?.close(); localStream?.getTracks().forEach(t => t.stop());
}

/**
 * Crea oggetto chiamata per stato centrale
 */
export function createCallPayload({ type, targetId, targetName, isGroup, participants }) {
  return {
    id: `call${Date.now()}`,
    type: type || CALL_TYPE.AUDIO,
    targetId: targetId || 'family',
    targetName: targetName || 'Famiglia',
    isGroup: !!isGroup,
    participants: participants || [],
    state: CALL_STATE.DIALING,
    startTime: Date.now(),
    duration: 0,
    muted: false,
    speaker: true,
    videoOn: type === CALL_TYPE.VIDEO,
  };
}

/**
 * Crea partecipante demo per chiamata gruppo
 */
export function createParticipant(member, state = PARTICIPANT_STATE.ONLINE) {
  return {
    id: member.id,
    name: member.name,
    avatar: member.avatar,
    state,
  };
}
