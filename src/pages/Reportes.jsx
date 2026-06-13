import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import { formatMoney, getOrderTotal } from '../services/orderService.js';
import { useApiStore } from '../services/useApiStore.js';

const chartColors = ['#f7c95b', '#ff9f2f', '#4ade80', '#60a5fa', '#a78bfa'];

export default function Reportes() {
  const { pedidos, loading } = useApiStore();

  // Ventas por día de la semana calculadas desde timestamps reales
  const diasMap = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb' };
  const ventasPorDia = {};
  pedidos.forEach((p) => {
    if (!p.createdAt || p.status === 'cancelado') return;
    // Usamos el campo raw del backend si está disponible
    const fecha = p.pedidosFechaHora || p.createdAt;
    try {
      const d = new Date(fecha);
      if (isNaN(d)) return;
      const dia = diasMap[d.getDay()];
      ventasPorDia[dia] = (ventasPorDia[dia] || 0) + (p.total || 0);
    } catch { /* ignore */ }
  });
  const dailySalesData = Object.entries(ventasPorDia).map(([day, sales]) => ({ day, sales }));

  // Productos más vendidos desde detalles reales
  const productCount = {};
  pedidos.forEach((p) => {
    p.items?.forEach((i) => {
      if (!i.name) return;
      productCount[i.name] = (productCount[i.name] || 0) + (i.quantity || 0);
    });
  });
  const bestSellers = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, units]) => ({ name, units }));

  // Ventas por tipo de pedido
  const ventasPorTipo = Object.entries(
    pedidos.reduce((acc, p) => {
      const tipo = p.type || 'Otro';
      acc[tipo] = (acc[tipo] || 0) + (p.total || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Estado de pedidos (para pie chart)
  const estadosCount = pedidos.reduce((acc, p) => {
    const e = p.estadoBackend || 'OTRO';
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {});
  const estadosPie = Object.entries(estadosCount).map(([name, value]) => ({ name, value }));

  return (
    <>
      <PageHeader
        eyebrow="Analitica"
        title="Reportes"
        description="Graficos basados en datos reales del backend. Se actualizan automaticamente."
      />

      {loading && !pedidos.length && <LoadingSpinner text="Cargando datos para reportes..." />}

      {!loading && pedidos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
          <p>No hay datos de pedidos aún. Los reportes aparecerán cuando haya pedidos registrados.</p>
        </div>
      )}

      <div className="report-grid">
        <Section title="Ventas por día de la semana" compact>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Bar dataKey="sales" fill="#f7c95b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Ventas por tipo de pedido" compact>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={ventasPorTipo} dataKey="value" nameKey="name" outerRadius={92} label>
                  {ventasPorTipo.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Productos mas vendidos" compact>
          <div className="chart-box">
            {bestSellers.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={bestSellers} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={130} />
                  <Tooltip />
                  <Bar dataKey="units" fill="#4ade80" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ opacity: 0.5, padding: '2rem' }}>Sin ventas registradas aún.</p>
            )}
          </div>
        </Section>

        <Section title="Distribucion de estados de pedidos" compact>
          <div className="chart-box">
            {estadosPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={estadosPie} dataKey="value" nameKey="name" outerRadius={92} label>
                    {estadosPie.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ opacity: 0.5, padding: '2rem' }}>Sin pedidos aún.</p>
            )}
          </div>
        </Section>
      </div>

      {/* Tabla resumen de pedidos recientes */}
      <Section title="Resumen de pedidos">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mesa / Tipo</th>
                <th>Estado</th>
                <th>Items</th>
                <th>Total</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.slice(0, 15).map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.table}</td>
                  <td>
                    <span className={`estado-badge estado-badge--${p.status.replace(' ', '-')}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.items?.length || 0} items</td>
                  <td>{formatMoney(p.total || 0)}</td>
                  <td>{p.createdAt}</td>
                </tr>
              ))}
              {!loading && pedidos.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', opacity: 0.5 }}>
                    Sin pedidos registrados
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
