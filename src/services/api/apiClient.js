/**
 * apiClient.js — Cliente base para todas las peticiones al backend ChefControl.
 * Lee VITE_API_URL del entorno; en desarrollo usa el proxy de Vite (/api → localhost:8080).
 */

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

/**
 * Realiza una petición HTTP al backend.
 * @param {string} path - Ruta relativa, p.ej. "/pedidos"
 * @param {RequestInit} options - Opciones fetch
 * @returns {Promise<any>} JSON de respuesta
 */
export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error = new Error(`Error ${response.status}: ${text || response.statusText}`);
    error.status = response.status;
    throw error;
  }

  // 204 No Content → no hay body
  if (response.status === 204) return null;

  return response.json();
}

/** Comprueba si el backend responde (ping a /api/categorias) */
export async function pingBackend() {
  try {
    const res = await fetch(`${BASE_URL}/categorias`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
