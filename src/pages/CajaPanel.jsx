import { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import MetricCard from '../components/MetricCard.jsx';
import OrderCard from '../components/OrderCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import TableMap from '../components/TableMap.jsx';
import ToastContainer from '../components/ToastContainer.jsx';
import { useToast } from '../hooks/useToast.js';
import { formatMoney, getOrderTotal } from '../services/orderService.js';
import { useApiStore } from '../services/useApiStore.js';

const paymentMethods = ['efectivo', 'tarjeta', 'yape/plin'];

export default function CajaPanel() {
  const { pedidos, loading, cambiarEstadoPedido } = useApiStore();
  const { toasts, success, error: toastError } = useToast();
  const [selectedPayment, setSelectedPayment] = useState('efectivo');
  const [receiptOrder, setReceiptOrder] = useState(null);

  // Pedidos listos para cobrar (LISTO o ENTREGADO)
  const orders = pedidos.filter((p) => ['listo', 'entregado'].includes(p.status));

  // Métricas calculadas desde pedidos reales
  const totalCobrado = pedidos
    .filter((p) => p.status === 'entregado')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const pedidosPagados = pedidos.filter((p) => p.status === 'entregado').length;

  const pedidosPorEstado = {
    pendiente: pedidos.filter((p) => p.estadoBackend === 'PENDIENTE').length,
    en_preparacion: pedidos.filter((p) => p.estadoBackend === 'EN_PREPARACION').length,
    listo: pedidos.filter((p) => p.estadoBackend === 'LISTO').length
  };

  async function markAsPaid(order) {
    try {
      await cambiarEstadoPedido(order._id, 'ENTREGADO');
      success(`Pedido ${order.id} marcado como entregado`);
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} />
      <PageHeader
        eyebrow="Caja diaria"
        title="Ingresos y cobros del dia"
        description="Pedidos listos para cobrar. Los totales se calculan desde los pedidos del backend."
      />

      {loading && !pedidos.length && <LoadingSpinner text="Cargando datos de caja..." />}

      <div className="metric-grid">
        <MetricCard
          label="Total cobrado"
          value={formatMoney(totalCobrado)}
          helper="Pedidos con estado Entregado"
        />
        <MetricCard
          label="Pedidos entregados"
          value={pedidosPagados}
          helper="Completados hoy"
        />
        <MetricCard
          label="Por cobrar"
          value={orders.filter((p) => p.status === 'listo').length}
          helper="Listos esperando pago"
        />
        <MetricCard
          label="Total pedidos"
          value={pedidos.length}
          helper="Todos los pedidos del dia"
        />
      </div>

      <Section title="Mesas del restaurante (en vivo)">
        <TableMap compact />
      </Section>

      <div className="two-column two-column--wide-left">
        <Section title="Pedidos por cobrar">
          <div className="card-list">
            {orders.map((order) => (
              <OrderCard
                order={order}
                key={order.id}
                showPayment
                actions={(
                  <>
                    {order.status !== 'entregado' && (
                      <>
                        <select
                          value={selectedPayment}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                        >
                          {paymentMethods.map((method) => (
                            <option value={method} key={method}>{method}</option>
                          ))}
                        </select>
                        <button
                          className="primary-button"
                          type="button"
                          onClick={() => markAsPaid(order)}
                        >
                          Marcar pagado
                        </button>
                      </>
                    )}
                    {order.status === 'entregado' && (
                      <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>✅ Pagado</span>
                    )}
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => setReceiptOrder(order)}
                    >
                      Comprobante
                    </button>
                  </>
                )}
              />
            ))}
            {!loading && orders.length === 0 && (
              <p className="empty-cart">No hay pedidos listos para cobrar.</p>
            )}
          </div>
        </Section>

        <Section title="Cocina ahora">
          <div className="status-summary">
            <div>
              <strong>{pedidosPorEstado.pendiente}</strong>
              <span>Pendientes</span>
            </div>
            <div>
              <strong>{pedidosPorEstado.en_preparacion}</strong>
              <span>En preparacion</span>
            </div>
            <div>
              <strong>{pedidosPorEstado.listo}</strong>
              <span>Listos</span>
            </div>
          </div>
        </Section>
      </div>

      {/* Modal de comprobante */}
      {receiptOrder && (
        <div className="modal-backdrop" role="presentation" onClick={() => setReceiptOrder(null)}>
          <section
            className="receipt-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Comprobante de pago"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="receipt-ticket" id="receipt-print-area">
              <div className="receipt-ticket__brand">
                <strong>Chef Control</strong>
                <span>Restaurante</span>
                <small>RUC 20123456789</small>
              </div>
              <div className="receipt-ticket__meta">
                <span>Comprobante simple</span>
                <b>{receiptOrder.id}</b>
              </div>
              <div className="receipt-ticket__meta">
                <span>{receiptOrder.table}</span>
                <span>{receiptOrder.createdAt}</span>
              </div>
              <hr />
              <div className="receipt-ticket__items">
                {receiptOrder.items.map((item, idx) => (
                  <div key={idx}>
                    <span>{item.quantity} x {item.name}</span>
                    <b>{formatMoney(item.quantity * item.price)}</b>
                  </div>
                ))}
              </div>
              <hr />
              <div className="receipt-ticket__total">
                <span>Total</span>
                <strong>{formatMoney(receiptOrder.total || getOrderTotal(receiptOrder))}</strong>
              </div>
              <div className="receipt-ticket__meta">
                <span>Metodo</span>
                <b>{selectedPayment}</b>
              </div>
              <p>Gracias por su preferencia.</p>
            </div>
            <div className="receipt-modal__actions">
              <button className="ghost-button" type="button" onClick={() => setReceiptOrder(null)}>
                Cerrar
              </button>
              <button className="primary-button" type="button" onClick={() => window.print()}>
                Imprimir
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
