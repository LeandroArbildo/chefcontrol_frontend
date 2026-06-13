import { useEffect } from 'react';

/**
 * Modal — Dialog genérico con overlay para formularios CRUD.
 * @param {boolean} open - Si está abierto
 * @param {() => void} onClose - Callback al cerrar
 * @param {string} title - Título del modal
 * @param {React.ReactNode} children - Contenido
 */
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button
            className="modal-close"
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
