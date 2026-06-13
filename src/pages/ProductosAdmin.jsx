import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import ToastContainer from '../components/ToastContainer.jsx';
import { useToast } from '../hooks/useToast.js';
import { categoriaService } from '../services/api/categoriaService.js';
import { productoService } from '../services/api/productoService.js';
import { formatMoney } from '../services/orderService.js';

export default function ProductosAdmin() {
  const { toasts, success, error: toastError } = useToast();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [filterDisp, setFilterDisp] = useState('todos');

  const [form, setForm] = useState({
    productosNombre: '', productosDescripcion: '', productosPrecio: '',
    categoriaId: '', productosDisponible: true, productosImagenUrl: '',
    productosTiempoPreparacion: ''
  });

  async function load() {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productoService.listar(),
        categoriaService.listar()
      ]);
      setProductos(prods);
      setCategorias(cats);
    } catch (err) {
      toastError(`Error al cargar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = productos.filter((p) => {
    const catOk = !filterCat || p.categoria?.categoriasId === parseInt(filterCat, 10);
    const dispOk = filterDisp === 'todos' || (filterDisp === 'disponible' ? p.productosDisponible : !p.productosDisponible);
    return catOk && dispOk;
  });

  function openNew() {
    setEditItem(null);
    setForm({ productosNombre: '', productosDescripcion: '', productosPrecio: '', categoriaId: '', productosDisponible: true, productosImagenUrl: '', productosTiempoPreparacion: '' });
    setModalOpen(true);
  }
  function openEdit(p) {
    setEditItem(p);
    setForm({
      productosNombre: p.productosNombre || '',
      productosDescripcion: p.productosDescripcion || '',
      productosPrecio: p.productosPrecio || '',
      categoriaId: p.categoria?.categoriasId || '',
      productosDisponible: p.productosDisponible !== false,
      productosImagenUrl: p.productosImagenUrl || '',
      productosTiempoPreparacion: p.productosTiempoPreparacion || ''
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const body = {
        productosNombre: form.productosNombre,
        productosDescripcion: form.productosDescripcion || null,
        productosPrecio: parseFloat(form.productosPrecio),
        productosDisponible: form.productosDisponible,
        productosImagenUrl: form.productosImagenUrl || null,
        productosTiempoPreparacion: form.productosTiempoPreparacion ? parseInt(form.productosTiempoPreparacion, 10) : null,
        categoria: form.categoriaId ? { categoriasId: parseInt(form.categoriaId, 10) } : null
      };
      if (editItem) {
        await productoService.actualizar(editItem.productosId, body);
        success('Producto actualizado correctamente');
      } else {
        await productoService.crear(body);
        success('Producto creado correctamente');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este producto del menú?')) return;
    try {
      await productoService.eliminar(id);
      success('Producto eliminado');
      load();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  async function toggleDisponible(p) {
    try {
      await productoService.actualizar(p.productosId, {
        ...p,
        productosDisponible: !p.productosDisponible,
        categoria: p.categoria
      });
      success(p.productosDisponible ? 'Producto desactivado' : 'Producto activado');
      load();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} />
      <PageHeader
        eyebrow="Administración"
        title="Gestión de Productos"
        description="CRUD completo del menú del restaurante. Los cambios se reflejan en tiempo real."
      />

      <Section title={`Productos (${filtered.length})`}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <button className="primary-button" type="button" onClick={openNew}>
            + Nuevo producto
          </button>
          <label>
            <span>Categoría</span>
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.categoriasId} value={c.categoriasId}>{c.categoriasNombre}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Estado</span>
            <select value={filterDisp} onChange={(e) => setFilterDisp(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="disponible">Disponibles</option>
              <option value="no_disponible">No disponibles</option>
            </select>
          </label>
        </div>

        {loading ? (
          <LoadingSpinner text="Cargando productos..." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Prep. (min)</th>
                  <th>Disponible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.productosId}>
                    <td>#{p.productosId}</td>
                    <td>
                      <strong>{p.productosNombre}</strong>
                      {p.productosDescripcion && (
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{p.productosDescripcion}</div>
                      )}
                    </td>
                    <td>{p.categoria?.categoriasNombre || '—'}</td>
                    <td>{formatMoney(parseFloat(p.productosPrecio || 0))}</td>
                    <td>{p.productosTiempoPreparacion ? `${p.productosTiempoPreparacion} min` : '—'}</td>
                    <td>
                      <button
                        className={p.productosDisponible ? 'primary-button' : 'ghost-button'}
                        type="button"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => toggleDisponible(p)}
                      >
                        {p.productosDisponible ? '✅ Sí' : '❌ No'}
                      </button>
                    </td>
                    <td>
                      <button className="ghost-button" type="button" onClick={() => openEdit(p)} style={{ marginRight: '0.5rem' }}>
                        Editar
                      </button>
                      <button className="ghost-button" type="button" onClick={() => handleDelete(p.productosId)} style={{ color: '#ef4444' }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', opacity: 0.5 }}>
                      No hay productos con estos filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? `Editar: ${editItem.productosNombre}` : 'Nuevo producto'}
      >
        <form onSubmit={handleSave} className="crud-form">
          <label>Nombre del producto *
            <input required value={form.productosNombre} onChange={(e) => setForm({ ...form, productosNombre: e.target.value })} placeholder="Ej: 1/4 Pollo a la brasa" />
          </label>
          <label>Descripción
            <textarea value={form.productosDescripcion} onChange={(e) => setForm({ ...form, productosDescripcion: e.target.value })} placeholder="Descripción corta del producto" />
          </label>
          <label>Precio (S/) *
            <input required type="number" step="0.01" min="0" value={form.productosPrecio} onChange={(e) => setForm({ ...form, productosPrecio: e.target.value })} placeholder="0.00" />
          </label>
          <label>Categoría
            <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.categoriasId} value={c.categoriasId}>{c.categoriasNombre}</option>
              ))}
            </select>
          </label>
          <label>Tiempo de preparación (minutos)
            <input type="number" min="0" value={form.productosTiempoPreparacion} onChange={(e) => setForm({ ...form, productosTiempoPreparacion: e.target.value })} placeholder="Ej: 15" />
          </label>
          <label>URL de imagen
            <input type="url" value={form.productosImagenUrl} onChange={(e) => setForm({ ...form, productosImagenUrl: e.target.value })} placeholder="https://..." />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.productosDisponible} onChange={(e) => setForm({ ...form, productosDisponible: e.target.checked })} />
            Disponible en el menú
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="primary-button" type="submit">
              {editItem ? 'Guardar cambios' : 'Crear producto'}
            </button>
            <button className="ghost-button" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
