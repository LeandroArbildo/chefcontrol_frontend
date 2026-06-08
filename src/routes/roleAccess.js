export const roleNavigation = {
  mozo: [{ label: 'Mesas y pedidos', path: '/mozo' }],
  cocina: [{ label: 'Cocina', path: '/cocina' }],
  cajero: [{ label: 'Caja diaria', path: '/caja' }],
  delivery: [{ label: 'Delivery', path: '/delivery' }],
  admin: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Mozo', path: '/mozo' },
    { label: 'Cocina', path: '/cocina' },
    { label: 'Caja', path: '/caja' },
    { label: 'Delivery', path: '/delivery' },
    { label: 'Admin', path: '/admin' },
    { label: 'Reportes', path: '/reportes' }
  ]
};

export const routeRoles = {
  '/dashboard': ['admin'],
  '/mozo': ['mozo', 'admin'],
  '/cocina': ['cocina', 'admin'],
  '/caja': ['cajero', 'admin'],
  '/delivery': ['delivery', 'admin'],
  '/admin': ['admin'],
  '/reportes': ['admin']
};
