/**
 * Utilità per lo stato dei membri famiglia
 */

import { MEMBER_STATUS } from '../data';

const STATUS_CLASS_MAP = {
  [MEMBER_STATUS.HOME]: 'fh-status-home',
  [MEMBER_STATUS.SCHOOL]: 'fh-status-school',
  [MEMBER_STATUS.WORK]: 'fh-status-work',
  [MEMBER_STATUS.MOVING]: 'fh-status-moving',
  [MEMBER_STATUS.OFFLINE]: 'fh-status-offline',
};

export function getStatusClass(status) {
  return STATUS_CLASS_MAP[status] || 'fh-status-offline';
}
