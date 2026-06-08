import OrderCard from '../components/OrderCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import { updateDeliveryStatus, useRestaurantState } from '../services/restaurantStore.js';

const deliveryStatuses = ['pendiente', 'en camino', 'entregado'];

export default function DeliveryPanel() {
  const { orders: allOrders } = useRestaurantState();
  const deliveryOrders = allOrders.filter((order) => ['Delivery', 'Para llevar'].includes(order.type));
  const readyForDispatch = deliveryOrders.filter((order) => ['listo', 'entregado'].includes(order.status));
  const waitingKitchen = deliveryOrders.filter((order) => !['listo', 'entregado'].includes(order.status));

  function updateDelivery(orderId, deliveryStatus) {
    updateDeliveryStatus(orderId, deliveryStatus);
  }

  return (
    <>
      <PageHeader
        eyebrow="Despacho"
        title="Panel de Delivery"
        description="Pedidos para llevar o delivery con seguimiento de salida y entrega."
      />

      <div className="metric-grid">
        <div className="metric-card">
          <span>Por salir</span>
          <strong>{readyForDispatch.filter((order) => (order.deliveryStatus || 'pendiente') === 'pendiente').length}</strong>
          <small>Listos para despacho</small>
        </div>
        <div className="metric-card">
          <span>En camino</span>
          <strong>{deliveryOrders.filter((order) => order.deliveryStatus === 'en camino').length}</strong>
          <small>Pedidos fuera del local</small>
        </div>
        <div className="metric-card">
          <span>Entregados</span>
          <strong>{deliveryOrders.filter((order) => order.deliveryStatus === 'entregado').length}</strong>
          <small>Pasaron a caja como entregados</small>
        </div>
      </div>

      <Section title="Pedidos listos para delivery">
        <div className="card-grid">
          {readyForDispatch.map((order) => {
            const deliveryStatus = order.deliveryStatus || 'pendiente';

            return (
              <OrderCard
                order={{ ...order, status: deliveryStatus }}
                key={order.id}
                showPayment
                actions={(
                  <>
                    {deliveryStatuses.map((status) => (
                      <button
                        className="ghost-button"
                        disabled={deliveryStatus === status}
                        key={status}
                        type="button"
                        onClick={() => updateDelivery(order.id, status)}
                      >
                        {status}
                      </button>
                    ))}
                  </>
                )}
              />
            );
          })}
        </div>
      </Section>

      <Section title="Esperando cocina">
        <div className="card-grid">
          {waitingKitchen.map((order) => (
            <OrderCard order={order} key={order.id} showPayment />
          ))}
          {waitingKitchen.length === 0 && <p className="empty-cart">No hay pedidos de delivery esperando cocina.</p>}
        </div>
      </Section>
    </>
  );
}
