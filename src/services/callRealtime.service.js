/**
 * Call Realtime - Orchestrazione WebRTC
 * Integra media, webrtc, signaling socket
 */
import * as media from './media.service.js';
import * as webrtc from './webrtc.service.js';
import * as socket from './socket.service.js';

let peerConnection = null;
let localStream = null;
let callIdRef = null;
let targetIdRef = null;
let memberIdRef = null;
let isGroupRef = false;
let iceCandidateQueue = [];
let callHandlers = null;
let pendingOffer = null; // offer in attesa (callee)

function cleanup() {
  if (peerConnection) {
    webrtc.closePeerConnection(peerConnection);
    peerConnection = null;
  }
  if (localStream) {
    media.stopStream(localStream);
    localStream = null;
  }
  callIdRef = null;
  targetIdRef = null;
  memberIdRef = null;
  isGroupRef = false;
  iceCandidateQueue = [];
  callHandlers = null;
  pendingOffer = null;
}

function flushIceCandidates() {
  if (!peerConnection) return;
  iceCandidateQueue.forEach((c) => webrtc.addIceCandidate(peerConnection, c));
  iceCandidateQueue = [];
}

/**
 * Avvia chiamata uscente: media -> call_start -> PC -> offer -> send
 */
export async function startOutgoingCall(
  { callId, targetId, targetName, type, isGroup },
  { memberId, callerName },
  handlers
) {
  if (callIdRef) throw new Error('Chiamata già in corso');
  if (!socket.isConnected()) throw new Error('Socket non connesso');

  callIdRef = callId;
  targetIdRef = targetId;
  memberIdRef = memberId;
  isGroupRef = !!isGroup;
  callHandlers = handlers;

  const videoEnabled = type === 'video';
  localStream = await media.requestMedia(true, videoEnabled);

  socket.webrtcCallStart({
    callId,
    targetId,
    targetName,
    type,
    isGroup,
    callerName,
  });

  peerConnection = webrtc.createPeerConnection(
    (remoteStream) => callHandlers?.onRemoteStream?.(remoteStream),
    (state) => {
      if (state === 'connected') {
        flushIceCandidates();
        callHandlers?.onConnected?.();
      } else if (['failed', 'disconnected', 'closed'].includes(state)) {
        callHandlers?.onConnectionFailed?.();
      }
    }
  );

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      socket.webrtcIceCandidate({ callId, toId: targetId, candidate: e.candidate });
    }
  };

  const offer = await webrtc.createOffer(peerConnection, localStream);
  socket.webrtcOffer({ callId, toId: targetId, sdp: offer });
}

/**
 * Buffer offer in arrivo (callee, prima di accept)
 */
export function storePendingOffer(callId, fromId, sdp) {
  pendingOffer = { callId, fromId, sdp };
}

/**
 * Accetta chiamata in arrivo (usa pendingOffer)
 */
export async function acceptIncomingCall(callId, fromId, type, memberId, handlers) {
  if (callIdRef) throw new Error('Chiamata già in corso');
  const offer = pendingOffer?.callId === callId ? pendingOffer : null;
  if (!offer) throw new Error('Offer non ricevuta, riprova');

  callIdRef = callId;
  targetIdRef = fromId;
  memberIdRef = memberId;
  callHandlers = handlers;
  pendingOffer = null;

  const videoEnabled = type === 'video';
  localStream = await media.requestMedia(true, videoEnabled);

  peerConnection = webrtc.createPeerConnection(
    (remoteStream) => callHandlers?.onRemoteStream?.(remoteStream),
    (state) => {
      if (state === 'connected') {
        flushIceCandidates();
        callHandlers?.onConnected?.();
      } else if (['failed', 'disconnected', 'closed'].includes(state)) {
        callHandlers?.onConnectionFailed?.();
      }
    }
  );

  peerConnection.onicecandidate = (e) => {
    if (e.candidate) {
      socket.webrtcIceCandidate({ callId, toId: fromId, candidate: e.candidate });
    }
  };

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer.sdp));
  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.webrtcCallAccept({ callId, targetId: fromId });
  socket.webrtcAnswer({ callId, toId: fromId, sdp: answer });
}

/**
 * Imposta answer remota (caller)
 */
export async function setRemoteAnswer(answerSdp) {
  if (!peerConnection) return;
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answerSdp));
  flushIceCandidates();
}

/**
 * Gestisce ICE candidate ricevuto
 */
export function addRemoteIceCandidate(candidate, callId) {
  if (String(callIdRef) !== String(callId)) return;
  if (peerConnection?.remoteDescription) {
    webrtc.addIceCandidate(peerConnection, candidate);
  } else {
    iceCandidateQueue.push(candidate);
  }
}

export function declineCall(callId, targetId) {
  socket.webrtcCallDecline({ callId, targetId });
  callIdRef = null;
}

export function endCall() {
  if (callIdRef) {
    socket.webrtcCallEnd({
      callId: callIdRef,
      targetId: targetIdRef,
      isGroup: isGroupRef,
    });
  }
  cleanup();
}

export function handleRemoteCallEnd(callId) {
  if (String(callIdRef) === String(callId)) {
    cleanup();
  }
}

export function toggleMute(muted) {
  if (!localStream) return;
  localStream.getAudioTracks().forEach((t) => { t.enabled = !muted; });
}

export function toggleVideo(videoOn) {
  if (!localStream) return;
  localStream.getVideoTracks().forEach((t) => { t.enabled = !!videoOn; });
}

export function getLocalStream() {
  return localStream;
}

export function isInCall() {
  return !!callIdRef;
}

export function getCurrentCallId() {
  return callIdRef;
}
