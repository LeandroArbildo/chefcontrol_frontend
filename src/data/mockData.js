import polloImage from '../assets/menu-pollo.svg';
import chaufaImage from '../assets/menu-chaufa.svg';
import tallarinImage from '../assets/menu-tallarin.svg';
import wantanImage from '../assets/menu-wantan.svg';
import comboImage from '../assets/menu-combo.svg';
import bebidaImage from '../assets/menu-bebida.svg';
import cremasImage from '../assets/menu-cremas.svg';

export const roles = [
  { id: 'mozo', name: 'Mozo', route: '/mozo' },
  { id: 'cocina', name: 'Cocina', route: '/cocina' },
  { id: 'cajero', name: 'Cajero', route: '/caja' },
  { id: 'delivery', name: 'Delivery', route: '/delivery' },
  { id: 'admin', name: 'Administrador', route: '/admin' }
];

export const restaurantTables = Array.from({ length: 30 }, (_, index) => {
  const number = index + 1;
  const statusByTable = {
    2: 'ocupada',
    4: 'esperando',
    7: 'ocupada',
    9: 'lista',
    12: 'reservada',
    15: 'esperando',
    18: 'ocupada',
    21: 'lista',
    24: 'ocupada',
    27: 'esperando'
  };

  return {
    id: number,
    name: `Mesa ${number}`,
    seats: number % 5 === 0 ? 6 : 4,
    status: statusByTable[number] || 'disponible'
  };
});

export const dailyCashMovements = [
  { id: 1, type: 'ingreso', concept: 'Pagos en mesa', amount: 486 },
  { id: 2, type: 'ingreso', concept: 'Delivery pagado', amount: 218 },
  { id: 3, type: 'egreso', concept: 'Compra de papas', amount: 95 },
  { id: 4, type: 'egreso', concept: 'Envases delivery', amount: 48 }
];

export const menuItems = [
  {
    id: 1,
    name: '1/4 Pollo a la brasa',
    category: 'Pollos',
    price: 18,
    image: polloImage
  },
  {
    id: 2,
    name: '1/2 Pollo a la brasa',
    category: 'Pollos',
    price: 34,
    image: polloImage
  },
  {
    id: 3,
    name: 'Pollo entero familiar',
    category: 'Pollos',
    price: 62,
    image: polloImage
  },
  {
    id: 4,
    name: 'Arroz chaufa de pollo',
    category: 'Chifa',
    price: 22,
    image: chaufaImage
  },
  {
    id: 5,
    name: 'Aeropuerto especial',
    category: 'Chifa',
    price: 28,
    image: chaufaImage
  },
  {
    id: 6,
    name: 'Tallarin saltado chifa',
    category: 'Chifa',
    price: 25,
    image: tallarinImage
  },
  {
    id: 7,
    name: 'Kam lu wantan',
    category: 'Chifa',
    price: 30,
    image: wantanImage
  },
  {
    id: 8,
    name: 'Combo brasa + chaufa',
    category: 'Combos',
    price: 39,
    image: comboImage
  },
  {
    id: 9,
    name: 'Wantanes fritos',
    category: 'Entradas',
    price: 14,
    image: wantanImage
  },
  {
    id: 10,
    name: 'Gaseosa 1.5L',
    category: 'Bebidas',
    price: 10,
    image: bebidaImage
  },
  {
    id: 11,
    name: 'Chicha morada 1L',
    category: 'Bebidas',
    price: 12,
    image: bebidaImage
  },
  {
    id: 12,
    name: 'Cremas extra',
    category: 'Extras',
    price: 3,
    image: cremasImage
  }
];

export const orders = [
  {
    id: 'P-1024',
    table: 'Mesa 4',
    waiter: 'Rosa',
    type: 'Salon',
    status: 'pendiente',
    paid: false,
    paymentMethod: null,
    createdAt: '12:15',
    items: [
      { productId: 1, name: '1/4 Pollo a la brasa', quantity: 2, price: 18, note: 'papas crocantes' },
      { productId: 11, name: 'Chicha morada 1L', quantity: 1, price: 12, note: 'helada' }
    ]
  },
  {
    id: 'P-1025',
    table: 'Mesa 2',
    waiter: 'Jorge',
    type: 'Salon',
    status: 'en preparacion',
    paid: false,
    paymentMethod: null,
    createdAt: '12:28',
    items: [
      { productId: 4, name: 'Arroz chaufa de pollo', quantity: 1, price: 22, note: 'sin sillao extra' },
      { productId: 9, name: 'Wantanes fritos', quantity: 1, price: 14, note: '' }
    ]
  },
  {
    id: 'P-1026',
    table: 'Delivery',
    waiter: 'App',
    type: 'Delivery',
    status: 'listo',
    deliveryStatus: 'pendiente',
    paid: false,
    paymentMethod: null,
    createdAt: '12:42',
    items: [
      { productId: 8, name: 'Combo brasa + chaufa', quantity: 2, price: 39, note: 'para llevar' },
      { productId: 10, name: 'Gaseosa 1.5L', quantity: 1, price: 10, note: '' }
    ]
  },
  {
    id: 'P-1027',
    table: 'Mesa 7',
    waiter: 'Rosa',
    type: 'Salon',
    status: 'entregado',
    paid: false,
    paymentMethod: null,
    createdAt: '13:01',
    items: [
      { productId: 5, name: 'Aeropuerto especial', quantity: 1, price: 28, note: 'bien jugoso' },
      { productId: 12, name: 'Cremas extra', quantity: 2, price: 3, note: 'aji y mayonesa' }
    ]
  },
  {
    id: 'P-1028',
    table: 'Recojo',
    waiter: 'Lucia',
    type: 'Para llevar',
    status: 'listo',
    deliveryStatus: 'pendiente',
    paid: true,
    paymentMethod: 'yape/plin',
    createdAt: '13:10',
    items: [
      { productId: 3, name: 'Pollo entero familiar', quantity: 1, price: 62, note: 'para llevar, cremas completas' }
    ]
  }
];

export const inventoryItems = [
  { id: 1, name: 'Pollos marinados', unit: 'und', stock: 36, minStock: 18 },
  { id: 2, name: 'Papas para freir', unit: 'kg', stock: 22, minStock: 15 },
  { id: 3, name: 'Arroz', unit: 'kg', stock: 30, minStock: 12 },
  { id: 4, name: 'Fideos chifa', unit: 'kg', stock: 8, minStock: 10 },
  { id: 5, name: 'Wantanes', unit: 'und', stock: 90, minStock: 60 },
  { id: 6, name: 'Cremas de la casa', unit: 'lt', stock: 6, minStock: 8 },
  { id: 7, name: 'Envases delivery', unit: 'und', stock: 24, minStock: 30 }
];

export const dailySales = [
  { day: 'Lun', sales: 920 },
  { day: 'Mar', sales: 1080 },
  { day: 'Mie', sales: 860 },
  { day: 'Jue', sales: 1240 },
  { day: 'Vie', sales: 1680 },
  { day: 'Sab', sales: 2310 },
  { day: 'Dom', sales: 1960 }
];

export const monthlySales = [
  { month: 'Ene', sales: 18400 },
  { month: 'Feb', sales: 19750 },
  { month: 'Mar', sales: 21300 },
  { month: 'Abr', sales: 22650 },
  { month: 'May', sales: 24180 },
  { month: 'Jun', sales: 11820 }
];

export const bestSellers = [
  { name: '1/4 Pollo a la brasa', units: 168 },
  { name: 'Arroz chaufa de pollo', units: 132 },
  { name: 'Combo brasa + chaufa', units: 98 },
  { name: 'Aeropuerto especial', units: 84 }
];

export const paymentStats = [
  { name: 'Efectivo', value: 42 },
  { name: 'Tarjeta', value: 31 },
  { name: 'Yape/Plin', value: 27 }
];
