/**
 * Mock - Luoghi sicuri / Geofence
 * Sostituire con dati da family.service o API geofence
 */

export const safePlaces = [
  {
    id: 'sp1',
    name: 'Casa',
    address: 'Via Garibaldi 8, Milano',
    radius: 100,
    notifyEntry: true,
    notifyExit: true,
    lat: 45.4654,
    lng: 9.1856,
  },
  {
    id: 'sp2',
    name: 'Scuola',
    address: 'Liceo Scientifico Galileo, Via Galilei 5',
    radius: 150,
    notifyEntry: true,
    notifyExit: true,
    lat: 45.4612,
    lng: 9.1823,
  },
  {
    id: 'sp3',
    name: 'Lavoro',
    address: 'Ufficio - Via Roma 15',
    radius: 80,
    notifyEntry: false,
    notifyExit: true,
    lat: 45.4642,
    lng: 9.19,
  },
  {
    id: 'sp4',
    name: 'Nonni',
    address: 'Via Verdi 22, Monza',
    radius: 120,
    notifyEntry: true,
    notifyExit: true,
    lat: 45.5845,
    lng: 9.2744,
  },
];
