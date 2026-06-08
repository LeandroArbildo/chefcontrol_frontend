import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import { inventoryItems } from '../data/mockData.js';

export default function Inventario() {
  const [items, setItems] = useState(inventoryItems);

  function updateStock(itemId, amount) {
    setItems((current) => current.map((item) => (
      item.id === itemId ? { ...item, stock: Math.max(0, item.stock + amount) } : item
    )));
  }

  return (
    <>
      <PageHeader
        eyebrow="Almacen"
        title="Inventario"
        description="Control basico de insumos con alerta visual cuando el stock esta bajo."
      />

      <Section title="Insumos y productos">
        <div className="inventory-list">
          {items.map((item) => {
            const isLow = item.stock <= item.minStock;
            return (
              <article className={isLow ? 'inventory-item inventory-item--low' : 'inventory-item'} key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>Minimo: {item.minStock} {item.unit}</p>
                </div>
                <div className="stock-meter">
                  <strong>{item.stock}</strong>
                  <span>{item.unit}</span>
                </div>
                {isLow && <span className="stock-alert">Stock bajo</span>}
                <div className="stepper">
                  <button type="button" onClick={() => updateStock(item.id, -1)}>-</button>
                  <button type="button" onClick={() => updateStock(item.id, 1)}>+</button>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </>
  );
}
