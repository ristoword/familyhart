/**
 * Mock - Membri famiglia e gruppo
 * Ruoli: admin (genitore principale), partner (altro genitore), child (figlio)
 * TODO: Sostituire con family.service / backend
 */

import { MEMBER_STATUS } from './constants';

export { MEMBER_STATUS };

export const familyGroup = {
  name: 'Famiglia Rossi',
  id: 'fam-1',
};

export const familyMembers = [
  {
    id: '1',
    name: 'Marco',
    role: 'Papà',
    roleType: 'admin',
    avatar: '👨',
    status: MEMBER_STATUS.WORK,
    battery: 87,
    lastUpdate: '2 min fa',
    location: 'Via Roma 15, Milano',
    lat: 45.4642,
    lng: 9.19,
    color: '#3B82F6',
  },
  {
    id: '2',
    name: 'Laura',
    role: 'Mamma',
    roleType: 'partner',
    avatar: '👩',
    status: MEMBER_STATUS.HOME,
    battery: 92,
    lastUpdate: '1 min fa',
    location: 'Casa - Via Garibaldi 8',
    lat: 45.4654,
    lng: 9.1856,
    color: '#10B981',
  },
  {
    id: '3',
    name: 'Giulia',
    role: 'Figlia',
    roleType: 'child',
    avatar: '👧',
    status: MEMBER_STATUS.SCHOOL,
    battery: 45,
    lastUpdate: '5 min fa',
    location: 'Liceo Scientifico Galileo',
    lat: 45.4612,
    lng: 9.1823,
    color: '#F59E0B',
  },
  {
    id: '4',
    name: 'Luca',
    role: 'Figlio',
    roleType: 'child',
    avatar: '👦',
    status: MEMBER_STATUS.MOVING,
    battery: 23,
    lastUpdate: '30 sec fa',
    location: 'Piazza Duomo',
    lat: 45.4641,
    lng: 9.1919,
    color: '#EF4444',
  },
];
