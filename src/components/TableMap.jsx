import { getTablesFromOrders, useRestaurantState } from '../services/restaurantStore.js';

export default function TableMap({ selectedTable, onSelect, compact = false }) {
  const { orders } = useRestaurantState();
  const tables = getTablesFromOrders(orders);

  return (
    <section className={compact ? 'table-map table-map--compact' : 'table-map'}>
      <div className="table-map__legend">
        <span><i className="dot dot--disponible" />Disponible</span>
        <span><i className="dot dot--ocupada" />Ocupada</span>
        <span><i className="dot dot--esperando" />Esperando</span>
        <span><i className="dot dot--lista" />Lista</span>
        <span><i className="dot dot--reservada" />Reservada</span>
      </div>

      <div className="tables-grid">
        {tables.map((table) => (
          <button
            className={[
              'table-tile',
              `table-tile--${table.status}`,
              selectedTable === table.name ? 'table-tile--selected' : ''
            ].filter(Boolean).join(' ')}
            key={table.id}
            type="button"
            onClick={() => onSelect?.(table)}
          >
            <strong>{table.id}</strong>
            <span>{table.status}</span>
            <small>{table.seats} pers.</small>
          </button>
        ))}
      </div>
    </section>
  );
}
