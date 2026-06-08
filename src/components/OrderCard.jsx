import { formatMoney, getOrderTotal, getStatusClass } from '../services/orderService.js';

export default function OrderCard({ order, actions, showPayment = false }) {
  return (
    <article className="order-card">
      <div className="order-card__header">
        <div>
          <h3>{order.id}</h3>
          <p>{order.table} · {order.createdAt} · {order.waiter}</p>
        </div>
        <span className={`status status--${getStatusClass(order.status)}`}>{order.status}</span>
      </div>

      <div className="order-items">
        {order.items.map((item) => (
          <div className="order-item" key={`${order.id}-${item.productId}`}>
            <div>
              <strong>{item.quantity} x {item.name}</strong>
              {item.note && <span>{item.note}</span>}
            </div>
            <b>{formatMoney(item.quantity * item.price)}</b>
          </div>
        ))}
      </div>

      <div className="order-card__footer">
        <strong>Total: {formatMoney(getOrderTotal(order))}</strong>
        {showPayment && (
          <span className={order.paid ? 'payment payment--paid' : 'payment'}>
            {order.paid ? `Pagado · ${order.paymentMethod}` : 'Pendiente de pago'}
          </span>
        )}
      </div>

      {actions && <div className="actions">{actions}</div>}
    </article>
  );
}
