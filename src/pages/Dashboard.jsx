import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import { bestSellers, inventoryItems } from '../data/mockData.js';
import { formatMoney, getOrdersTotal } from '../services/orderService.js';
import { useRestaurantState } from '../services/restaurantStore.js';

export default function Dashboard() {
  const { orders } = useRestaurantState();
  const pendingOrders = orders.filter((order) => order.status !== 'entregado').length;
  const lowStock = inventoryItems.filter((item) => item.stock <= item.minStock).length;

  return (
    <>
      <PageHeader
        eyebrow="Operacion en vivo"
        title="Dashboard"
        description="Vista rapida del movimiento del restaurante durante el turno actual."
      />

      <div className="metric-grid">
        <MetricCard label="Ventas del dia" value={formatMoney(getOrdersTotal(orders))} helper="Pedidos registrados hoy" />
        <MetricCard label="Pedidos activos" value={pendingOrders} helper="Pendientes, en preparacion o listos" />
        <MetricCard label="Alertas de stock" value={lowStock} helper="Insumos bajo minimo" />
        <MetricCard label="Producto lider" value={bestSellers[0].name} helper={`${bestSellers[0].units} unidades`} />
      </div>

      <Section title="Ultimos pedidos">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Mesa</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.table}</td>
                  <td>{order.type}</td>
                  <td>{order.status}</td>
                  <td>{formatMoney(getOrdersTotal([order]))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
