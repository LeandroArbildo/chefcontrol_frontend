import { useEffect, useState } from 'react';
import { pingBackend } from '../services/api/apiClient.js';

/**
 * ApiStatus — Muestra si el backend en Render está disponible.
 * En Render free tier el backend puede tardar hasta 60s en despertar.
 */
export default function ApiStatus() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'online' | 'offline' | 'waking'
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let wakeTimer = null;

    async function check() {
      const ok = await pingBackend();
      if (cancelled) return;
      if (ok) {
        setStatus('online');
      } else if (attempt < 3) {
        setStatus('waking');
        wakeTimer = setTimeout(() => {
          if (!cancelled) {
            setAttempt((a) => a + 1);
          }
        }, 15000);
      } else {
        setStatus('offline');
      }
    }

    check();
    return () => {
      cancelled = true;
      if (wakeTimer) clearTimeout(wakeTimer);
    };
  }, [attempt]);

  if (status === 'online') return null; // Sin ruido cuando todo está bien

  const configs = {
    checking: { color: '#94a3b8', icon: '⏳', text: 'Conectando con el servidor...' },
    waking: { color: '#f59e0b', icon: '🌅', text: 'Despertando servidor Render (puede tardar ~30s en cold start)...' },
    offline: { color: '#ef4444', icon: '🔴', text: 'Backend no disponible. Verifica que el servicio en Render esté activo.' }
  };

  const { color, icon, text } = configs[status] || configs.checking;

  return (
    <div
      id="api-status-banner"
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        background: '#1e293b',
        border: `1px solid ${color}`,
        borderRadius: '0.5rem',
        padding: '0.6rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.8rem',
        color,
        zIndex: 9999,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        maxWidth: '340px'
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
      {status === 'waking' && (
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: color,
            animation: 'spin 1s linear infinite',
            flexShrink: 0
          }}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
