import { useMemo, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import OrderCard from '../components/OrderCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import TableMap from '../components/TableMap.jsx';
import ToastContainer from '../components/ToastContainer.jsx';
import { useToast } from '../hooks/useToast.js';
import { formatMoney } from '../services/orderService.js';
import { tipoPedidoService } from '../services/api/tipoPedidoService.js';
import { empleadoService } from '../services/api/empleadoService.js';
import { useApiStore } from '../services/useApiStore.js';
import { useEffect } from 'react';

export default function MozoPanel() {
  const { pedidos, mesas, productos, categorias, loading, crearPedido } = useApiStore();
  const { toasts, success, error: toastError } = useToast();

  const [selectedMesa, setSelectedMesa] = useState(null);
  const [cart, setCart] = useState([]);
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sending, setSending] = useState(false);
  const [tiposPedido, setTiposPedido] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedEmpleado, setSelectedEmpleado] = useState('');

  // Cargar tipos de pedido y empleados disponibles
  useEffect(() => {
    tipoPedidoService.listar().then(setTiposPedido).catch(() => {});
    empleadoService.listarPorRol('MESERO').then((lista) => {
      setEmpleados(lista);
      if (lista.length > 0) setSelectedEmpleado(String(lista[0].empleadosId));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (tiposPedido.length > 0 && !selectedTipo) {
      const salon = tiposPedido.find((t) =>
        t.tiposPedidoNombre?.toLowerCase().includes('mesa') ||
        t.tiposPedidoNombre?.toLowerCase().includes('salon')
      );
      setSelectedTipo(String(salon?.tiposPedidoId || tiposPedido[0]?.tiposPedidoId || ''));
    }
  }, [tiposPedido, selectedTipo]);

  // Agrupar productos por categoría
  const categoriasNombres = ['Todos', ...new Set(
    categorias.map((c) => c.categoriasNombre).filter(Boolean)
  )];

  // Mapear productos con nombre de categoría para filtrar
  const productosConCategoria = useMemo(() => productos.map((p) => ({
    ...p,
    id: p.productosId,
    name: p.productosNombre,
    price: parseFloat(p.productosPrecio || 0),
    category: categorias.find((c) => c.categoriasId === p.categoria?.categoriasId)?.categoriasNombre || 'Sin categoría',
    image: p.productosImagenUrl || null
  })), [productos, categorias]);

  const filteredItems = productosConCategoria.filter((item) => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(productId, amount) {
    setCart((current) =>
      current
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity + amount } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  async function sendToKitchen() {
    if (!cart.length) return;
    setSending(true);
    try {
      const dto = {
        mesaId: selectedMesa?.id || null,
        tipoPedidoId: selectedTipo ? parseInt(selectedTipo, 10) : null,
        empleadoId: selectedEmpleado ? parseInt(selectedEmpleado, 10) : null,
        observaciones: note || null,
        detalles: cart.map((item) => ({
          productoId: item.id,
          cantidad: item.quantity,
          observaciones: note || null
        }))
      };
      await crearPedido(dto);
      success('✅ Pedido enviado a cocina');
      setCart([]);
      setNote('');
    } catch (err) {
      toastError(`Error al enviar: ${err.message}`);
    } finally {
      setSending(false);
    }
  }

  const mesaSeleccionadaNombre = selectedMesa ? selectedMesa.name : 'Sin mesa seleccionada';

  return (
    <>
      <ToastContainer toasts={toasts} />
      <PageHeader
        eyebrow="Salon"
        title="Mesas y pedidos del mozo"
        description="Selecciona una mesa, arma el pedido y envia la comanda a cocina."
      />

      <Section title="Mapa de mesas (datos en vivo)">
        {loading && !mesas.length ? (
          <LoadingSpinner text="Cargando mesas..." />
        ) : (
          <TableMap
            selectedTable={selectedMesa?.name}
            onSelect={(mesa) => setSelectedMesa(mesa)}
          />
        )}
      </Section>

      <div className="two-column two-column--wide-left">
        <Section title={`Pedido para ${mesaSeleccionadaNombre}`}>
          <div className="waiter-order">
            {/* Selector de tipo de pedido y empleado */}
            <div className="catalog-toolbar">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                {tiposPedido.length > 0 && (
                  <label style={{ flex: 1 }}>
                    <span>Tipo de pedido</span>
                    <select value={selectedTipo} onChange={(e) => setSelectedTipo(e.target.value)}>
                      {tiposPedido.map((t) => (
                        <option key={t.tiposPedidoId} value={t.tiposPedidoId}>
                          {t.tiposPedidoNombre}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {empleados.length > 0 && (
                  <label style={{ flex: 1 }}>
                    <span>Mozo</span>
                    <select value={selectedEmpleado} onChange={(e) => setSelectedEmpleado(e.target.value)}>
                      {empleados.map((emp) => (
                        <option key={emp.empleadosId} value={emp.empleadosId}>
                          {emp.empleadosNombre}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <label className="search-field">
                <span>Buscar</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Busca pollo, chaufa, combo..."
                />
              </label>
              <div className="category-pills">
                {categoriasNombres.map((category) => (
                  <button
                    className={selectedCategory === category ? 'category-pill category-pill--active' : 'category-pill'}
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {loading && !productos.length ? (
              <LoadingSpinner text="Cargando menú del servidor..." />
            ) : (
              <div className="waiter-menu-grid">
                {filteredItems.map((item) => (
                  <article className="waiter-menu-card" key={item.id}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div>
                      <span>{item.category}</span>
                      <h3>{item.name}</h3>
                      {item.productosDescripcion && (
                        <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: '0.25rem 0' }}>
                          {item.productosDescripcion}
                        </p>
                      )}
                      <strong>{formatMoney(item.price)}</strong>
                    </div>
                    <button className="primary-button" type="button" onClick={() => addToCart(item)}>
                      Agregar
                    </button>
                  </article>
                ))}
                {filteredItems.length === 0 && (
                  <p className="empty-cart">No hay productos disponibles en esta categoría.</p>
                )}
              </div>
            )}
          </div>
        </Section>

        <Section title="Comanda">
          <div className="mozo-cart">
            {cart.length === 0 && <p className="empty-cart">Agrega productos para enviar a cocina.</p>}
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{formatMoney(item.price * item.quantity)}</span>
                </div>
                <div className="stepper">
                  <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
              </div>
            ))}

            <label>
              Nota general
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="sin sal, termino 3/4, papas crocantes, para llevar..."
              />
            </label>

            <div className="cart-total">
              <span>Total estimado</span>
              <strong>{formatMoney(total)}</strong>
            </div>
            <button
              className="primary-button"
              type="button"
              disabled={!cart.length || sending}
              onClick={sendToKitchen}
            >
              {sending ? 'Enviando...' : 'Enviar a cocina'}
            </button>
          </div>
        </Section>
      </div>

      <Section title="Pedidos recientes (en vivo)">
        <div className="card-grid">
          {pedidos.slice(0, 4).map((order) => <OrderCard order={order} key={order.id} />)}
          {!loading && pedidos.length === 0 && (
            <p className="empty-cart">No hay pedidos registrados aún.</p>
          )}
        </div>
      </Section>
    </>
  );
}
