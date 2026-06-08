import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roles } from '../data/mockData.js';
import { setCurrentRole } from '../services/authService.js';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState(roles[0].id);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const role = roles.find((item) => item.id === selectedRole);
    setCurrentRole(role.id);
    navigate(role.route);
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-panel__intro">
          <span className="brand-mark">CC</span>
          <h1>Chef Control</h1>
          <p>Gestiona pedidos, cocina, caja, delivery, inventario y reportes desde una sola interfaz.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Usuario
            <input type="text" defaultValue="demo@chefcontrol.pe" />
          </label>
          <label>
            Contraseña
            <input type="password" defaultValue="chefcontrol" />
          </label>
          <label>
            Rol
            <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
              {roles.map((role) => (
                <option value={role.id} key={role.id}>{role.name}</option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="submit">Ingresar al sistema</button>
        </form>
      </section>
    </main>
  );
}
