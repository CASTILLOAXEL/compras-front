export interface OpcionSeleccion {
  title: string
  value: number
}

/**
 * Describe un campo del formulario y su columna en la tabla.
 */
export interface CampoCatalogo {
  clave: string
  etiqueta: string
  tipo: 'texto' | 'seleccion'
  obligatorio?: boolean
  longitudMaxima?: number
  placeholder?: string
  opciones?: OpcionSeleccion[]
}

/**
 * Registro de cualquier catálogo: id, estado y sus propios campos.
 */
export interface RegistroCatalogo {
  id: number
  estado: boolean
  [campo: string]: unknown
}

export interface TipoProducto {
  id: number
  nombre: string
}
