/**
 * ToastContainer — Renderiza la lista de toasts en pantalla.
 * Usar junto con useToast().
 */
export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#60a5fa'
  };

  return (
    <div
      id="toast-container"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 10000
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          style={{
            background: '#1e293b',
            border: `1px solid ${colors[toast.type]}`,
            borderLeft: `4px solid ${colors[toast.type]}`,
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#f1f5f9',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.2s ease',
            maxWidth: '340px',
            minWidth: '200px'
          }}
        >
          <span>{icons[toast.type]}</span>
          <span>{toast.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
