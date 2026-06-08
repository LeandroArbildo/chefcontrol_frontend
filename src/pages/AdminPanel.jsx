import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import { bestSellers, inventoryItems, monthlySales, paymentStats } from '../data/mockData.js';
import { formatMoney, getOrdersTotal } from '../services/orderService.js';
import { useRestaurantState } from '../services/restaurantStore.js';

const chartColors = ['#f7c95b', '#ff9f2f', '#4ade80', '#60a5fa'];

export default function AdminPanel() {
  const { orders, movements } = useRestaurantState();
  const paidOrders = orders.filter((order) => order.paid).length;
  const lowStock = inventoryItems.filter((item) => item.stock <= item.minStock).length;
  const dailyIncome = movements
    .filter((movement) => movement.type === 'ingreso')
    .reduce((sum, movement) => sum + movement.amount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Administracion"
        title="Panel de Administrador"
        description="Resumen del negocio, ventas, pedidos, pagos, productos e inventario."
      />

      <div className="metric-grid">
        <MetricCard label="Ventas del dia" value={formatMoney(dailyIncome)} helper="Ingresos registrados en caja" />
        <MetricCard label="Pedidos realizados" value={orders.length} helper={`${paidOrders} pagados`} />
        <MetricCard label="Ticket promedio" value={formatMoney(getOrdersTotal(orders) / orders.length)} helper="Promedio actual" />
        <MetricCard label="Stock bajo" value={lowStock} helper="Requiere reposicion" />
      </div>

      <div className="two-column">
        <Section title="Ventas mensuales">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#f7c95b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Ingresos por pago">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={paymentStats} dataKey="value" nameKey="name" outerRadius={92} label>
                  {paymentStats.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title="Productos mas vendidos">
        <div className="product-rank">
          {bestSellers.map((product, index) => (
            <div key={product.name}>
              <span>{index + 1}</span>
              <strong>{product.name}</strong>
              <b>{product.units} und.</b>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
