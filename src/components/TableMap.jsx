import { useApiStore } from '../services/useApiStore.js';

/**
 * TableMap — Mapa visual de mesas con datos en vivo del backend.
 * Los estados de las mesas se calculan dinámicamente desde los pedidos activos.
 */
export default function TableMap({ selectedTable, onSelect, compact = false }) {
  const { mesas, pedidos } = useApiStore();

  // Calcular estado visual de cada mesa según pedidos activos
  const mesasConEstado = mesas.map((mesa) => {
    const pedidosMesa = pedidos.filter(
      (p) => p.table === mesa.name && !['entregado', 'cancelado'].includes(p.status)
    );
    let visualStatus = mesa.status; // estado del backend por defecto

    if (pedidosMesa.length > 0) {
      const tieneListos = pedidosMesa.some((p) => p.status === 'listo');
      const tieneEnPrep = pedidosMesa.some((p) => p.status === 'en preparacion');
      const tienePendientes = pedidosMesa.some((p) => p.status === 'pendiente');

      if (tieneListos) visualStatus = 'lista';
      else if (tieneEnPrep || tienePendientes) visualStatus = 'ocupada';
    }

    return { ...mesa, visualStatus };
  });

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
        {mesasConEstado.map((mesa) => (
          <button
            className={[
              'table-tile',
              `table-tile--${mesa.visualStatus}`,
              selectedTable === mesa.name ? 'table-tile--selected' : ''
            ].filter(Boolean).join(' ')}
            key={mesa.id}
            type="button"
            onClick={() => onSelect?.(mesa)}
          >
            <strong>{mesa.numero}</strong>
            <span>{mesa.visualStatus}</span>
            <small>{mesa.seats} pers.</small>
          </button>
        ))}
        {mesasConEstado.length === 0 && (
          <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>
            Cargando mesas...
          </p>
        )}
      </div>
    </section>
  );
}
