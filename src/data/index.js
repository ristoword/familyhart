/**
 * Family Hart - Dati centralizzati
 * Punto di ingresso unico per tutti i mock data.
 * Le pagine importano da qui; i services useranno questi dati
 * finché non si collega il backend reale.
 */

export { MEMBER_STATUS, familyGroup, familyMembers } from './mock/family';
export { currentUser } from './mock/users';
export { chatMessages } from './mock/chat';
export { notifications } from './mock/notifications';
export { safePlaces } from './mock/safePlaces';
export { sosHistory } from './mock/sos';
