export default [
  {
    title: 'Inicio',
    to: { name: 'index' },
    icon: { icon: 'tabler-smart-home' },
    action: 'home',
    subject: 'home',
  },

  { heading: 'Compras' },
  {
    title: 'Proveedores',
    to: { name: 'proveedores' },
    icon: { icon: 'tabler-building-store' },
    action: 'ver proveedores',
    subject: 'Proveedor',
  },

  {
    title: 'Solicitudes',
    to: { name: 'solicitudes' },
    icon: { icon: 'tabler-file-invoice' },
    action: 'ver solicitudes',
    subject: 'Solicitud',
  },
]
