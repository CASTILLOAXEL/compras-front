export interface UsuarioResumen {
  id: number
  primer_nombre: string
  segundo_nombre: string | null
  primer_apellido: string
  segundo_apellido: string | null
  correo: string
}

export interface CentroCosto {
  id: number
  codigo: string
  nombre: string
}

export interface Producto {
  id: number
  nombre: string
  tipo_producto_id: number
}

export interface UnidadMedida {
  id: number
  nombre: string
  abreviatura: string
}

export interface EstadoSolicitudCatalogo {
  id: number
  nombre: string
}

/**
 * SQL Server devuelve los decimales como texto ("2.00"): se convierten con Number() al usarlos.
 */
export interface SolicitudDetalle {
  id: number
  solicitud_id: number
  producto_id: number
  unidad_medida_id: number
  cantidad: string
  precio_estimado: string
  producto?: Producto
  unidad_medida?: UnidadMedida
}

export interface SolicitudHistorial {
  id: number
  estado_solicitud_id: number | string
  observacion: string | null
  created_at: string
  estado_solicitud?: EstadoSolicitudCatalogo
  usuario?: UsuarioResumen
}

// orden de compra generada desde la solicitud
export interface OrdenResumen {
  id: number
  numero: string
  estado_orden_id: number
  estado_orden?: { id: number; nombre: string }
}

export interface Solicitud {
  id: number
  numero: string
  fecha: string
  solicitante_id: number
  centro_costo_id: number
  estado_solicitud_id: number
  total_estimado?: number
  solicitante?: UsuarioResumen
  centro_costo?: CentroCosto
  estado_solicitud?: EstadoSolicitudCatalogo
  detalles?: SolicitudDetalle[]
  historial?: SolicitudHistorial[]
  orden?: OrdenResumen | null
}

export interface FormularioItem {
  producto_id: number | null
  unidad_medida_id: number | null
  cantidad: number | null
  precio_estimado: number | null
}
