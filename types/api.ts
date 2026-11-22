/**
 * Formato de todas las respuestas del back: { success, data, message }.
 */
export interface RespuestaApi<T> {
  success: boolean
  data: T
  message: string
}

/**
 * Listado paginado que devuelve jsonPaginate() del back.
 */
export interface Paginado<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

/**
 * Orden de una columna de la tabla de Vuetify.
 */
export interface OrdenColumna {
  key: string
  order: 'asc' | 'desc'
}

/**
 * Opciones que emite VDataTableServer al paginar u ordenar.
 */
export interface OpcionesTabla {
  page: number
  itemsPerPage: number
  sortBy: OrdenColumna[]
}
