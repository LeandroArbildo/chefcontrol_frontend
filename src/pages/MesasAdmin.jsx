import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import ToastContainer from '../components/ToastContainer.jsx';
import { useToast } from '../hooks/useToast.js';
import { mesaService } from '../services/api/mesaService.js';

const ESTADOS = ['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'FUERA_DE_SERVICIO'];
const ESTADO_LABELS = {
  DISPONIBLE: 'Disponible',
  OCUPADA: 'Ocupada',
  RESERVADA: 'Reservada',
  FUERA_DE_SERVICIO: 'Fuera de servicio'
};

export default function MesasAdmin() {
  const { toasts, success, error: toastError } = useToast();
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ mesasNumero: '', mesasCapacidad: '', mesasEstado: 'DISPONIBLE', mesasActiva: true });

  async function load() {
    setLoading(true);
    try {
      const data = await mesaService.listar();
      setMesas(data);
    } catch (err) {
      toastError(`Error al cargar mesas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditItem(null);
    setForm({ mesasNumero: '', mesasCapacidad: '', mesasEstado: 'DISPONIBLE', mesasActiva: true });
    setModalOpen(true);
  }
  function openEdit(m) {
    setEditItem(m);
    setForm({
      mesasNumero: m.mesasNumero,
      mesasCapacidad: m.mesasCapacidad,
      mesasEstado: m.mesasEstado,
      mesasActiva: m.mesasActiva !== false
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const body = {
        mesasNumero: parseInt(form.mesasNumero, 10),
        mesasCapacidad: parseInt(form.mesasCapacidad, 10),
        mesasEstado: form.mesasEstado,
        mesasActiva: form.mesasActiva
      };
      if (editItem) {
        await mesaService.actualizar(editItem.mesasId, body);
        success('Mesa actualizada correctamente');
      } else {
        await mesaService.crear(body);
        success('Mesa creada correctamente');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta mesa?')) return;
    try {
      await mesaService.eliminar(id);
      success('Mesa eliminada');
      load();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  async function cambiarEstado(mesa, estado) {
    try {
      await mesaService.cambiarEstado(mesa.mesasId, estado);
      success(`Mesa ${mesa.mesasNumero} → ${ESTADO_LABELS[estado]}`);
      load();
    } catch (err) {
      toastError(`Error: ${err.message}`);
    }
  }

  const estadoColors = {
    DISPONIBLE: '#22c55e',
    OCUPADA: '#ef4444',
    RESERVADA: '#f59e0b',
    FUERA_DE_SERVICIO: '#64748b'
  };

  return (
    <>
      <ToastContainer toasts={toasts} />
      <PageHeader
        eyebrow="Administración"
        title="Gestión de Mesas"
        description="CRUD completo de mesas del restaurante. Cambia estados manualmente."
      />

      <Section title={`Mesas (${mesas.length})`}>
        <div style={{ marginBottom: '1rem' }}>
          <button className="primary-button" type="button" onClick={openNew}>
            + Nueva mesa
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Cargando mesas..." />
        ) : (
          <div className="tables-admin-grid">
            {mesas.map((m) => (
              <div
                key={m.mesasId}
                className="mesa-card"
                style={{ borderColor: estadoColors[m.mesasEstado] }}
              >
                <div className="mesa-card__header">
                  <strong>Mesa {m.mesasNumero}</strong>
                  <span style={{ color: estadoColors[m.mesasEstado], fontSize: '0.75rem' }}>
                    ● {ESTADO_LABELS[m.mesasEstado]}
                  </span>
                </div>
                <div className="mesa-card__info">
                  <span>👥 {m.mesasCapacidad} personas</span>
                  <span>{m.mesasActiva ? '✅ Activa' : '⛔ Inactiva'}</span>
                </div>
                <div className="mesa-card__actions">
                  <select
                    value={m.mesasEstado}
                    onChange={(e) => cambiarEstado(m, e.target.value)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
                    ))}
                  </select>
                  <button className="ghost-button" type="button" onClick={() => openEdit(m)}>
                    Editar
                  </button>
                  <button className="ghost-button" type="button" onClick={() => handleDelete(m.mesasId)} style={{ color: '#ef4444' }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {mesas.length === 0 && (
              <p style={{ opacity: 0.5 }}>No hay mesas registradas. Crea la primera mesa.</p>
            )}
          </div>
        )}
      </Section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? `Editar mesa ${editItem.mesasNumero}` : 'Nueva mesa'}>
        <form onSubmit={handleSave} className="crud-form">
          <label>Número de mesa *
            <input required type="number" min="1" value={form.mesasNumero} onChange={(e) => setForm({ ...form, mesasNumero: e.target.value })} placeholder="Ej: 12" />
          </label>
          <label>Capacidad (personas) *
            <input required type="number" min="1" value={form.mesasCapacidad} onChange={(e) => setForm({ ...form, mesasCapacidad: e.target.value })} placeholder="Ej: 4" />
          </label>
          <label>Estado inicial
            <select value={form.mesasEstado} onChange={(e) => setForm({ ...form, mesasEstado: e.target.value })}>
              {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
            </select>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={form.mesasActiva} onChange={(e) => setForm({ ...form, mesasActiva: e.target.checked })} />
            Mesa activa
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="primary-button" type="submit">
              {editItem ? 'Guardar cambios' : 'Crear mesa'}
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
