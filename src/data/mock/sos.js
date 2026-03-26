/**
 * Mock - Cronologia eventi SOS
 * Sostituire con dati da sos.service / backend
 */

export const sosHistory = [
  {
    id: 'sos1',
    memberId: '2',
    memberName: 'Laura',
    type: 'Vieni a prendermi',
    time: '12:05 oggi',
    resolved: true,
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'sos2',
    memberId: '4',
    memberName: 'Luca',
    type: 'Batteria quasi scarica',
    time: 'Ieri 18:30',
    resolved: true,
    timestamp: Date.now() - 172800000,
  },
];
