import type { FormularioProveedor, Proveedor } from '@/types/proveedor'

export const formularioProveedorVacio = (): FormularioProveedor => ({
  razon_social: '',
  nit: '',
  dpi: null,
  persona_contacto: '',
  telefono: '',
  correo: '',
  estado: true,
  direccion: {
    departamento_id: null,
    municipio_id: null,
    aldea_id: null,
    detalle: '',
  },
})

/**
 * Convierte el proveedor que devuelve la API al formato del formulario de edición.
 */
export const formularioDesdeProveedor = (proveedor: Proveedor): FormularioProveedor => ({
  razon_social: proveedor.razon_social,
  nit: proveedor.nit,
  dpi: proveedor.dpi,
  persona_contacto: proveedor.persona_contacto,
  telefono: proveedor.telefono,
  correo: proveedor.correo,
  estado: proveedor.estado,
  direccion: {
    departamento_id: proveedor.direccion?.municipio?.departamento_id ?? null,
    municipio_id: proveedor.direccion?.municipio_id ?? null,
    aldea_id: proveedor.direccion?.aldea_id ?? null,
    detalle: proveedor.direccion?.detalle ?? '',
  },
})
