export interface Departamento {
  id: number
  nombre: string
}

export interface Municipio {
  id: number
  nombre: string
  departamento_id: number
  departamento?: Departamento
}

export interface Aldea {
  id: number
  nombre: string
  municipio_id: number
}

export interface Direccion {
  id: number
  municipio_id: number
  aldea_id: number | null
  detalle: string
  municipio?: Municipio
  aldea?: Aldea | null
}

export interface Proveedor {
  id: number
  razon_social: string
  nit: string
  dpi: string | null
  persona_contacto: string
  telefono: string
  correo: string
  estado: boolean
  direccion_id: number
  direccion?: Direccion
}

/**
 * Datos del formulario. departamento_id solo sirve para filtrar municipios;
 * el back lo ignora porque no está en sus reglas.
 */
export interface FormularioProveedor {
  razon_social: string
  nit: string
  dpi: string | null
  persona_contacto: string
  telefono: string
  correo: string
  estado: boolean
  direccion: {
    departamento_id: number | null
    municipio_id: number | null
    aldea_id: number | null
    detalle: string
  }
}
