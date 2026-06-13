import { apiFetch } from './apiClient.js';

const BASE = '/mesas';

export const mesaService = {
  listar: () => apiFetch(BASE),
  listarActivas: () => apiFetch(`${BASE}/activas`),
  listarPorEstado: (estado) => apiFetch(`${BASE}/estado/${estado}`),
  obtenerPorId: (id) => apiFetch(`${BASE}/${id}`),
  crear: (data) => apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cambiarEstado: (id, estado) => apiFetch(`${BASE}/${id}/estado?estado=${estado}`, { method: 'PATCH' }),
  eliminar: (id) => apiFetch(`${BASE}/${id}`, { method: 'DELETE' })
};
