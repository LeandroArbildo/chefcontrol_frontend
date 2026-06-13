import LoadingSpinner from '../components/LoadingSpinner.jsx';
import OrderCard from '../components/OrderCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import TableMap from '../components/TableMap.jsx';
import ToastContainer from '../components/ToastContainer.jsx';
import { useToast } from '../hooks/useToast.js';
import { useApiStore, mapEstadoToBackend } from '../services/useApiStore.js';

// Estados en el flujo de cocina (backend values)
const kitchenStatuses = [
  { key: 'PENDIENTE', label: 'Pendiente' },
  { key: 'EN_PREPARACION', label: 'En preparacion' },
  { key: 'LISTO', label: 'Listo' }
];

export default function CocinaPanel() {
  const { pedidos, loading, cambiarEstadoPedido } = useApiStore();
  const { toasts, success, error: toastError } = useToast();

  // Solo pedidos activos para cocina (excluye entregados y cancelados)
  const pedidosActivos = pedidos.filter(
    (p) => !['entregado', 'cancelado'].includes(p.status)
  );

  async function updateStatus(pedidoId, nuevoEstadoBackend) {
    try {
      await cambiarEstadoPedido(pedidoId, nuevoEstadoBackend);
      success(`Estado actualizado a "${nuevoEstadoBackend}"`);
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} />
      <PageHeader
        eyebrow="Comandas en vivo"
        title="Panel de Cocina"
        description="Comandas por estado. Se actualiza automaticamente cada 8 segundos."
      />

      <Section title="Estado de mesas (en vivo)">
        <TableMap compact />
      </Section>

      {loading && !pedidosActivos.length && (
        <LoadingSpinner text="Cargando comandas del servidor..." />
      )}

      <div className="kanban">
        {kitchenStatuses.map(({ key, label }) => {
          const columnOrders = pedidosActivos.filter(
            (p) => p.estadoBackend === key
          );
          return (
            <section className="kanban-column" key={key}>
              <h2>
                {label}
                <span
                  style={{
                    marginLeft: '0.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '1rem',
                    padding: '0.1rem 0.5rem',
                    fontSize: '0.75rem'
                  }}
                >
                  {columnOrders.length}
                </span>
              </h2>
              <div className="card-list">
                {columnOrders.map((order) => (
                  <OrderCard
                    order={order}
                    key={order.id}
                    actions={(
                      <>
                        {kitchenStatuses.map(({ key: nextKey, label: nextLabel }) => (
                          <button
                            className="ghost-button"
                            disabled={order.estadoBackend === nextKey}
                            key={nextKey}
                            type="button"
                            onClick={() => updateStatus(order._id, nextKey)}
                          >
                            {nextLabel}
                          </button>
                        ))}
                        <button
                          className="ghost-button"
                          style={{ color: '#ef4444' }}
                          type="button"
                          onClick={() => updateStatus(order._id, 'CANCELADO')}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  />
                ))}
                {columnOrders.length === 0 && (
                  <p style={{ opacity: 0.4, fontSize: '0.85rem', padding: '1rem 0' }}>
                    Sin pedidos en este estado
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
