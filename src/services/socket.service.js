/**
 * Socket.io client - Realtime Family Hart
 * Connessione, reconnect, eventi. Fallback su polling se socket non funziona.
 */
import { io } from 'socket.io-client';
import { getToken } from '../api/client.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? '';

function getBaseUrl() {
  if (SOCKET_URL) return SOCKET_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

let socket = null;
let connected = false;
let connecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT = 10;
const RECONNECT_DELAY_MS = 2000;
const isDev = import.meta.env.DEV;

const listeners = {
  connect: [],
  disconnect: [],
  receive_message: [],
  receive_sos: [],
  receive_location_update: [],
  receive_geofence_event: [],
  receive_notification: [],
  appointment_created: [],
  appointment_updated: [],
  appointment_deleted: [],
  event_created: [],
  event_updated: [],
  event_deleted: [],
  webrtc_call_start: [],
  webrtc_call_accept: [],
  webrtc_call_decline: [],
  webrtc_call_end: [],
  webrtc_offer: [],
  webrtc_answer: [],
  webrtc_ice_candidate: [],
  webrtc_call_start_unreachable: [],
};

function notify(event, data) {
  (listeners[event] || []).forEach((cb) => {
    try {
      cb(data);
    } catch (e) {
      if (isDev) console.warn('[socket] listener error', event, e);
    }
  });
}

export function isConnected() {
  return connected && socket?.connected;
}

export function connect() {
  if (socket?.connected) return socket;
  if (socket && !socket.connected && connecting) return socket;
  const token = getToken();
  if (!token) return null;

  const url = getBaseUrl();
  if (!url) return null;

  try {
    if (socket && !socket.connected) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    connecting = true;
    socket = io(url, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT,
      reconnectionDelay: RECONNECT_DELAY_MS,
    });

    socket.on('connect', () => {
      connected = true;
      connecting = false;
      reconnectAttempts = 0;
      notify('connect', null);
    });

    socket.on('disconnect', (reason) => {
      connected = false;
      connecting = false;
      notify('disconnect', reason);
    });

    socket.on('receive_message', (data) => notify('receive_message', data));
    socket.on('receive_sos', (data) => notify('receive_sos', data));
    socket.on('receive_location_update', (data) => notify('receive_location_update', data));
    socket.on('receive_geofence_event', (data) => notify('receive_geofence_event', data));
    socket.on('receive_notification', (data) => notify('receive_notification', data));
    socket.on('appointment_created', (data) => notify('appointment_created', data));
    socket.on('appointment_updated', (data) => notify('appointment_updated', data));
    socket.on('appointment_deleted', (data) => notify('appointment_deleted', data));
    socket.on('event_created', (data) => notify('event_created', data));
    socket.on('event_updated', (data) => notify('event_updated', data));
    socket.on('event_deleted', (data) => notify('event_deleted', data));
    socket.on('webrtc_call_start', (data) => notify('webrtc_call_start', data));
    socket.on('webrtc_call_accept', (data) => notify('webrtc_call_accept', data));
    socket.on('webrtc_call_decline', (data) => notify('webrtc_call_decline', data));
    socket.on('webrtc_call_end', (data) => notify('webrtc_call_end', data));
    socket.on('webrtc_offer', (data) => notify('webrtc_offer', data));
    socket.on('webrtc_answer', (data) => notify('webrtc_answer', data));
    socket.on('webrtc_ice_candidate', (data) => notify('webrtc_ice_candidate', data));
    socket.on('webrtc_call_start_unreachable', (data) => notify('webrtc_call_start_unreachable', data));

    socket.on('connect_error', () => {
      connecting = false;
      reconnectAttempts++;
    });

    return socket;
  } catch (e) {
    connecting = false;
    if (isDev) console.warn('[socket] connect error', e);
    return null;
  }
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  connected = false;
  connecting = false;
}

export function on(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
  return () => {
    listeners[event] = listeners[event].filter((cb) => cb !== callback);
  };
}

export function off(event, callback) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter((cb) => cb !== callback);
}

export function sendMessage(conversationId, text) {
  if (!socket?.connected) return Promise.resolve({ error: 'Socket non connesso' });
  return new Promise((resolve) => {
    socket.emit('send_message', { conversationId, text }, (res) => resolve(res || {}));
  });
}

export function sendSos(data) {
  if (!socket?.connected) return;
  socket.emit('send_sos', data);
}

export function updateLocation(data) {
  if (!socket?.connected) return;
  socket.emit('update_location', data);
}

export function geofenceEvent(data) {
  if (!socket?.connected) return;
  socket.emit('geofence_event', data);
}

/* WebRTC Signaling */
export function webrtcCallStart(data) {
  if (!socket?.connected) return;
  socket.emit('webrtc_call_start', data);
}

export function webrtcCallAccept(data) {
  if (!socket?.connected) return;
  socket.emit('webrtc_call_accept', data);
}

export function webrtcCallDecline(data) {
  if (!socket?.connected) return;
  socket.emit('webrtc_call_decline', data);
}

export function webrtcCallEnd(data) {
  if (!socket?.connected) return;
  socket.emit('webrtc_call_end', data);
}

export function webrtcOffer(data) {
  if (!socket?.connected) return;
  socket.emit('webrtc_offer', data);
}

export function webrtcAnswer(data) {
  if (!socket?.connected) return;
  socket.emit('webrtc_answer', data);
}

export function webrtcIceCandidate(data) {
  if (!socket?.connected) return;
  socket.emit('webrtc_ice_candidate', data);
}
