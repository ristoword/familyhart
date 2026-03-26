/**
 * Costanti applicazione
 */

/** Ruoli membri famiglia */
export const MEMBER_ROLE = {
  ADMIN: 'admin',
  PARTNER: 'partner',
  CHILD: 'child',
  GUEST: 'guest',
};

/** Permessi applicazione - usati per visibilità UI e azioni */
export const PERMISSION = {
  SEE_ALL_POSITIONS: 'see_all_positions',
  RECEIVE_SOS: 'receive_sos',
  SEND_SOS: 'send_sos',
  USE_FAMILY_CHAT: 'use_family_chat',
  USE_PRIVATE_CHAT: 'use_private_chat',
  EDIT_SAFE_PLACES: 'edit_safe_places',
  INVITE_MEMBERS: 'invite_members',
  MANAGE_FAMILY_SETTINGS: 'manage_family_settings',
  MANAGE_MEMBERS: 'manage_members',
};

/** Stato account membro */
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  INACTIVE: 'inactive',
};

/** Credenziali demo - solo per sviluppo/test */
export const DEMO_CREDENTIALS = {
  email: 'demo@familyhart.it',
  password: 'demo123',
};

export const SESSION_KEY = 'familyhart_session';
export const CHAT_STORAGE_KEY = 'familyhart_chat';
export const SOS_STORAGE_KEY = 'familyhart_sos';
export const ALERTS_STORAGE_KEY = 'familyhart_alerts';
export const PLACES_STORAGE_KEY = 'familyhart_places';
export const GEOFENCE_STATE_KEY = 'familyhart_geofence_state';
export const GEOFENCE_EVENTS_KEY = 'familyhart_geofence_events';
export const MEMBERS_STORAGE_KEY = 'familyhart_members';
export const INVITES_STORAGE_KEY = 'familyhart_invites';
export const CALL_HISTORY_STORAGE_KEY = 'familyhart_call_history';
export const APPOINTMENTS_STORAGE_KEY = 'familyhart_appointments';
export const EVENTS_STORAGE_KEY = 'familyhart_events';

/** Tipo chiamata */
export const CALL_TYPE = {
  AUDIO: 'audio',
  VIDEO: 'video',
};

/** Stato chiamata */
export const CALL_STATE = {
  DIALING: 'dialing',
  RINGING: 'ringing',
  INCOMING: 'incoming',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ENDED: 'ended',
  FAILED: 'failed',
  DECLINED: 'declined',
  UNAVAILABLE: 'unavailable',
  PERMISSION_DENIED: 'permission_denied',
};

/** Stato partecipante in chiamata gruppo */
export const PARTICIPANT_STATE = {
  ONLINE: 'online',
  UNAVAILABLE: 'unavailable',
  IN_CALL: 'in_call',
};

/** Messaggi rapidi predefiniti chat */
export const QUICK_MESSAGES = [
  { id: 'arrived', text: 'Sono arrivato', icon: '✓' },
  { id: 'returning', text: 'Sto tornando', icon: '🏠' },
  { id: 'call', text: 'Chiamami', icon: '📞' },
  { id: 'ok', text: 'Tutto bene', icon: '👍' },
];

/** Tipi SOS */
export const SOS_TYPES = {
  SOS: 'SOS',
  CALL: 'Chiamami subito',
  HELP: 'Ho bisogno di aiuto',
  PICKUP: 'Vieni a prendermi',
  BATTERY: 'Batteria quasi scarica',
};
