import { useMemo, useState } from 'react';
import OrderCard from '../components/OrderCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import TableMap from '../components/TableMap.jsx';
import { menuItems, restaurantTables } from '../data/mockData.js';
import { formatMoney } from '../services/orderService.js';
import { addOrder, useRestaurantState } from '../services/restaurantStore.js';

export default function MozoPanel() {
  const { orders } = useRestaurantState();
  const [selectedTable, setSelectedTable] = useState(restaurantTables[0].name);
  const [cart, setCart] = useState([]);
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', ...new Set(menuItems.map((item) => item.category))];
  const filteredItems = menuItems.filter((item) => {
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

  function sendToKitchen() {
    if (!cart.length) return;

    const newOrder = {
      id: `P-${1030 + orders.length + 1}`,
      table: selectedTable,
      waiter: 'Mozo demo',
      type: note.toLowerCase().includes('llevar') ? 'Para llevar' : 'Salon',
      status: 'pendiente',
      paid: false,
      paymentMethod: null,
      createdAt: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        note
      }))
    };

    addOrder(newOrder);
    setCart([]);
    setNote('');
  }

  return (
    <>
      <PageHeader
        eyebrow="Salon"
        title="Mesas y pedidos del mozo"
        description="Selecciona una mesa, arma el pedido como carrito y envia la comanda completa a cocina."
      />

      <Section title="Mapa de mesas">
        <TableMap selectedTable={selectedTable} onSelect={(table) => setSelectedTable(table.name)} />
      </Section>

      <div className="two-column two-column--wide-left">
        <Section title={`Pedido para ${selectedTable}`}>
          <div className="waiter-order">
            <div className="catalog-toolbar">
              <label className="search-field">
                <span>Buscar</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca pollo, chaufa, combo..." />
              </label>
              <div className="category-pills">
                {categories.map((category) => (
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

            <div className="waiter-menu-grid">
              {filteredItems.map((item) => (
                <article className="waiter-menu-card" key={item.id}>
                  <img src={item.image} alt={item.name} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                  <div>
                    <span>{item.category}</span>
                    <h3>{item.name}</h3>
                    <strong>{formatMoney(item.price)}</strong>
                  </div>
                  <button className="primary-button" type="button" onClick={() => addToCart(item)}>
                    Agregar
                  </button>
                </article>
              ))}
            </div>
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
              <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="sin sal, termino 3/4, papas crocantes, para llevar..." />
            </label>

            <div className="cart-total">
              <span>Total</span>
              <strong>{formatMoney(total)}</strong>
            </div>
            <button className="primary-button" type="button" disabled={!cart.length} onClick={sendToKitchen}>
              Enviar a cocina
            </button>
          </div>
        </Section>
      </div>

      <Section title="Pedidos recientes del mozo">
        <div className="card-grid">
          {orders.slice(0, 4).map((order) => <OrderCard order={order} key={order.id} />)}
        </div>
      </Section>
    </>
  );
}
