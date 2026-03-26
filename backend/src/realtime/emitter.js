/**
 * Emitter realtime - usato da services per notificare via socket
 * Popolato da socket.js all'avvio
 */
let _emit = null;

export function setRealtimeEmitter(emit) {
  _emit = emit;
}

export function emitNewNotification(familyId, notification) {
  _emit?.newNotification?.(familyId, notification);
}

export function emitAppointmentCreated(familyId, appointment) {
  _emit?.appointmentCreated?.(familyId, appointment);
}

export function emitAppointmentUpdated(familyId, appointment) {
  _emit?.appointmentUpdated?.(familyId, appointment);
}

export function emitAppointmentDeleted(familyId, id) {
  _emit?.appointmentDeleted?.(familyId, id);
}

export function emitEventCreated(familyId, event) {
  _emit?.eventCreated?.(familyId, event);
}

export function emitEventUpdated(familyId, event) {
  _emit?.eventUpdated?.(familyId, event);
}

export function emitEventDeleted(familyId, id) {
  _emit?.eventDeleted?.(familyId, id);
}
