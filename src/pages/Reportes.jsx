import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import { dailySales, monthlySales } from '../data/mockData.js';
import { getOrderTotal } from '../services/orderService.js';
import { useRestaurantState } from '../services/restaurantStore.js';

const chartColors = ['#f7c95b', '#ff9f2f', '#4ade80', '#60a5fa'];

export default function Reportes() {
  const { orders, movements } = useRestaurantState();
  const todaySales = movements
    .filter((movement) => movement.type === 'ingreso')
    .reduce((sum, movement) => sum + movement.amount, 0);
  const dynamicDailySales = [
    ...dailySales.slice(0, -1),
    { ...dailySales[dailySales.length - 1], sales: todaySales }
  ];
  const bestSellers = Object.values(orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      acc[item.name] = acc[item.name] || { name: item.name, units: 0 };
      acc[item.name].units += item.quantity;
    });
    return acc;
  }, {}))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);
  const paymentStats = Object.values(orders.reduce((acc, order) => {
    if (!order.paid || !order.paymentMethod) return acc;
    const label = order.paymentMethod === 'yape/plin' ? 'Yape/Plin' : order.paymentMethod;
    acc[label] = acc[label] || { name: label, value: 0 };
    acc[label].value += getOrderTotal(order);
    return acc;
  }, {}));

  return (
    <>
      <PageHeader
        eyebrow="Analitica"
        title="Reportes"
        description="Graficos simples para revisar ventas, productos y metodos de pago."
      />

      <div className="report-grid">
        <Section title="Ventas diarias" compact>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dynamicDailySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#f7c95b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Ventas mensuales" compact>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#ff9f2f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Productos mas vendidos" compact>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bestSellers} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="units" fill="#4ade80" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Metodos de pago" compact>
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
    </>
  );
}
