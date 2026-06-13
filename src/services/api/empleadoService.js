import { apiFetch } from './apiClient.js';

const BASE = '/empleados';

export const empleadoService = {
  listar: () => apiFetch(BASE),
  listarActivos: () => apiFetch(`${BASE}/activos`),
  listarPorRol: (rol) => apiFetch(`${BASE}/rol/${rol}`),
  obtenerPorId: (id) => apiFetch(`${BASE}/${id}`),
  crear: (data) => apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => apiFetch(`${BASE}/${id}`, { method: 'DELETE' })
};
