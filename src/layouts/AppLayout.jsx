import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { roleNavigation } from '../routes/roleAccess.js';
import { clearCurrentRole, getCurrentRole, getDefaultRouteForRole } from '../services/authService.js';

export default function AppLayout() {
  const navigate = useNavigate();
  const role = getCurrentRole();
  const navigationItems = roleNavigation[role?.id] || [];

  function logout() {
    clearCurrentRole();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => navigate(getDefaultRouteForRole(role?.id))}>
          <span>CC</span>
          <div>
            <strong>Chef Control</strong>
            <small>{role?.name || 'Restaurante'}</small>
          </div>
        </button>

        <nav>
          {navigationItems.map((item) => (
            <NavLink key={item.path} to={item.path}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="ghost-button sidebar-public-menu" type="button" onClick={() => navigate('/')}>
          Carta cliente
        </button>
        <button className="ghost-button sidebar-logout" type="button" onClick={logout}>
          Cerrar sesion
        </button>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
