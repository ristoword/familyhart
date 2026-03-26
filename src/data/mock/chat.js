/**
 * Mock - Messaggi chat famiglia
 * Sostituire con dati da chat.service / WebSocket / backend
 */

export const chatMessages = [
  {
    id: 'm1',
    memberId: '2',
    memberName: 'Laura',
    text: 'Ragazzi, ricordatevi di fare i compiti! 📚',
    time: '10:32',
    isOwn: false,
  },
  {
    id: 'm2',
    memberId: '1',
    memberName: 'Marco',
    text: 'Ci penso io stasera 👍',
    time: '10:35',
    isOwn: true,
  },
  {
    id: 'm3',
    memberId: '3',
    memberName: 'Giulia',
    text: 'Io ho finito! 🎉',
    time: '10:38',
    isOwn: false,
  },
  {
    id: 'm4',
    memberId: '4',
    memberName: 'Luca',
    text: 'Mamma, posso uscire con gli amici?',
    time: '14:15',
    isOwn: false,
  },
  {
    id: 'm5',
    memberId: '2',
    memberName: 'Laura',
    text: 'Fino alle 19, niente più tardi! ⏰',
    time: '14:18',
    isOwn: false,
  },
];
