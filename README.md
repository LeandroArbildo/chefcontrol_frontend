# Chef Control Frontend

Sistema frontend para restaurante tipo polleria chifa que permite gestionar pedidos, cocina, caja, delivery, reportes administrativos y una carta publica para clientes.

## Descripcion

Chef Control Frontend es una aplicacion construida con React y Vite. La pantalla inicial esta pensada para clientes: muestra la carta, permite agregar productos a un carrito y enviar el pedido por WhatsApp.

Tambien incluye acceso para personal del restaurante con roles separados:

- Mozo
- Cocina
- Cajero
- Delivery
- Administrador

Cada rol ve solo las pantallas que le corresponden. Los pedidos se mantienen conectados entre modulos usando datos simulados y almacenamiento local del navegador.

## Tecnologias

- React
- Vite
- JavaScript
- React Router
- Recharts
- CSS personalizado
- Datos mock/localStorage

## Instalacion

Instalar dependencias:

```bash
npm install
```

Ejecutar el proyecto:

```bash
npm run dev
```

Luego abrir:

```text
http://localhost:3000
```

Si Vite usa otro puerto, revisar la URL que aparece en la terminal.

## Scripts Disponibles

```bash
npm run dev
```

Inicia el servidor de desarrollo.

```bash
npm run build
```

Genera la version de produccion.

```bash
npm run preview
```

Permite previsualizar la version generada.

## Rutas Principales

- `/` - Carta publica para clientes
- `/login` - Acceso del personal
- `/mozo` - Panel del mozo
- `/cocina` - Panel de cocina
- `/caja` - Panel de caja
- `/delivery` - Panel de delivery
- `/admin` - Panel de administrador
- `/reportes` - Reportes administrativos

## Flujo Principal

1. El cliente entra a la carta publica, agrega platos al carrito y envia el pedido por WhatsApp.
2. El mozo ingresa al sistema, selecciona una mesa, arma una comanda y la envia a cocina.
3. Cocina recibe el pedido y cambia su estado a pendiente, en preparacion o listo.
4. Caja ve los pedidos listos o entregados, genera comprobante, registra metodo de pago y marca el pedido como pagado.
5. Delivery ve pedidos para llevar o delivery, cambia el estado a pendiente, en camino o entregado.
6. Administrador revisa ventas, pedidos, pagos, productos vendidos y reportes.

## Roles y Permisos

### Mozo

- Ve el mapa de 30 mesas.
- Selecciona una mesa.
- Agrega productos al pedido.
- Agrega notas.
- Envia pedidos a cocina.
- Ve el estado actualizado del pedido.

### Cocina

- Ve pedidos enviados por mozos.
- Revisa productos y notas.
- Cambia estado del pedido.
- Ve el mapa general de mesas.

### Caja

- Ve pedidos listos o entregados.
- Registra metodo de pago.
- Genera comprobante simple.
- Marca pedidos como pagados.
- Registra egresos del dia.
- Ve ingresos, egresos y saldo diario.

### Delivery

- Ve pedidos de delivery o para llevar.
- Cambia estado a pendiente, en camino o entregado.
- Los cambios se reflejan en caja.

### Administrador

- Ve resumen general del negocio.
- Ve pedidos realizados.
- Ve ingresos.
- Ve productos mas vendidos.
- Accede a reportes.

## Datos Simulados

El proyecto no necesita backend para funcionar. Los datos iniciales estan en:

```text
src/data/mockData.js
```

El estado compartido entre modulos se maneja en:

```text
src/services/restaurantStore.js
```

Los cambios se guardan en `localStorage`, por eso los pedidos no se pierden al cambiar de rol o recargar la pagina.

## Estructura del Proyecto

```text
src/
  assets/
  components/
  data/
  layouts/
  pages/
  routes/
  services/
  styles/
```

## Imagenes

La carta utiliza fotos realistas de platos y bebidas:

- Pollo a la brasa
- Arroz chaufa
- Tallarin chifa
- Wantanes
- Combo brasa + chaufa
- Bebidas
- Cremas

Estas imagenes estan ubicadas en:

```text
src/assets/
```

## Notas

Este frontend esta preparado para conectarse a un backend en el futuro. Actualmente usa datos simulados para poder probar todos los modulos sin depender de una API.
