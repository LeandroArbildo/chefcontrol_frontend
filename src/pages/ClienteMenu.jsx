import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../services/orderService.js';
import { useApiStore } from '../services/useApiStore.js';
import polleriaHero from '../assets/polleria-hero.png';

const whatsappNumber = '51999999999';

export default function ClienteMenu() {
  const { productos, categorias, loading } = useApiStore();

  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [orderType, setOrderType] = useState('Delivery');
  const [address, setAddress] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Mapear productos disponibles del backend con nombre de categoría
  const menuItems = productos
    .filter((p) => p.productosDisponible !== false)
    .map((p) => ({
      id: p.productosId,
      name: p.productosNombre,
      price: parseFloat(p.productosPrecio || 0),
      category: categorias.find((c) => c.categoriasId === p.categoria?.categoriasId)?.categoriasNombre || 'Otros',
      image: p.productosImagenUrl || null,
      description: p.productosDescripcion || null
    }));

  const categoryOptions = ['Todos', ...new Set(menuItems.map((item) => item.category))];
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const whatsappUrl = useMemo(() => {
    const lines = [
      'Hola Chef Control, quiero hacer un pedido:',
      '',
      ...cart.map((item) => `- ${item.quantity} x ${item.name} (${formatMoney(item.price * item.quantity)})`),
      '',
      `Total: ${formatMoney(total)}`,
      `Tipo: ${orderType}`,
      customer ? `Nombre: ${customer}` : '',
      address ? `Direccion/Mesa: ${address}` : '',
      generalNote ? `Nota: ${generalNote}` : ''
    ].filter(Boolean);
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  }, [address, cart, customer, generalNote, orderType, total]);

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

  return (
    <main className="customer-page">
      <header className="customer-hero">
        <nav className="customer-nav">
          <div className="customer-logo">
            <span className="brand-mark">CC</span>
            <strong>Chef Control</strong>
          </div>
          <div className="customer-nav__links">
            <a href="#carta">Carta</a>
            <a href="#pedido">Pedido</a>
          </div>
          <Link className="ghost-button" to="/login">Acceso personal</Link>
        </nav>

        <div className="customer-hero__content">
          <span className="eyebrow">Menú en línea</span>
          <h1>Brasa, chaufa y combos para pedir</h1>
          <p>Elige tus platos favoritos, arma tu carrito y envía el pedido por WhatsApp.</p>
          <a className="primary-button" href="#carta">Ver carta</a>
        </div>
        <div className="hero-dish" aria-hidden="true">
          <img src={polleriaHero} alt="" />
          <span>Polleria Chifa</span>
        </div>
      </header>

      <section className="customer-layout" id="carta">
        <div className="menu-catalog">
          <section className="catalog-panel">
            <div className="catalog-heading">
              <div>
                <span className="eyebrow">Menú</span>
                <h2>Carta del restaurante</h2>
              </div>
              <small>
                {loading && !menuItems.length ? 'Cargando menú...' : `${filteredItems.length} productos`}
              </small>
            </div>

            <div className="catalog-toolbar">
              <label className="search-field">
                <span>Buscar</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca un plato..." />
              </label>
              <div className="category-pills">
                {categoryOptions.map((category) => (
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

            {loading && !menuItems.length ? (
              <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
                <p>🌅 Cargando menú del servidor...</p>
                <small>Si demora, el servidor puede estar despertando (cold start ~30s)</small>
              </div>
            ) : (
              <div className="menu-grid menu-grid--catalog">
                {filteredItems.map((item) => (
                  <article className="menu-card dish-card" key={item.id}>
                    <div className="dish-photo">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.classList.add('dish-photo__img--hidden'); }}
                        />
                      ) : (
                        <div className="dish-photo__placeholder">🍽️</div>
                      )}
                      <span>{item.category}</span>
                    </div>
                    <div className="dish-card__body">
                      <span className="dish-tag">{item.category}</span>
                      <h3>{item.name}</h3>
                      {item.description && <p>{item.description}</p>}
                    </div>
                    <div className="menu-card__footer">
                      <strong>{formatMoney(item.price)}</strong>
                      <button className="primary-button" type="button" onClick={() => addToCart(item)}>
                        Agregar
                      </button>
                    </div>
                  </article>
                ))}
                {filteredItems.length === 0 && !loading && (
                  <p style={{ opacity: 0.5, gridColumn: '1/-1' }}>No hay productos disponibles en esta categoría.</p>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="cart-panel" id="pedido">
          <div className="cart-panel__header">
            <div>
              <span className="eyebrow">Tu pedido</span>
              <h2>Carrito</h2>
            </div>
            <b>{totalItems}</b>
          </div>

          <div className="cart-items">
            {cart.length === 0 && <p className="empty-cart">Agrega platos para preparar tu pedido.</p>}
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
          </div>

          <div className="customer-form">
            <label>
              Nombre
              <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Tu nombre" />
            </label>
            <label>
              Tipo de pedido
              <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                <option>Delivery</option>
                <option>Recojo en tienda</option>
                <option>Consumo en mesa</option>
              </select>
            </label>
            <label>
              Direccion o mesa
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. / Mesa 5" />
            </label>
            <label>
              Nota
              <textarea value={generalNote} onChange={(e) => setGeneralNote(e.target.value)} placeholder="sin cebolla, para llevar, pagar con yape..." />
            </label>
          </div>

          <div className="cart-total">
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>

          <a
            className={cart.length === 0 ? 'primary-button primary-button--disabled' : 'primary-button'}
            href={cart.length === 0 ? undefined : whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            Enviar por WhatsApp
          </a>
        </aside>
      </section>
    </main>
  );
}
