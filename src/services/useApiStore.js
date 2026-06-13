/**
 * useApiStore.js — Hook global que conecta con el backend real.
 * Reemplaza el localStorage mock de restaurantStore.js.
 * Hace polling automático de pedidos y mesas cada 8 segundos.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { categoriaService } from './api/categoriaService.js';
import { mesaService } from './api/mesaService.js';
import { pedidoService } from './api/pedidoService.js';
import { productoService } from './api/productoService.js';
import { tipoPedidoService } from './api/tipoPedidoService.js';

const POLLING_INTERVAL = 8000; // ms

/** Normaliza un pedido del backend para uso en el frontend */
function normalizePedido(p) {
  return {
    // Compatibilidad con los campos que usan las páginas actuales
    id: `P-${p.pedidosId}`,
    _id: p.pedidosId,
    table: p.mesa ? `Mesa ${p.mesa.mesasNumero}` : (p.tipoPedido?.tiposPedidoNombre || 'S/M'),
    waiter: p.empleado?.empleadosNombre || 'N/A',
    type: p.tipoPedido?.tiposPedidoNombre || 'Salon',
    status: mapEstado(p.pedidosEstado),
    estadoBackend: p.pedidosEstado,
    paid: p.pedidosEstado === 'ENTREGADO',
    paymentMethod: null,
    createdAt: p.pedidosFechaHora
      ? new Date(p.pedidosFechaHora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      : '--:--',
    total: parseFloat(p.pedidosTotal || 0),
    observaciones: p.pedidosObservaciones || '',
    mesa: p.mesa,
    cliente: p.cliente,
    tipoPedido: p.tipoPedido,
    empleado: p.empleado,
    items: (p.detalles || []).map((d) => ({
      productId: d.producto?.productosId,
      name: d.producto?.productosNombre || '',
      quantity: d.detallesPedidosCantidad,
      price: parseFloat(d.detallesPedidosPrecioUnitario || 0),
      subtotal: parseFloat(d.detallesPedidosSubtotal || 0),
      note: d.detallesPedidosObservaciones || ''
    })),
    deliveryStatus: ['Delivery', 'Para llevar'].includes(p.tipoPedido?.tiposPedidoNombre)
      ? (p.pedidosEstado === 'ENTREGADO' ? 'entregado' : 'pendiente')
      : null
  };
}

/** Normaliza una mesa del backend */
function normalizeMesa(m) {
  return {
    id: m.mesasId,
    name: `Mesa ${m.mesasNumero}`,
    numero: m.mesasNumero,
    seats: m.mesasCapacidad,
    status: mapEstadoMesa(m.mesasEstado),
    estadoBackend: m.mesasEstado,
    activa: m.mesasActiva
  };
}

/** Mapea estados del backend (SNAKE_CASE) a formato del frontend */
function mapEstado(estado) {
  const map = {
    PENDIENTE: 'pendiente',
    EN_PREPARACION: 'en preparacion',
    LISTO: 'listo',
    ENTREGADO: 'entregado',
    CANCELADO: 'cancelado'
  };
  return map[estado] || estado?.toLowerCase() || 'pendiente';
}

function mapEstadoMesa(estado) {
  const map = {
    DISPONIBLE: 'disponible',
    OCUPADA: 'ocupada',
    RESERVADA: 'reservada',
    FUERA_DE_SERVICIO: 'fuera de servicio'
  };
  return map[estado] || 'disponible';
}

/** Mapea estados frontend → backend */
export function mapEstadoToBackend(estado) {
  const map = {
    pendiente: 'PENDIENTE',
    'en preparacion': 'EN_PREPARACION',
    listo: 'LISTO',
    entregado: 'ENTREGADO',
    cancelado: 'CANCELADO'
  };
  return map[estado] || estado?.toUpperCase() || 'PENDIENTE';
}

export function mapEstadoMesaToBackend(estado) {
  const map = {
    disponible: 'DISPONIBLE',
    ocupada: 'OCUPADA',
    reservada: 'RESERVADA',
    'fuera de servicio': 'FUERA_DE_SERVICIO'
  };
  return map[estado] || 'DISPONIBLE';
}

// ─── Store singleton ───────────────────────────────────────────────────────────
const STORE_EVENT = 'chefcontrol-api-store-updated';
let _state = {
  pedidos: [],
  mesas: [],
  productos: [],
  categorias: [],
  tiposPedido: [],
  loading: true,
  error: null,
  backendOnline: null
};

function broadcast() {
  window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { ..._state } }));
}

function setState(partial) {
  _state = { ..._state, ...partial };
  broadcast();
}

// ─── Carga inicial de datos estáticos ─────────────────────────────────────────
let _bootstrapped = false;
async function bootstrap() {
  if (_bootstrapped) return;
  _bootstrapped = true;
  try {
    const [categorias, productos, tiposPedido] = await Promise.all([
      categoriaService.listar(),
      productoService.listarDisponibles(),
      tipoPedidoService.listar()
    ]);
    setState({ categorias, productos, tiposPedido, backendOnline: true });
  } catch (err) {
    setState({ backendOnline: false, error: err.message });
  }
}

// ─── Polling de pedidos y mesas ────────────────────────────────────────────────
let _pollingTimer = null;

async function fetchLive() {
  try {
    const [pedidosRaw, mesasRaw] = await Promise.all([
      pedidoService.listar(),
      mesaService.listarActivas()
    ]);
    setState({
      pedidos: pedidosRaw.map(normalizePedido),
      mesas: mesasRaw.map(normalizeMesa),
      backendOnline: true,
      error: null,
      loading: false
    });
  } catch (err) {
    setState({ backendOnline: false, error: err.message, loading: false });
  }
}

function startPolling() {
  if (_pollingTimer) return;
  fetchLive();
  _pollingTimer = setInterval(fetchLive, POLLING_INTERVAL);
}

function stopPolling() {
  if (_pollingTimer) {
    clearInterval(_pollingTimer);
    _pollingTimer = null;
  }
}

// ─── Hook principal ────────────────────────────────────────────────────────────
export function useApiStore() {
  const [state, setLocalState] = useState(() => ({ ..._state }));
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    function onUpdate(e) {
      if (mountedRef.current) setLocalState({ ...e.detail });
    }
    window.addEventListener(STORE_EVENT, onUpdate);
    bootstrap();
    startPolling();
    return () => {
      mountedRef.current = false;
      window.removeEventListener(STORE_EVENT, onUpdate);
    };
  }, []);

  /** Refresca pedidos y mesas manualmente */
  const refresh = useCallback(async () => {
    setState({ loading: true });
    await fetchLive();
  }, []);

  /** Crea un nuevo pedido en el backend */
  const crearPedido = useCallback(async (dto) => {
    const pedido = await pedidoService.crear(dto);
    await fetchLive();
    return normalizePedido(pedido);
  }, []);

  /** Cambia el estado de un pedido */
  const cambiarEstadoPedido = useCallback(async (pedidoId, estadoBackend) => {
    await pedidoService.cambiarEstado(pedidoId, estadoBackend);
    await fetchLive();
  }, []);

  /** Cambia el estado de una mesa */
  const cambiarEstadoMesa = useCallback(async (mesaId, estadoBackend) => {
    await mesaService.cambiarEstado(mesaId, estadoBackend);
    await fetchLive();
  }, []);

  return {
    ...state,
    refresh,
    crearPedido,
    cambiarEstadoPedido,
    cambiarEstadoMesa
  };
}

// Iniciar bootstrap al importar el módulo
bootstrap();
