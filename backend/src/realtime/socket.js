/**
 * Socket.io - Realtime Family Hart
 * Stanze per famiglia, eventi chat, SOS, posizione, geofence, notifiche, appuntamenti, eventi
 */
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import * as emitter from './emitter.js';
import * as convRepo from '../repositories/conversationRepository.js';
import * as familyRepo from '../repositories/familyRepository.js';
import * as locationService from '../services/locationService.js';
import * as pushService from '../services/pushService.js';

/** Minimo intervallo tra update_location accettati per socket (anti-spam / carico) */
const LOCATION_SOCKET_MIN_INTERVAL_MS = parseInt(process.env.LOCATION_SOCKET_MIN_INTERVAL_MS || '2500', 10);

function getUserFromToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    return payload;
  } catch {
    return null;
  }
}

function getMemberIdForUser(userId, familyId) {
  const members = familyRepo.getMembersByFamilyId(familyId);
  const m = members.find((x) => x.userId === userId) || members.find((x) => x.id === userId);
  return m?.id || userId;
}

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: true, credentials: true },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (!user?.id || !user?.familyId) {
      return next(new Error('Auth required'));
    }
    socket.userId = user.id;
    socket.familyId = user.familyId;
    socket.memberId = getMemberIdForUser(user.id, user.familyId);
    next();
  });

  io.on('connection', (socket) => {
    const room = `family_${socket.familyId}`;
    socket.join(room);
    let lastLocationAt = 0;
    // eslint-disable-next-line no-console
    console.log(`[rt] socket_connect family=${socket.familyId} member=${socket.memberId}`);

    socket.on('join_conversation', (conversationId, cb) => {
      socket.join(`conv_${conversationId}`);
      cb?.(true);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('send_message', async (data, cb) => {
      const { conversationId, text } = data || {};
      if (!conversationId || !text?.trim()) {
        cb?.({ error: 'conversationId e text richiesti' });
        return;
      }
      try {
        convRepo.getOrCreateFamilyConversation(socket.familyId);
        if (conversationId !== 'family') {
          convRepo.getOrCreateConversation(conversationId, socket.familyId);
        }
        const msg = convRepo.insertMessage(conversationId, socket.memberId, text.trim(), socket.familyId);
        if (msg) {
          const member = familyRepo.getMemberById(socket.memberId, socket.familyId);
          const payload = {
            ...msg,
            memberName: member?.name || 'Utente',
            time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
          };
          io.to(room).emit('receive_message', { conversationId, message: payload });
          cb?.({ ok: true, message: payload });
        } else {
          cb?.({ error: 'Conversazione non trovata' });
        }
      } catch (err) {
        cb?.({ error: err.message });
      }
    });

    socket.on('send_sos', (data) => {
      const payload = {
        id: `sos${Date.now()}`,
        memberId: socket.memberId,
        memberName: data?.memberName || 'Membro',
        type: data?.type || 'sos',
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        resolved: false,
        position: data?.position || null,
      };
      // eslint-disable-next-line no-console
      console.log(`[rt] sos family=${socket.familyId} member=${socket.memberId} type=${payload.type}`);
      io.to(room).emit('receive_sos', payload);
      pushService.sendToFamily(socket.familyId, {
        type: 'sos',
        title: `SOS da ${payload.memberName}`,
        body: payload.type,
      }).catch(() => {});
    });

    socket.on('update_location', (data) => {
      if (data?.latitude == null || data?.longitude == null) return;
      const now = Date.now();
      if (now - lastLocationAt < LOCATION_SOCKET_MIN_INTERVAL_MS) return;
      lastLocationAt = now;
      try {
        const input = {
          memberId: socket.memberId,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          source: data.source || 'device',
          batteryLevel: data.batteryLevel,
          isMoving: data.isMoving,
        };
        locationService.saveLocation(input, socket.familyId);
        const payload = {
          memberId: socket.memberId,
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
          recordedAt: new Date().toISOString(),
          batteryLevel: input.batteryLevel,
          isMoving: input.isMoving,
        };
        socket.to(room).emit('receive_location_update', payload);
      } catch {
        /* ignore */
      }
    });

    /* WebRTC Signaling - instrada a destinatari nella famiglia */
    const emitToMember = (memberId, event, data) => {
      for (const [, s] of io.sockets.sockets) {
        if (s.familyId === socket.familyId && String(s.memberId) === String(memberId)) {
          s.emit(event, data);
          return;
        }
      }
      socket.emit(`${event}_unreachable`, { ...data, memberId });
    };

    const emitToFamily = (event, data) => {
      io.to(room).emit(event, data);
    };

    socket.on('webrtc_call_start', (data) => {
      const { callId, targetId, targetName, type, isGroup } = data || {};
      if (!callId) return;
      const payload = {
        callId,
        callerId: socket.memberId,
        callerName: data.callerName || 'Membro',
        targetId: targetId || 'family',
        targetName: targetName || 'Famiglia',
        type: type || 'audio',
        isGroup: !!isGroup,
      };
      // eslint-disable-next-line no-console
      console.log(`[rt] call_start family=${socket.familyId} callId=${callId} from=${socket.memberId} to=${targetId || 'family'}`);
      if (isGroup) {
        emitToFamily('webrtc_call_start', payload);
      } else {
        emitToMember(targetId, 'webrtc_call_start', payload);
      }
      pushService.sendToFamily(socket.familyId, {
        type: 'call',
        title: `Chiamata in arrivo da ${payload.callerName}`,
        body: payload.type === 'video' ? 'Videochiamata' : 'Chiamata audio',
      }).catch(() => {});
    });

    socket.on('webrtc_call_accept', (data) => {
      const { callId, targetId } = data || {};
      if (!callId) return;
      const payload = { callId, calleeId: socket.memberId };
      if (targetId) emitToMember(targetId, 'webrtc_call_accept', payload);
      else emitToFamily('webrtc_call_accept', payload);
    });

    socket.on('webrtc_call_decline', (data) => {
      const { callId, targetId } = data || {};
      if (!callId) return;
      const payload = { callId, calleeId: socket.memberId };
      if (targetId) emitToMember(targetId, 'webrtc_call_decline', payload);
      else emitToFamily('webrtc_call_decline', payload);
    });

    socket.on('webrtc_call_end', (data) => {
      const { callId, targetId, isGroup } = data || {};
      if (!callId) return;
      const payload = { callId, fromId: socket.memberId };
      // eslint-disable-next-line no-console
      console.log(`[rt] call_end family=${socket.familyId} callId=${callId} from=${socket.memberId}`);
      if (isGroup) emitToFamily('webrtc_call_end', payload);
      else if (targetId) emitToMember(targetId, 'webrtc_call_end', payload);
    });

    socket.on('webrtc_offer', (data) => {
      const { callId, toId } = data || {};
      if (!callId || !toId) return;
      emitToMember(toId, 'webrtc_offer', { ...data, fromId: socket.memberId });
    });

    socket.on('webrtc_answer', (data) => {
      const { callId, toId } = data || {};
      if (!callId || !toId) return;
      emitToMember(toId, 'webrtc_answer', { ...data, fromId: socket.memberId });
    });

    socket.on('webrtc_ice_candidate', (data) => {
      const { callId, toId } = data || {};
      if (!callId || !toId) return;
      emitToMember(toId, 'webrtc_ice_candidate', { ...data, fromId: socket.memberId });
    });

    socket.on('geofence_event', (data) => {
      if (!data?.safePlaceId || !data?.eventType) return;
      try {
        const result = locationService.saveGeofenceEvent(
          {
            memberId: socket.memberId,
            safePlaceId: data.safePlaceId,
            eventType: data.eventType,
          },
          socket.familyId
        );
        const member = familyRepo.getMemberById(socket.memberId, socket.familyId);
        const payload = {
          id: result.id,
          memberId: socket.memberId,
          safePlaceId: data.safePlaceId,
          eventType: data.eventType,
          createdAt: new Date().toISOString(),
          memberName: member?.name || 'Membro',
        };
        io.to(room).emit('receive_geofence_event', payload);
      } catch {
        /* ignore */
      }
    });

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`[rt] socket_disconnect family=${socket.familyId} member=${socket.memberId}`);
    });
  });

  const socketEmit = {
    newNotification: (familyId, n) => io.to(`family_${familyId}`).emit('receive_notification', n),
    appointmentCreated: (familyId, a) => io.to(`family_${familyId}`).emit('appointment_created', a),
    appointmentUpdated: (familyId, a) => io.to(`family_${familyId}`).emit('appointment_updated', a),
    appointmentDeleted: (familyId, id) => io.to(`family_${familyId}`).emit('appointment_deleted', { id }),
    eventCreated: (familyId, e) => io.to(`family_${familyId}`).emit('event_created', e),
    eventUpdated: (familyId, e) => io.to(`family_${familyId}`).emit('event_updated', e),
    eventDeleted: (familyId, id) => io.to(`family_${familyId}`).emit('event_deleted', { id }),
  };
  emitter.setRealtimeEmitter(socketEmit);

  return { io, emitToFamily: (familyId, event, data) => io.to(`family_${familyId}`).emit(event, data) };
}
