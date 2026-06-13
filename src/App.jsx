import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import CajaPanel from './pages/CajaPanel.jsx';
import ClienteMenu from './pages/ClienteMenu.jsx';
import CocinaPanel from './pages/CocinaPanel.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DeliveryPanel from './pages/DeliveryPanel.jsx';
import EmpleadosAdmin from './pages/EmpleadosAdmin.jsx';
import Login from './pages/Login.jsx';
import MesasAdmin from './pages/MesasAdmin.jsx';
import MozoPanel from './pages/MozoPanel.jsx';
import ProductosAdmin from './pages/ProductosAdmin.jsx';
import Reportes from './pages/Reportes.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      {/* Ruta pública — carta para clientes */}
      <Route path="/" element={<ClienteMenu />} />
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas dentro del layout de la app */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute path="/dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="/mozo" element={<ProtectedRoute path="/mozo"><MozoPanel /></ProtectedRoute>} />
        <Route path="/cocina" element={<ProtectedRoute path="/cocina"><CocinaPanel /></ProtectedRoute>} />
        <Route path="/caja" element={<ProtectedRoute path="/caja"><CajaPanel /></ProtectedRoute>} />
        <Route path="/delivery" element={<ProtectedRoute path="/delivery"><DeliveryPanel /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute path="/reportes"><Reportes /></ProtectedRoute>} />

        {/* Rutas de administración */}
        <Route path="/admin" element={<ProtectedRoute path="/admin"><AdminPanel /></ProtectedRoute>} />
        <Route path="/admin/productos" element={<ProtectedRoute path="/admin"><ProductosAdmin /></ProtectedRoute>} />
        <Route path="/admin/mesas" element={<ProtectedRoute path="/admin"><MesasAdmin /></ProtectedRoute>} />
        <Route path="/admin/empleados" element={<ProtectedRoute path="/admin"><EmpleadosAdmin /></ProtectedRoute>} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
