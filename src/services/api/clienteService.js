import { apiFetch } from './apiClient.js';

const BASE = '/clientes';

export const clienteService = {
  listar: () => apiFetch(BASE),
  listarActivos: () => apiFetch(`${BASE}/activos`),
  obtenerPorId: (id) => apiFetch(`${BASE}/${id}`),
  crear: (data) => apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => apiFetch(`${BASE}/${id}`, { method: 'DELETE' })
};
