# ChefControl — Documentación del Sistema

> Sistema de gestión de restaurante con frontend React + backend Java Spring Boot + PostgreSQL en Render.

---

## Tabla de contenidos

1. [Arquitectura del sistema](#arquitectura)
2. [Backend — Spring Boot](#backend)
3. [Frontend — React/Vite](#frontend)
4. [APIs REST](#apis)
5. [Módulos y roles](#modulos)
6. [Despliegue en Render](#despliegue-en-render)
7. [Variables de entorno](#variables-de-entorno)
8. [Guía de desarrollo local](#desarrollo-local)

---

## Arquitectura

```
┌─────────────────────┐     HTTPS      ┌──────────────────────────┐
│   Frontend React    │ ─────────────► │  Backend Spring Boot     │
│   Render Static     │ ◄───────────── │  Render Web Service      │
│   (chefcontrol-ui)  │   JSON REST    │  (chefcontrol-api)       │
└─────────────────────┘                └────────────┬─────────────┘
                                                    │ JDBC
                                       ┌────────────▼─────────────┐
                                       │  PostgreSQL (Render DB)   │
                                       │  db_chefcontrol           │
                                       └──────────────────────────┘
```

### Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite 7, React Router 7, Recharts |
| Backend | Java 21, Spring Boot 3, Spring Data JPA |
| Base de datos | PostgreSQL (Render managed) |
| ORM | Hibernate / JPA |
| Docs API | Swagger / OpenAPI (acceso en `/swagger-ui.html`) |
| Deploy | Render.com (Free tier) |

---

## Backend

### Estructura de paquetes

```
com.chefcontrol/
├── config/          # OpenAPI config, CORS
├── controllers/     # 8 controladores REST
├── dto/             # PedidoRequestDTO, DetallePedidoRequestDTO
├── models/          # 9 entidades JPA
├── repository/      # Spring Data repositories
└── services/        # Lógica de negocio
```

### Modelos

| Entidad | Campos principales |
|---|---|
| `Categoria` | id, nombre, descripcion, activa |
| `Producto` | id, nombre, descripcion, precio, tiempoPreparacion, disponible, imagenUrl, categoria→ |
| `Mesa` | id, numero, capacidad, estado (enum), activa |
| `TipoPedido` | id, nombre |
| `Empleado` | id, nombre, rol (enum), telefono, email, activo |
| `Cliente` | id, nombre, telefono, email, activo |
| `Pedido` | id, mesa→, cliente→, tipoPedido→, empleado→, estado, fechaHora, total, observaciones |
| `DetallePedido` | id, pedido→, producto→, cantidad, precioUnitario, subtotal, observaciones |
| `ConfiguracionRestaurante` | id, nombreRestaurante, ruc, direccion, telefono, activo |

### Enums

```java
// Pedido.EstadoPedido
PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO | CANCELADO

// Mesa.EstadoMesa  
DISPONIBLE | OCUPADA | RESERVADA | FUERA_DE_SERVICIO

// Empleado.RolEmpleado
MESERO | COCINERO | CAJERO | ADMINISTRADOR | BARTENDER
```

---

## Frontend

### Estructura de archivos

```
src/
├── assets/              # Imágenes (hero, platos)
├── components/
│   ├── ApiStatus.jsx    # ✨ Nuevo: Monitor de conexión backend
│   ├── LoadingSpinner   # ✨ Nuevo: Spinner de carga
│   ├── Modal.jsx        # ✨ Nuevo: Dialog reutilizable
│   ├── MetricCard.jsx
│   ├── OrderCard.jsx
│   ├── PageHeader.jsx
│   ├── ProtectedRoute.jsx
│   ├── Section.jsx
│   ├── TableMap.jsx     # ↑ Actualizado: datos reales
│   └── ToastContainer.jsx # ✨ Nuevo: Notificaciones
├── data/
│   └── mockData.js      # Conservado como fallback (roles, tablas estáticas)
├── hooks/
│   └── useToast.js      # ✨ Nuevo: Hook de notificaciones
├── layouts/
│   └── AppLayout.jsx    # ↑ Actualizado: incluye ApiStatus
├── pages/
│   ├── AdminPanel.jsx   # ↑ Actualizado: CRUD productos/empleados
│   ├── CajaPanel.jsx    # ↑ Actualizado: datos reales
│   ├── ClienteMenu.jsx  # ↑ Actualizado: menú del backend
│   ├── CocinaPanel.jsx  # ↑ Actualizado: polling + estados reales
│   ├── Dashboard.jsx    # ↑ Actualizado: métricas reales
│   ├── DeliveryPanel.jsx# ↑ Actualizado: datos reales
│   ├── EmpleadosAdmin.jsx # ✨ Nuevo: CRUD empleados
│   ├── Login.jsx
│   ├── MesasAdmin.jsx   # ✨ Nuevo: CRUD mesas
│   ├── MozoPanel.jsx    # ↑ Actualizado: API real + crear pedidos
│   ├── ProductosAdmin.jsx # ✨ Nuevo: CRUD productos
│   └── Reportes.jsx     # ↑ Actualizado: datos reales
├── routes/
│   └── roleAccess.js
├── services/
│   ├── api/             # ✨ Nuevo: Capa de servicios
│   │   ├── apiClient.js
│   │   ├── categoriaService.js
│   │   ├── clienteService.js
│   │   ├── configuracionService.js
│   │   ├── empleadoService.js
│   │   ├── mesaService.js
│   │   ├── pedidoService.js
│   │   ├── productoService.js
│   │   └── tipoPedidoService.js
│   ├── authService.js
│   ├── orderService.js
│   ├── restaurantStore.js  # Conservado (compatibilidad)
│   └── useApiStore.js   # ✨ Nuevo: Hook global con polling
└── styles/
    └── global.css       # ↑ Actualizado: estilos para nuevos componentes
```

---

## APIs REST

**Base URL:** `https://chefcontrol-java.onrender.com/api`

### Categorías `/api/categorias`
| Método | Path | Descripción |
|---|---|---|
| GET | `/api/categorias` | Listar todas |
| GET | `/api/categorias/{id}` | Obtener por ID |
| POST | `/api/categorias` | Crear |
| PUT | `/api/categorias/{id}` | Actualizar |
| DELETE | `/api/categorias/{id}` | Eliminar |

### Productos `/api/productos`
| Método | Path | Descripción |
|---|---|---|
| GET | `/api/productos` | Listar todos |
| GET | `/api/productos/disponibles` | Solo disponibles |
| GET | `/api/productos/categoria/{id}` | Por categoría |
| GET | `/api/productos/{id}` | Por ID |
| POST | `/api/productos` | Crear |
| PUT | `/api/productos/{id}` | Actualizar |
| DELETE | `/api/productos/{id}` | Eliminar |

### Mesas `/api/mesas`
| Método | Path | Descripción |
|---|---|---|
| GET | `/api/mesas` | Listar todas |
| GET | `/api/mesas/activas` | Solo activas |
| GET | `/api/mesas/estado/{estado}` | Por estado |
| PATCH | `/api/mesas/{id}/estado?estado=OCUPADA` | Cambiar estado |
| POST | `/api/mesas` | Crear |
| PUT | `/api/mesas/{id}` | Actualizar |
| DELETE | `/api/mesas/{id}` | Eliminar |

### Pedidos `/api/pedidos`
| Método | Path | Descripción |
|---|---|---|
| GET | `/api/pedidos` | Listar todos |
| GET | `/api/pedidos/estado/{estado}` | Por estado |
| GET | `/api/pedidos/{id}` | Por ID |
| POST | `/api/pedidos` | Crear con detalles |
| PATCH | `/api/pedidos/{id}/estado?estado=LISTO` | Cambiar estado |
| DELETE | `/api/pedidos/{id}` | Eliminar |

**Body para crear pedido:**
```json
{
  "mesaId": 3,
  "clienteId": null,
  "tipoPedidoId": 1,
  "empleadoId": 2,
  "observaciones": "sin cebolla",
  "detalles": [
    { "productoId": 5, "cantidad": 2, "observaciones": "papas crocantes" },
    { "productoId": 11, "cantidad": 1, "observaciones": "" }
  ]
}
```

### Empleados `/api/empleados`
| Método | Path | Descripción |
|---|---|---|
| GET | `/api/empleados` | Listar todos |
| GET | `/api/empleados/activos` | Solo activos |
| GET | `/api/empleados/rol/{rol}` | Por rol |
| POST | `/api/empleados` | Registrar |
| PUT | `/api/empleados/{id}` | Actualizar |
| DELETE | `/api/empleados/{id}` | Eliminar |

### Clientes `/api/clientes`
Similar a empleados: GET, GET /activos, POST, PUT, DELETE

### Tipos de Pedido `/api/tipos-pedido`
GET, POST, PUT, DELETE

### Configuración `/api/configuracion-restaurante`
GET (activa), GET /todas, POST, PUT, DELETE

---

## Módulos y Roles

| Rol | Ruta | Acceso |
|---|---|---|
| **Cliente** | `/` | Menú público, carrito, WhatsApp |
| **Mozo** | `/mozo` | Mesas, crear pedidos, menú |
| **Cocina** | `/cocina` | Comandas Kanban, cambiar estados |
| **Cajero** | `/caja` | Cobros, comprobantes, resumen |
| **Delivery** | `/delivery` | Pedidos para llevar/delivery |
| **Administrador** | `/admin`, `/admin/productos`, `/admin/mesas`, `/admin/empleados` | CRUD completo, reportes |

### Flujo del pedido

```
PENDIENTE ──► EN_PREPARACION ──► LISTO ──► ENTREGADO
                                       └──► CANCELADO
```

---

## Despliegue en Render

### Paso 1 — Backend (ya está desplegado)

El backend ya está en Render con:
- **Servicio**: Web Service (Docker)
- **URL**: `https://chefcontrol-java.onrender.com`
- **DB**: PostgreSQL `db_chefcontrol` en `virginia-postgres.render.com`

Si necesitas re-deployar el backend:
1. Ve a [render.com](https://render.com) → New → Web Service
2. Conecta el repo del backend
3. Runtime: **Docker** (usa el Dockerfile existente)
4. Variables de entorno:
   ```
   PORT=8080
   DB_URL=jdbc:postgresql://...
   DB_USER=db_chefcontrol_user
   DB_PASSWORD=...
   ```

### Paso 2 — Frontend (nuevo despliegue)

#### Opción A — Deploy desde GitHub (recomendado)

1. Sube el frontend a GitHub
2. Ve a [render.com](https://render.com) → New → **Static Site**
3. Conecta el repositorio del frontend
4. Configura:
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Variables de entorno (en Render dashboard):
   ```
   VITE_API_URL = https://chefcontrol-java.onrender.com
   ```
6. Click **Create Static Site**

El archivo `render.yaml` en la raíz del frontend ya tiene toda esta configuración lista.

#### Opción B — Deploy manual (sin GitHub)

```bash
# 1. Construir localmente
npm run build

# 2. El contenido de /dist se puede subir a Render Static Site
# 3. O usar render CLI: render deploy
```

### ⚠️ Cold Start de Render (Plan Gratuito)

En el plan gratuito, los servicios se **duermen** después de 15 minutos de inactividad.

La **primera petición** al backend puede tardar **30-60 segundos** en despertar.

**El frontend lo maneja automáticamente:**
- El componente `ApiStatus` detecta si el backend está durmiendo
- Muestra un banner: *"Despertando servidor Render..."*
- Reintenta automáticamente cada 15 segundos hasta 3 veces
- Desaparece cuando el backend responde

**Para evitar el cold start (opcional):**
- Upgrade a Render Starter ($7/mes) para mantener el servicio activo
- O usar un servicio externo como [UptimeRobot](https://uptimerobot.com) para hacer ping cada 14 minutos

---

## Variables de entorno

### Frontend (`.env`)
```env
# URL del backend en Render — cambiar si el servicio tiene otro nombre
VITE_API_URL=https://chefcontrol-java.onrender.com
```

> ⚠️ Las variables de Vite DEBEN empezar con `VITE_` para ser accesibles en el código del cliente.

### Backend (`.env` o Render Environment)
```env
PORT=8080
DB_URL=jdbc:postgresql://dpg-d8aggt0js32c7397hmog-a.virginia-postgres.render.com:5432/db_chefcontrol
DB_USER=db_chefcontrol_user
DB_PASSWORD=pd34N3na8KvBIWBTV6RBCobdNdCl51NJ
```

---

## Desarrollo local

### Requisitos
- Node.js 18+
- Java 21
- Maven 3.9+
- PostgreSQL (local o usar la BD de Render)

### Iniciar el backend
```bash
cd chefcontrol-java/chefcontrol
./mvnw spring-boot:run
# Corre en http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Iniciar el frontend
```bash
cd chefControl-frontend/chefcontrol_frontend
npm install
npm run dev
# Corre en http://localhost:3001
# El proxy de Vite redirige /api/* → http://localhost:8080
```

> Con el proxy activo en `vite.config.js`, durante desarrollo no necesitas la variable `VITE_API_URL` — las peticiones se redirigen automáticamente al backend local.

### Inicializar la base de datos
```bash
# El archivo init.sql crea todas las tablas y datos semilla
psql -U postgres -f init.sql
```

---

## Polling y tiempo real

El hook `useApiStore.js` hace polling automático cada **8 segundos** para:
- Lista de pedidos (todas las páginas que muestran pedidos)
- Lista de mesas activas (TableMap)

Esto permite que la cocina y el mozo vean los cambios en tiempo casi real sin necesitar WebSockets.

Para ajustar el intervalo, modificar `POLLING_INTERVAL` en `useApiStore.js`:
```js
const POLLING_INTERVAL = 8000; // milisegundos
```

---

## Documentación Swagger del Backend

Una vez el backend esté corriendo, la documentación interactiva está disponible en:

```
https://chefcontrol-java.onrender.com/swagger-ui.html
```

Permite probar todos los endpoints directamente desde el navegador.
