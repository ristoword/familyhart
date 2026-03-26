/**
 * Family Hart - Contratti dati (schemi)
 *
 * Definizioni centralizzate dei modelli usati nell'app.
 * Coerenti con stato centrale, mock e futuri payload API.
 */

/** @typedef {Object} User - Utente autenticato */
/** @typedef {string} User.id */
/** @typedef {string} User.name */
/** @typedef {string} User.email */
/** @typedef {string} User.avatar */
/** @typedef {string} User.roleType - admin | partner | child | guest */
/** @typedef {string[]} User.permissions */

/** @typedef {Object} Member - Membro famiglia */
/** @typedef {string} Member.id */
/** @typedef {string} Member.name */
/** @typedef {string} [Member.surname] */
/** @typedef {string} Member.role */
/** @typedef {string} Member.roleType */
/** @typedef {string} [Member.email] */
/** @typedef {string} [Member.phone] */
/** @typedef {string} Member.avatar */
/** @typedef {string} Member.accountStatus - active | pending | inactive */
/** @typedef {boolean} Member.locationSharingEnabled */
/** @typedef {string[]} Member.permissions */
/** @typedef {number} [Member.lat] */
/** @typedef {number} [Member.lng] */
/** @typedef {string} [Member.status] */
/** @typedef {number} [Member.battery] */
/** @typedef {string} [Member.lastUpdate] */
/** @typedef {string} [Member.location] */

/** @typedef {Object} Position - Posizione */
/** @typedef {number} Position.lat */
/** @typedef {number} Position.lng */
/** @typedef {number} [Position.accuracy] */
/** @typedef {Date} [Position.lastUpdate] */

/** @typedef {Object} SafePlace - Luogo sicuro (geofence) */
/** @typedef {string} SafePlace.id */
/** @typedef {string} SafePlace.name */
/** @typedef {string} SafePlace.address */
/** @typedef {number} SafePlace.lat */
/** @typedef {number} SafePlace.lng */
/** @typedef {number} SafePlace.radius */
/** @typedef {string[]} SafePlace.memberIds */
/** @typedef {boolean} SafePlace.notifyEntry */
/** @typedef {boolean} SafePlace.notifyExit */

/** @typedef {Object} GeofenceEvent - Evento entrata/uscita */
/** @typedef {string} GeofenceEvent.id */
/** @typedef {string} GeofenceEvent.memberId */
/** @typedef {string} GeofenceEvent.memberName */
/** @typedef {string} GeofenceEvent.placeId */
/** @typedef {string} GeofenceEvent.placeName */
/** @typedef {string} GeofenceEvent.type - entry | exit */
/** @typedef {number} GeofenceEvent.timestamp */

/** @typedef {Object} Message - Messaggio chat */
/** @typedef {string} Message.id */
/** @typedef {string} Message.memberId */
/** @typedef {string} Message.memberName */
/** @typedef {string} Message.text */
/** @typedef {string} Message.time */
/** @typedef {number} Message.timestamp */
/** @typedef {boolean} Message.isOwn */
/** @typedef {string} Message.conversationId */

/** @typedef {Object.<string, Message[]>} Conversations - conversationId -> messages */

/** @typedef {Object} SOSEvent - Evento SOS */
/** @typedef {string} SOSEvent.id */
/** @typedef {string} SOSEvent.memberId */
/** @typedef {string} SOSEvent.memberName */
/** @typedef {string} SOSEvent.type */
/** @typedef {string} SOSEvent.time */
/** @typedef {number} SOSEvent.timestamp */
/** @typedef {boolean} SOSEvent.resolved */
/** @typedef {{lat: number, lng: number}|null} [SOSEvent.position] */

/** @typedef {Object} Alert - Avviso/notifica */
/** @typedef {string} Alert.id */
/** @typedef {string} Alert.type - position | safety | battery | chat */
/** @typedef {string} Alert.title */
/** @typedef {string} Alert.message */
/** @typedef {string} Alert.time */
/** @typedef {number} Alert.timestamp */
/** @typedef {boolean} Alert.read */
/** @typedef {string} Alert.icon */

/** @typedef {Object} Call - Chiamata attiva */
/** @typedef {string} Call.id */
/** @typedef {string} Call.type - audio | video */
/** @typedef {string} Call.targetId */
/** @typedef {string} Call.targetName */
/** @typedef {boolean} Call.isGroup */
/** @typedef {Object[]} Call.participants */
/** @typedef {string} Call.state - dialing | ringing | connected | ended */
/** @typedef {number} Call.startTime */
/** @typedef {number} Call.duration */
/** @typedef {boolean} Call.muted */
/** @typedef {boolean} Call.speaker */
/** @typedef {boolean} Call.videoOn */

/** @typedef {Object} CallHistoryEntry - Voce storico chiamate */
/** @typedef {string} CallHistoryEntry.id */
/** @typedef {string} CallHistoryEntry.targetName */
/** @typedef {string} CallHistoryEntry.type */
/** @typedef {number} CallHistoryEntry.startTime */
/** @typedef {number} CallHistoryEntry.duration */
/** @typedef {string} CallHistoryEntry.outcome - completed | no_answer | cancelled | in_progress */

export {};
