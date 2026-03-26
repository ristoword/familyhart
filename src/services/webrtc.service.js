/**
 * WebRTC - Peer connection, offer/answer, ICE
 * Usa signaling via socket.service
 */
import { ICE_SERVERS } from '../config/webrtc.js';

export function createPeerConnection(onRemoteStream, onConnectionStateChange) {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  pc.ontrack = (e) => {
    if (e.streams?.[0] && onRemoteStream) onRemoteStream(e.streams[0]);
  };

  pc.onconnectionstatechange = () => {
    if (onConnectionStateChange) onConnectionStateChange(pc.connectionState);
  };

  pc.oniceconnectionstatechange = () => {
    if (onConnectionStateChange && pc.iceConnectionState === 'failed') {
      onConnectionStateChange('failed');
    }
  };

  return pc;
}

export async function createOffer(pc, localStream) {
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}

export async function createAnswer(pc, offer, localStream) {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

export async function setRemoteAnswer(pc, answer) {
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

export function addIceCandidate(pc, candidate) {
  if (!candidate) return Promise.resolve();
  return pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
}

export function closePeerConnection(pc) {
  if (!pc) return;
  pc.close();
}
