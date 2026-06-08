import { useEffect, useState } from 'react';
import { dailyCashMovements, orders as initialOrders, restaurantTables } from '../data/mockData.js';
import { getOrderTotal } from './orderService.js';

const storeKey = 'chef-control-restaurant-state';
const storeEvent = 'chef-control-store-updated';
const storeVersion = 2;

const defaultState = {
  version: storeVersion,
  orders: initialOrders,
  movements: dailyCashMovements
};

function readState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storeKey));
    if (stored?.orders && stored?.movements) {
      return {
        version: storeVersion,
        orders: stored.orders.map((order) => ({
          deliveryStatus: ['Delivery', 'Para llevar'].includes(order.type) ? 'pendiente' : null,
          ...order
        })),
        movements: stored.movements
      };
    }
  } catch {
    // Fall back to mock data when localStorage is empty or corrupted.
  }
  return defaultState;
}

function writeState(nextState) {
  localStorage.setItem(storeKey, JSON.stringify(nextState));
  window.dispatchEvent(new CustomEvent(storeEvent, { detail: nextState }));
}

export function useRestaurantState() {
  const [state, setState] = useState(readState);

  useEffect(() => {
    function sync(event) {
      setState(event.detail || readState());
    }

    function syncStorage(event) {
      if (event.key === storeKey) setState(readState());
    }

    window.addEventListener(storeEvent, sync);
    window.addEventListener('storage', syncStorage);
    return () => {
      window.removeEventListener(storeEvent, sync);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  return state;
}

export function addOrder(order) {
  const current = readState();
  writeState({ ...current, orders: [order, ...current.orders] });
}

export function updateOrderStatus(orderId, status) {
  const current = readState();
  writeState({
    ...current,
    orders: current.orders.map((order) => (
      order.id === orderId
        ? {
            ...order,
            status,
            deliveryStatus: ['Delivery', 'Para llevar'].includes(order.type) && status === 'listo'
              ? order.deliveryStatus || 'pendiente'
              : order.deliveryStatus
          }
        : order
    ))
  });
}

export function markOrderPaid(orderId, paymentMethod) {
  const current = readState();
  const paidOrder = current.orders.find((order) => order.id === orderId);
  const alreadyPaid = paidOrder?.paid;
  const paymentMovement = paidOrder && !alreadyPaid
    ? {
        id: Date.now(),
        type: 'ingreso',
        concept: `Pago ${paidOrder.id} - ${paymentMethod}`,
        amount: getOrderTotal(paidOrder)
      }
    : null;

  writeState({
    ...current,
    orders: current.orders.map((order) => (
      order.id === orderId ? { ...order, paid: true, paymentMethod } : order
    )),
    movements: paymentMovement ? [...current.movements, paymentMovement] : current.movements
  });
}

export function addCashExpense(concept, amount) {
  const current = readState();
  writeState({
    ...current,
    movements: [
      ...current.movements,
      { id: Date.now(), type: 'egreso', concept, amount }
    ]
  });
}

export function updateDeliveryStatus(orderId, deliveryStatus) {
  const current = readState();
  writeState({
    ...current,
    orders: current.orders.map((order) => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        deliveryStatus,
        status: deliveryStatus === 'entregado' ? 'entregado' : order.status
      };
    })
  });
}

export function getTablesFromOrders(orders) {
  const statusByTable = {};

  orders.forEach((order) => {
    if (!order.table?.startsWith('Mesa') || order.paid) return;
    if (order.status === 'listo') statusByTable[order.table] = 'lista';
    else if (order.status === 'pendiente') statusByTable[order.table] = 'esperando';
    else if (order.status === 'en preparacion' || order.status === 'entregado') statusByTable[order.table] = 'ocupada';
  });

  return restaurantTables.map((table) => ({
    ...table,
    status: statusByTable[table.name] || table.status
  }));
}
