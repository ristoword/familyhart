/**
 * Dati iniziali membri famiglia - struttura completa
 * Con ruoli, permessi, stato account, posizione condivisa
 * TODO: Sostituire con caricamento da backend
 */

import { MEMBER_ROLE, PERMISSION, ACCOUNT_STATUS } from './constants';
import { MEMBER_STATUS } from './mock/constants';

/** Permessi per ruolo */
const ROLE_PERMISSIONS = {
  [MEMBER_ROLE.ADMIN]: [
    PERMISSION.SEE_ALL_POSITIONS,
    PERMISSION.RECEIVE_SOS,
    PERMISSION.SEND_SOS,
    PERMISSION.USE_FAMILY_CHAT,
    PERMISSION.USE_PRIVATE_CHAT,
    PERMISSION.EDIT_SAFE_PLACES,
    PERMISSION.INVITE_MEMBERS,
    PERMISSION.MANAGE_FAMILY_SETTINGS,
    PERMISSION.MANAGE_MEMBERS,
  ],
  [MEMBER_ROLE.PARTNER]: [
    PERMISSION.SEE_ALL_POSITIONS,
    PERMISSION.RECEIVE_SOS,
    PERMISSION.SEND_SOS,
    PERMISSION.USE_FAMILY_CHAT,
    PERMISSION.USE_PRIVATE_CHAT,
    PERMISSION.EDIT_SAFE_PLACES,
    PERMISSION.INVITE_MEMBERS,
  ],
  [MEMBER_ROLE.CHILD]: [
    PERMISSION.SEE_ALL_POSITIONS,
    PERMISSION.RECEIVE_SOS,
    PERMISSION.SEND_SOS,
    PERMISSION.USE_FAMILY_CHAT,
    PERMISSION.USE_PRIVATE_CHAT,
  ],
  [MEMBER_ROLE.GUEST]: [
    PERMISSION.RECEIVE_SOS,
    PERMISSION.SEND_SOS,
    PERMISSION.USE_FAMILY_CHAT,
  ],
};

export function getPermissionsForRole(roleType) {
  return ROLE_PERMISSIONS[roleType] || [];
}

export function getInitialMembers() {
  return [
    {
      id: '1',
      name: 'Marco',
      surname: 'Rossi',
      role: 'Papà',
      roleType: MEMBER_ROLE.ADMIN,
      email: 'marco.rossi@email.it',
      phone: '+39 333 1111111',
      avatar: '👨',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      locationSharingEnabled: true,
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
      surname: 'Rossi',
      role: 'Mamma',
      roleType: MEMBER_ROLE.PARTNER,
      email: 'laura.rossi@email.it',
      phone: '+39 333 2222222',
      avatar: '👩',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      locationSharingEnabled: true,
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
      surname: 'Rossi',
      role: 'Figlia',
      roleType: MEMBER_ROLE.CHILD,
      email: 'giulia.rossi@email.it',
      phone: '+39 333 3333333',
      avatar: '👧',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      locationSharingEnabled: true,
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
      surname: 'Rossi',
      role: 'Figlio',
      roleType: MEMBER_ROLE.CHILD,
      email: 'luca.rossi@email.it',
      phone: '+39 333 4444444',
      avatar: '👦',
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      locationSharingEnabled: true,
      status: MEMBER_STATUS.MOVING,
      battery: 23,
      lastUpdate: '30 sec fa',
      location: 'Piazza Duomo',
      lat: 45.4641,
      lng: 9.1919,
      color: '#EF4444',
    },
  ].map((m) => ({
    ...m,
    permissions: getPermissionsForRole(m.roleType),
  }));
}
