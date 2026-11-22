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

  { heading: 'Catálogos' },
  {
    title: 'Centros de costo',
    to: { name: 'catalogos-centros-costo' },
    icon: { icon: 'tabler-building' },
    action: 'ver centro costos',
    subject: 'CentroCosto',
  },
  {
    title: 'Productos',
    to: { name: 'catalogos-productos' },
    icon: { icon: 'tabler-package' },
    action: 'ver productos',
    subject: 'Producto',
  },
  {
    title: 'Tipos de producto',
    to: { name: 'catalogos-tipos-producto' },
    icon: { icon: 'tabler-category' },
    action: 'ver tipo productos',
    subject: 'TipoProducto',
  },
  {
    title: 'Unidades de medida',
    to: { name: 'catalogos-unidades-medida' },
    icon: { icon: 'tabler-ruler-measure' },
    action: 'ver unidad medidas',
    subject: 'UnidadMedida',
  },
]
