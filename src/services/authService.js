import { roles } from '../data/mockData.js';

const storageKey = 'chef-control-role';

export function setCurrentRole(roleId) {
  localStorage.setItem(storageKey, roleId);
}

export function getCurrentRole() {
  const roleId = localStorage.getItem(storageKey);
  return roles.find((role) => role.id === roleId) || null;
}

export function clearCurrentRole() {
  localStorage.removeItem(storageKey);
}

export function getDefaultRouteForRole(roleId) {
  return roles.find((role) => role.id === roleId)?.route || '/login';
}
