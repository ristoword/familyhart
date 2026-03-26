/**
 * Permessi per ruolo - allineato a front-end
 */
const ROLE_PERMISSIONS = {
  admin: ['see_all_positions', 'receive_sos', 'send_sos', 'use_family_chat', 'use_private_chat', 'edit_safe_places', 'invite_members', 'manage_family_settings', 'manage_members'],
  partner: ['see_all_positions', 'receive_sos', 'send_sos', 'use_family_chat', 'use_private_chat', 'edit_safe_places', 'invite_members'],
  child: ['see_all_positions', 'receive_sos', 'send_sos', 'use_family_chat', 'use_private_chat'],
  guest: ['receive_sos', 'send_sos', 'use_family_chat'],
};

export function getPermissionsForRole(roleType) {
  return ROLE_PERMISSIONS[roleType] || [];
}
