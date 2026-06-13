import { apiFetch } from './apiClient.js';

const BASE = '/productos';

export const productoService = {
  listar: () => apiFetch(BASE),
  listarDisponibles: () => apiFetch(`${BASE}/disponibles`),
  listarPorCategoria: (categoriaId) => apiFetch(`${BASE}/categoria/${categoriaId}`),
  obtenerPorId: (id) => apiFetch(`${BASE}/${id}`),
  crear: (data) => apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (id, data) => apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => apiFetch(`${BASE}/${id}`, { method: 'DELETE' })
};
