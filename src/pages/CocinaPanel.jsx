import OrderCard from '../components/OrderCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import TableMap from '../components/TableMap.jsx';
import { updateOrderStatus, useRestaurantState } from '../services/restaurantStore.js';

const kitchenStatuses = ['pendiente', 'en preparacion', 'listo'];

export default function CocinaPanel() {
  const { orders } = useRestaurantState();
  const kitchenOrders = orders.filter((order) => order.status !== 'entregado' && order.status !== 'listo');
  const readyOrders = orders.filter((order) => order.status === 'listo');

  function updateStatus(orderId, status) {
    updateOrderStatus(orderId, status);
  }

  return (
    <>
      <PageHeader
        eyebrow="Comandas"
        title="Panel de Cocina"
        description="Comandas por estado y vista general de mesas para entender como va el restaurante."
      />

      <Section title="Estado de mesas">
        <TableMap compact />
      </Section>

      <div className="kanban">
        {kitchenStatuses.map((status) => (
          <section className="kanban-column" key={status}>
            <h2>{status}</h2>
            <div className="card-list">
              {[...kitchenOrders, ...readyOrders].filter((order) => order.status === status).map((order) => (
                <OrderCard
                  order={order}
                  key={order.id}
                  actions={(
                    <>
                      {kitchenStatuses.map((nextStatus) => (
                        <button
                          className="ghost-button"
                          disabled={order.status === nextStatus}
                          key={nextStatus}
                          type="button"
                          onClick={() => updateStatus(order.id, nextStatus)}
                        >
                          {nextStatus}
                        </button>
                      ))}
                    </>
                  )}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
