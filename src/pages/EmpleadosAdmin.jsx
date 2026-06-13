import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import ToastContainer from '../components/ToastContainer.jsx';
import { useToast } from '../hooks/useToast.js';
import { empleadoService } from '../services/api/empleadoService.js';

const ROLES = ['MESERO', 'COCINERO', 'CAJERO', 'ADMINISTRADOR', 'BARTENDER'];
const ROL_EMOJIS = { MESERO: '🙋', COCINERO: '👨‍🍳', CAJERO: '💰', ADMINISTRADOR: '🔑', BARTENDER: '🍹' };

export default function EmpleadosAdmin() {
  const { toasts, success, error: toastError } = useToast();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterRol, setFilterRol] = useState('');
  const [filterActivo, setFilterActivo] = useState('todos');

  const [form, setForm] = useState({
    empleadosNombre: '', empleadosRol: 'MESERO', empleadosTelefono: '',
    empleadosEmail: '', empleadosActivo: true
  });

  async function load() {
    setLoading(true);
    try {
      const data = await empleadoService.listar();
      setEmpleados(data);
    } catch (err) {
      toastError(`Error al cargar empleados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = empleados.filter((e) => {
    const rolOk = !filterRol || e.empleadosRol === filterRol;
    const activoOk = filterActivo === 'todos' || (filterActivo === 'activos' ? e.empleadosActivo : !e.empleadosActivo);
    return rolOk && activoOk;
  });

  function openNew() {
    setEditItem(null);
    setForm({ empleadosNombre: '', empleadosRol: 'MESERO', empleadosTelefono: '', empleadosEmail: '', empleadosActivo: true });
    setModalOpen(true);
  }
  function openEdit(emp) {
    setEditItem(emp);
    setForm({
      empleadosNombre: emp.empleadosNombre || '',
      empleadosRol: emp.empleadosRol || 'MESERO',
      empleadosTelefono: emp.empleadosTelefono || '',
      empleadosEmail: emp.empleadosEmail || '',
      empleadosActivo: emp.empleadosActivo !== false
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editItem) {
        await empleadoService.actualizar(editItem.empleadosId, form);
        success('Empleado actualizado correctamente');
      } else {
        await empleadoService.crear(form);
        success('Empleado registrado correctamente');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  async function handleDelete(id, nombre) {
    if (!window.confirm(`¿Eliminar a ${nombre}?`)) return;
    try {
      await empleadoService.eliminar(id);
      success('Empleado eliminado');
      load();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  async function toggleActivo(emp) {
    try {
      await empleadoService.actualizar(emp.empleadosId, { ...emp, empleadosActivo: !emp.empleadosActivo });
      success(emp.empleadosActivo ? 'Empleado desactivado' : 'Empleado activado');
      load();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  const rolColors = {
    MESERO: '#60a5fa', COCINERO: '#f97316', CAJERO: '#22c55e',
    ADMINISTRADOR: '#a78bfa', BARTENDER: '#f59e0b'
  };

  return (
    <>
      <ToastContainer toasts={toasts} />
      <PageHeader
        eyebrow="Administración"
        title="Gestión de Empleados"
        description="CRUD completo del personal del restaurante."
      />

      <Section title={`Empleados (${filtered.length})`}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <button className="primary-button" type="button" onClick={openNew}>
            + Nuevo empleado
          </button>
          <label>
            <span>Rol</span>
            <select value={filterRol} onChange={(e) => setFilterRol(e.target.value)}>
              <option value="">Todos los roles</option>
              {ROLES.map((r) => <option key={r} value={r}>{ROL_EMOJIS[r]} {r}</option>)}
            </select>
          </label>
          <label>
            <span>Estado</span>
            <select value={filterActivo} onChange={(e) => setFilterActivo(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </label>
        </div>

        {loading ? (
          <LoadingSpinner text="Cargando personal..." />
        ) : (
          <div className="empleados-grid">
            {filtered.map((emp) => (
              <div key={emp.empleadosId} className="empleado-card" style={{ opacity: emp.empleadosActivo ? 1 : 0.5 }}>
                <div className="empleado-card__avatar" style={{ background: rolColors[emp.empleadosRol] || '#64748b' }}>
                  {ROL_EMOJIS[emp.empleadosRol] || '👤'}
                </div>
                <div className="empleado-card__info">
                  <strong>{emp.empleadosNombre}</strong>
                  <span
                    style={{
                      color: rolColors[emp.empleadosRol],
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {emp.empleadosRol}
                  </span>
                  {emp.empleadosTelefono && <small>📞 {emp.empleadosTelefono}</small>}
                  {emp.empleadosEmail && <small>✉️ {emp.empleadosEmail}</small>}
                </div>
                <div className="empleado-card__actions">
                  <button
                    className={emp.empleadosActivo ? 'primary-button' : 'ghost-button'}
                    type="button"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => toggleActivo(emp)}
                  >
                    {emp.empleadosActivo ? 'Activo' : 'Inactivo'}
                  </button>
                  <button className="ghost-button" type="button" onClick={() => openEdit(emp)}>
                    Editar
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => handleDelete(emp.empleadosId, emp.empleadosNombre)}
                    style={{ color: '#ef4444' }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p style={{ opacity: 0.5, gridColumn: '1/-1' }}>
                No hay empleados con estos filtros.
              </p>
            )}
          </div>
        )}
      </Section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? `Editar: ${editItem.empleadosNombre}` : 'Nuevo empleado'}>
        <form onSubmit={handleSave} className="crud-form">
          <label>Nombre completo *
            <input required value={form.empleadosNombre} onChange={(e) => setForm({ ...form, empleadosNombre: e.target.value })} placeholder="Ej: Juan Quispe" />
          </label>
          <label>Rol *
            <select value={form.empleadosRol} onChange={(e) => setForm({ ...form, empleadosRol: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{ROL_EMOJIS[r]} {r}</option>)}
            </select>
          </label>
          <label>Teléfono
            <input value={form.empleadosTelefono} onChange={(e) => setForm({ ...form, empleadosTelefono: e.target.value })} placeholder="Ej: 987654321" />
          </label>
          <label>Email
            <input type="email" value={form.empleadosEmail} onChange={(e) => setForm({ ...form, empleadosEmail: e.target.value })} placeholder="email@correo.com" />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.empleadosActivo} onChange={(e) => setForm({ ...form, empleadosActivo: e.target.checked })} />
            Empleado activo
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="primary-button" type="submit">
              {editItem ? 'Guardar cambios' : 'Registrar empleado'}
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
