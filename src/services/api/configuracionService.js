import { apiFetch } from './apiClient.js';

const BASE = '/configuracion-restaurante';

export const configuracionService = {
  obtenerActiva: () => apiFetch(BASE),
  listarTodas: () => apiFetch(`${BASE}/todas`),
  obtenerPorId: (id) => apiFetch(`${BASE}/${id}`),
  crear: (data) => apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => apiFetch(`${BASE}/${id}`, { method: 'DELETE' })
};
