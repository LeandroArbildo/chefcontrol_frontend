/**
 * LoadingSpinner — Spinner de carga con tamaños configurables.
 */
export default function LoadingSpinner({ size = 'md', text = 'Cargando...' }) {
  const sizes = { sm: '1rem', md: '2rem', lg: '3rem' };
  const dim = sizes[size] || sizes.md;

  return (
    <div className="loading-spinner-wrap" role="status" aria-label={text}>
      <span
        className="loading-spinner"
        style={{ width: dim, height: dim }}
        aria-hidden="true"
      />
      {text && <span className="loading-spinner-text">{text}</span>}
    </div>
  );
}
