export function getOrderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

export function getOrdersTotal(orders) {
  return orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
}

export function getStatusClass(status) {
  return status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export function formatMoney(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(value);
}
