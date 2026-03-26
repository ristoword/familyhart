/**
 * Mock - Avvisi e notifiche
 * Sostituire con dati da notifications.service / push / backend
 */

export const notifications = [
  {
    id: 'n1',
    type: 'position',
    title: 'Giulia è arrivata a scuola',
    message: 'Liceo Scientifico Galileo - 08:45',
    time: '08:45',
    read: false,
    icon: '🏫',
  },
  {
    id: 'n2',
    type: 'position',
    title: 'Marco ha lasciato casa',
    message: 'In viaggio verso l\'ufficio - 07:30',
    time: '07:30',
    read: false,
    icon: '🚗',
  },
  {
    id: 'n3',
    type: 'battery',
    title: 'Luca batteria al 10%',
    message: 'Considera di ricaricare il dispositivo',
    time: '14:22',
    read: false,
    icon: '🔋',
  },
  {
    id: 'n4',
    type: 'safety',
    title: 'SOS inviato',
    message: 'Laura ha richiesto assistenza - 12:05',
    time: '12:05',
    read: true,
    icon: '🆘',
  },
  {
    id: 'n5',
    type: 'chat',
    title: 'Nuovo messaggio da Marco',
    message: 'A che ora tornate stasera?',
    time: '17:50',
    read: false,
    icon: '💬',
  },
];
