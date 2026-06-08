import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentRole, getDefaultRouteForRole } from '../services/authService.js';
import { routeRoles } from '../routes/roleAccess.js';

export default function ProtectedRoute({ children, path }) {
  const location = useLocation();
  const role = getCurrentRole();

  if (!role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const allowedRoles = routeRoles[path] || [];
  if (!allowedRoles.includes(role.id)) {
    return <Navigate to={getDefaultRouteForRole(role.id)} replace />;
  }

  return children;
}
