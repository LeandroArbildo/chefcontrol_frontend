import MetricCard from '../components/MetricCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import { formatMoney } from '../services/orderService.js';
import { useApiStore } from '../services/useApiStore.js';

export default function Dashboard() {
  const { pedidos, mesas, loading } = useApiStore();

  // Métricas calculadas desde datos reales del backend
  const pedidosActivos = pedidos.filter(
    (p) => !['entregado', 'cancelado'].includes(p.status)
  ).length;

  const mesasOcupadas = mesas.filter((m) => m.status === 'ocupada').length;

  const ventasTotales = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);

  // Producto más vendido calculado desde detalles reales
  const productConteo = {};
  pedidos.forEach((p) => {
    (p.items || []).forEach((item) => {
      if (!item.name) return;
      productConteo[item.name] = (productConteo[item.name] || 0) + item.quantity;
    });
  });
  const productLider = Object.entries(productConteo).sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      <PageHeader
        eyebrow="Operacion en vivo"
        title="Dashboard"
        description="Vista rapida del movimiento del restaurante durante el turno actual."
      />

      {loading && <LoadingSpinner text="Cargando datos del servidor..." />}

      <div className="metric-grid">
        <MetricCard
          label="Ventas del dia"
          value={formatMoney(ventasTotales)}
          helper="Total acumulado de pedidos"
        />
        <MetricCard
          label="Pedidos activos"
          value={pedidosActivos}
          helper="Pendientes, en preparacion o listos"
        />
        <MetricCard
          label="Mesas ocupadas"
          value={`${mesasOcupadas} / ${mesas.length}`}
          helper="Estado actual del salon"
        />
        <MetricCard
          label="Producto lider"
          value={productLider ? productLider[0] : '—'}
          helper={productLider ? `${productLider[1]} unidades` : 'Sin datos aun'}
        />
      </div>

      <Section title="Ultimos pedidos">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Mesa / Tipo</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.slice(0, 10).map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{pedido.table}</td>
                  <td>{pedido.type}</td>
                  <td>
                    <span className={`estado-badge estado-badge--${pedido.status.replace(' ', '-')}`}>
                      {pedido.status}
                    </span>
                  </td>
                  <td>{formatMoney(pedido.total)}</td>
                </tr>
              ))}
              {!loading && pedidos.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', opacity: 0.5 }}>
                    No hay pedidos registrados aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
