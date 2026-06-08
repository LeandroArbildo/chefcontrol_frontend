import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuItems } from '../data/mockData.js';
import { formatMoney } from '../services/orderService.js';
import polleriaHero from '../assets/polleria-hero.png';

const whatsappNumber = '51999999999';

export default function ClienteMenu() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [orderType, setOrderType] = useState('Delivery');
  const [address, setAddress] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = [...new Set(menuItems.map((item) => item.category))];
  const categoryOptions = ['Todos', ...categories];
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
        return current.map((item) => (
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(productId, amount) {
    setCart((current) => current
      .map((item) => (item.id === productId ? { ...item, quantity: item.quantity + amount } : item))
      .filter((item) => item.quantity > 0));
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
          <span className="eyebrow">Polleria chifa</span>
          <h1>Brasa, chaufa y combos para pedir</h1>
          <p>Elige pollo a la brasa, platos chifa, entradas y bebidas. Arma tu carrito y envia el pedido por WhatsApp.</p>
          <a className="primary-button" href="#carta">Ver carta</a>
        </div>
        <div className="hero-dish" aria-hidden="true">
          <img
            src={polleriaHero}
            alt=""
          />
          <span>Polleria Chifa</span>
        </div>
      </header>

      <section className="customer-layout" id="carta">
        <div className="menu-catalog">
          <section className="catalog-panel">
            <div className="catalog-heading">
              <div>
                <span className="eyebrow">Menu</span>
                <h2>Carta polleria chifa</h2>
              </div>
              <small>{filteredItems.length} productos</small>
            </div>

            <div className="catalog-toolbar">
              <label className="search-field">
                <span>Buscar</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca un plato..." />
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

            <div className="menu-grid menu-grid--catalog">
              {filteredItems.map((item) => (
                <article className="menu-card dish-card" key={item.id}>
                  <div className="dish-photo">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.classList.add('dish-photo__img--hidden');
                      }}
                    />
                    <span>{item.category}</span>
                  </div>
                  <div className="dish-card__body">
                    <span className="dish-tag">{item.category}</span>
                    <h3>{item.name}</h3>
                    <p>{getDescription(item.category)}</p>
                  </div>
                  <div className="menu-card__footer">
                    <strong>{formatMoney(item.price)}</strong>
                    <button className="primary-button" type="button" onClick={() => addToCart(item)}>
                      Agregar
                    </button>
                  </div>
                </article>
              ))}
            </div>
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
              <input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Tu nombre" />
            </label>
            <label>
              Tipo de pedido
              <select value={orderType} onChange={(event) => setOrderType(event.target.value)}>
                <option>Delivery</option>
                <option>Recojo en tienda</option>
                <option>Consumo en mesa</option>
              </select>
            </label>
            <label>
              Direccion o mesa
              <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Av. / Mesa 5" />
            </label>
            <label>
              Nota
              <textarea value={generalNote} onChange={(event) => setGeneralNote(event.target.value)} placeholder="sin cebolla, para llevar, pagar con yape..." />
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

function getDescription(category) {
  const descriptions = {
    Pollos: 'Con papas, ensalada y cremas de la casa.',
    Chifa: 'Salteado al wok con sabor peruano oriental.',
    Combos: 'Brasa y chifa juntos para compartir.',
    Entradas: 'Para abrir el pedido con algo crocante.',
    Bebidas: 'Perfectas para acompanar la brasa.',
    Extras: 'Agrega cremas, papas o complementos.'
  };

  return descriptions[category] || 'Especial de la casa.';
}
