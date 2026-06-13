import LoadingSpinner from '../components/LoadingSpinner.jsx';
import OrderCard from '../components/OrderCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import ToastContainer from '../components/ToastContainer.jsx';
import { useToast } from '../hooks/useToast.js';
import { useApiStore } from '../services/useApiStore.js';

export default function DeliveryPanel() {
  const { pedidos, loading, cambiarEstadoPedido } = useApiStore();
  const { toasts, success, error: toastError } = useToast();

  // Pedidos de tipo Delivery o Para llevar
  const deliveryOrders = pedidos.filter(
    (p) => p.type?.toLowerCase().includes('delivery') ||
           p.type?.toLowerCase().includes('llevar')
  );

  const readyForDispatch = deliveryOrders.filter(
    (p) => ['listo', 'entregado'].includes(p.status)
  );
  const waitingKitchen = deliveryOrders.filter(
    (p) => !['listo', 'entregado', 'cancelado'].includes(p.status)
  );

  async function marcarEntregado(order) {
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
        eyebrow="Despacho"
        title="Panel de Delivery"
        description="Pedidos para llevar o delivery. Datos en vivo del backend."
      />

      <div className="metric-grid">
        <div className="metric-card">
          <span>Por despachar</span>
          <strong>
            {readyForDispatch.filter((p) => p.status === 'listo').length}
          </strong>
          <small>Listos para salir</small>
        </div>
        <div className="metric-card">
          <span>Entregados</span>
          <strong>
            {deliveryOrders.filter((p) => p.status === 'entregado').length}
          </strong>
          <small>Completados hoy</small>
        </div>
        <div className="metric-card">
          <span>En cocina</span>
          <strong>{waitingKitchen.length}</strong>
          <small>Esperando preparacion</small>
        </div>
      </div>

      {loading && !deliveryOrders.length && (
        <LoadingSpinner text="Cargando pedidos de delivery..." />
      )}

      <Section title="Listos para despachar">
        <div className="card-grid">
          {readyForDispatch.map((order) => (
            <OrderCard
              order={order}
              key={order.id}
              showPayment
              actions={(
                <>
                  {order.status !== 'entregado' ? (
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => marcarEntregado(order)}
                    >
                      Marcar entregado
                    </button>
                  ) : (
                    <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>✅ Entregado</span>
                  )}
                </>
              )}
            />
          ))}
          {!loading && readyForDispatch.length === 0 && (
            <p className="empty-cart">No hay pedidos listos para despachar.</p>
          )}
        </div>
      </Section>

      <Section title="Esperando cocina">
        <div className="card-grid">
          {waitingKitchen.map((order) => (
            <OrderCard order={order} key={order.id} showPayment />
          ))}
          {!loading && waitingKitchen.length === 0 && (
            <p className="empty-cart">No hay pedidos de delivery esperando cocina.</p>
          )}
        </div>
      </Section>
    </>
  );
}
