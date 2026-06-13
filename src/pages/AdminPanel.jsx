import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import MetricCard from '../components/MetricCard.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import ToastContainer from '../components/ToastContainer.jsx';
import { useToast } from '../hooks/useToast.js';
import { productoService } from '../services/api/productoService.js';
import { categoriaService } from '../services/api/categoriaService.js';
import { empleadoService } from '../services/api/empleadoService.js';
import { formatMoney } from '../services/orderService.js';
import { useApiStore } from '../services/useApiStore.js';
import { useNavigate } from 'react-router-dom';

const chartColors = ['#f7c95b', '#ff9f2f', '#4ade80', '#60a5fa'];

const ROLES = ['MESERO', 'COCINERO', 'CAJERO', 'ADMINISTRADOR', 'BARTENDER'];

export default function AdminPanel() {
  const { pedidos, productos, categorias, loading } = useApiStore();
  const { toasts, success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [loadingEmps, setLoadingEmps] = useState(true);
  const [modalProducto, setModalProducto] = useState(false);
  const [modalEmpleado, setModalEmpleado] = useState(false);
  const [editProducto, setEditProducto] = useState(null);
  const [editEmpleado, setEditEmpleado] = useState(null);

  // Formulario producto
  const [fProd, setFProd] = useState({ productosNombre: '', productosDescripcion: '', productosPrecio: '', categoriaId: '', productosDisponible: true });
  // Formulario empleado
  const [fEmp, setFEmp] = useState({ empleadosNombre: '', empleadosRol: 'MESERO', empleadosTelefono: '', empleadosEmail: '', empleadosActivo: true });

  useEffect(() => {
    empleadoService.listar().then(setEmpleados).catch(() => {}).finally(() => setLoadingEmps(false));
  }, []);

  // Métricas
  const totalVentas = pedidos.reduce((s, p) => s + (p.total || 0), 0);
  const pedidosEntregados = pedidos.filter((p) => p.status === 'entregado').length;
  const ticketPromedio = pedidos.length ? totalVentas / pedidos.length : 0;

  // Ventas por tipo de pedido (para gráfico)
  const ventasPorTipo = Object.entries(
    pedidos.reduce((acc, p) => {
      const tipo = p.type || 'Otro';
      acc[tipo] = (acc[tipo] || 0) + (p.total || 0);
      return acc;
    }, {})
  ).map(([name, sales]) => ({ name, sales }));

  // Productos más pedidos
  const productCount = {};
  pedidos.forEach((p) => p.items?.forEach((i) => {
    if (!i.name) return;
    productCount[i.name] = (productCount[i.name] || 0) + i.quantity;
  }));
  const bestSellers = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, units]) => ({ name, units }));

  // CRUD Producto
  function openNuevoProducto() {
    setEditProducto(null);
    setFProd({ productosNombre: '', productosDescripcion: '', productosPrecio: '', categoriaId: '', productosDisponible: true });
    setModalProducto(true);
  }
  function openEditProducto(p) {
    setEditProducto(p);
    setFProd({
      productosNombre: p.productosNombre || '',
      productosDescripcion: p.productosDescripcion || '',
      productosPrecio: p.productosPrecio || '',
      categoriaId: p.categoria?.categoriasId || '',
      productosDisponible: p.productosDisponible !== false
    });
    setModalProducto(true);
  }
  async function saveProducto(e) {
    e.preventDefault();
    try {
      const body = {
        productosNombre: fProd.productosNombre,
        productosDescripcion: fProd.productosDescripcion,
        productosPrecio: parseFloat(fProd.productosPrecio),
        productosDisponible: fProd.productosDisponible,
        categoria: fProd.categoriaId ? { categoriasId: parseInt(fProd.categoriaId, 10) } : null
      };
      if (editProducto) {
        await productoService.actualizar(editProducto.productosId, body);
        success('Producto actualizado');
      } else {
        await productoService.crear(body);
        success('Producto creado');
      }
      setModalProducto(false);
      window.location.reload();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }
  async function deleteProducto(id) {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await productoService.eliminar(id);
      success('Producto eliminado');
      window.location.reload();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  // CRUD Empleado
  function openNuevoEmpleado() {
    setEditEmpleado(null);
    setFEmp({ empleadosNombre: '', empleadosRol: 'MESERO', empleadosTelefono: '', empleadosEmail: '', empleadosActivo: true });
    setModalEmpleado(true);
  }
  function openEditEmpleado(emp) {
    setEditEmpleado(emp);
    setFEmp({
      empleadosNombre: emp.empleadosNombre || '',
      empleadosRol: emp.empleadosRol || 'MESERO',
      empleadosTelefono: emp.empleadosTelefono || '',
      empleadosEmail: emp.empleadosEmail || '',
      empleadosActivo: emp.empleadosActivo !== false
    });
    setModalEmpleado(true);
  }
  async function saveEmpleado(e) {
    e.preventDefault();
    try {
      if (editEmpleado) {
        await empleadoService.actualizar(editEmpleado.empleadosId, fEmp);
        success('Empleado actualizado');
      } else {
        await empleadoService.crear(fEmp);
        success('Empleado registrado');
      }
      const lista = await empleadoService.listar();
      setEmpleados(lista);
      setModalEmpleado(false);
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }
  async function deleteEmpleado(id) {
    if (!window.confirm('¿Eliminar este empleado?')) return;
    try {
      await empleadoService.eliminar(id);
      success('Empleado eliminado');
      setEmpleados((prev) => prev.filter((e) => e.empleadosId !== id));
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} />
      <PageHeader
        eyebrow="Administracion"
        title="Panel de Administrador"
        description="Resumen del negocio, gestion de productos, empleados y metricas en vivo."
      />

      {loading && !pedidos.length && <LoadingSpinner text="Cargando datos..." />}

      <div className="metric-grid">
        <MetricCard label="Ventas totales" value={formatMoney(totalVentas)} helper="Suma de todos los pedidos" />
        <MetricCard label="Pedidos totales" value={pedidos.length} helper={`${pedidosEntregados} entregados`} />
        <MetricCard label="Ticket promedio" value={formatMoney(ticketPromedio)} helper="Promedio por pedido" />
        <MetricCard label="Productos en menu" value={productos.length} helper={`${categorias.length} categorias`} />
      </div>

      <div className="two-column">
        <Section title="Ventas por tipo de pedido">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ventasPorTipo}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Bar dataKey="sales" fill="#f7c95b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Productos mas vendidos">
          {bestSellers.length > 0 ? (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={bestSellers} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={130} />
                  <Tooltip />
                  <Bar dataKey="units" fill="#4ade80" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ opacity: 0.5 }}>Sin datos de ventas aún.</p>
          )}
        </Section>
      </div>

      {/* Gestión de Productos */}
      <Section title="Productos del menú">
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button className="primary-button" type="button" onClick={openNuevoProducto}>
            + Nuevo producto
          </button>
          <button className="ghost-button" type="button" onClick={() => navigate('/admin/productos')}>
            Gestión completa →
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.slice(0, 8).map((p) => (
                <tr key={p.productosId}>
                  <td>{p.productosNombre}</td>
                  <td>{p.categoria?.categoriasNombre || '—'}</td>
                  <td>{formatMoney(parseFloat(p.productosPrecio || 0))}</td>
                  <td>{p.productosDisponible ? '✅' : '❌'}</td>
                  <td>
                    <button className="ghost-button" type="button" onClick={() => openEditProducto(p)} style={{ marginRight: '0.5rem' }}>
                      Editar
                    </button>
                    <button className="ghost-button" type="button" onClick={() => deleteProducto(p.productosId)} style={{ color: '#ef4444' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Gestión de Empleados */}
      <Section title="Empleados">
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button className="primary-button" type="button" onClick={openNuevoEmpleado}>
            + Nuevo empleado
          </button>
        </div>
        {loadingEmps ? <LoadingSpinner text="Cargando empleados..." /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((emp) => (
                  <tr key={emp.empleadosId}>
                    <td>{emp.empleadosNombre}</td>
                    <td><span className="role-badge">{emp.empleadosRol}</span></td>
                    <td>{emp.empleadosTelefono || '—'}</td>
                    <td>{emp.empleadosEmail || '—'}</td>
                    <td>{emp.empleadosActivo ? '✅' : '❌'}</td>
                    <td>
                      <button className="ghost-button" type="button" onClick={() => openEditEmpleado(emp)} style={{ marginRight: '0.5rem' }}>
                        Editar
                      </button>
                      <button className="ghost-button" type="button" onClick={() => deleteEmpleado(emp.empleadosId)} style={{ color: '#ef4444' }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {empleados.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', opacity: 0.5 }}>No hay empleados registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Modal Producto */}
      <Modal open={modalProducto} onClose={() => setModalProducto(false)} title={editProducto ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={saveProducto} className="crud-form">
          <label>Nombre <input required value={fProd.productosNombre} onChange={(e) => setFProd({ ...fProd, productosNombre: e.target.value })} /></label>
          <label>Descripción <textarea value={fProd.productosDescripcion} onChange={(e) => setFProd({ ...fProd, productosDescripcion: e.target.value })} /></label>
          <label>Precio (S/) <input required type="number" step="0.01" min="0" value={fProd.productosPrecio} onChange={(e) => setFProd({ ...fProd, productosPrecio: e.target.value })} /></label>
          <label>Categoría
            <select value={fProd.categoriaId} onChange={(e) => setFProd({ ...fProd, categoriaId: e.target.value })}>
              <option value="">Sin categoría</option>
              {categorias.map((c) => <option key={c.categoriasId} value={c.categoriasId}>{c.categoriasNombre}</option>)}
            </select>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={fProd.productosDisponible} onChange={(e) => setFProd({ ...fProd, productosDisponible: e.target.checked })} />
            Disponible en menú
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="primary-button" type="submit">Guardar</button>
            <button className="ghost-button" type="button" onClick={() => setModalProducto(false)}>Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* Modal Empleado */}
      <Modal open={modalEmpleado} onClose={() => setModalEmpleado(false)} title={editEmpleado ? 'Editar empleado' : 'Nuevo empleado'}>
        <form onSubmit={saveEmpleado} className="crud-form">
          <label>Nombre completo <input required value={fEmp.empleadosNombre} onChange={(e) => setFEmp({ ...fEmp, empleadosNombre: e.target.value })} /></label>
          <label>Rol
            <select value={fEmp.empleadosRol} onChange={(e) => setFEmp({ ...fEmp, empleadosRol: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label>Teléfono <input value={fEmp.empleadosTelefono} onChange={(e) => setFEmp({ ...fEmp, empleadosTelefono: e.target.value })} /></label>
          <label>Email <input type="email" value={fEmp.empleadosEmail} onChange={(e) => setFEmp({ ...fEmp, empleadosEmail: e.target.value })} /></label>
          <label className="checkbox-label">
            <input type="checkbox" checked={fEmp.empleadosActivo} onChange={(e) => setFEmp({ ...fEmp, empleadosActivo: e.target.checked })} />
            Empleado activo
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="primary-button" type="submit">Guardar</button>
            <button className="ghost-button" type="button" onClick={() => setModalEmpleado(false)}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
