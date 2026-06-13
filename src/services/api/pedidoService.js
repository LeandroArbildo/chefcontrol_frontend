import { apiFetch } from './apiClient.js';

const BASE = '/pedidos';

export const pedidoService = {
  listar: () => apiFetch(BASE),
  listarPorEstado: (estado) => apiFetch(`${BASE}/estado/${estado}`),
  obtenerPorId: (id) => apiFetch(`${BASE}/${id}`),
  /**
   * Crea un nuevo pedido.
   * @param {{ mesaId, clienteId, tipoPedidoId, empleadoId, observaciones, detalles: [{productoId, cantidad, observaciones}] }} dto
   */
  crear: (dto) => apiFetch(BASE, { method: 'POST', body: JSON.stringify(dto) }),
  /**
   * Cambia el estado de un pedido.
   * @param {number} id
   * @param {'PENDIENTE'|'EN_PREPARACION'|'LISTO'|'ENTREGADO'|'CANCELADO'} estado
   */
  cambiarEstado: (id, estado) => apiFetch(`${BASE}/${id}/estado?estado=${estado}`, { method: 'PATCH' }),
  eliminar: (id) => apiFetch(`${BASE}/${id}`, { method: 'DELETE' })
};
