import type { Proveedor } from '@/types/proveedor'
import type { CentroCosto, Producto, UnidadMedida, UsuarioResumen } from '@/types/solicitud'

export interface EstadoOrdenCatalogo {
  id: number
  nombre: string
}

// Estado de recepción de cada ítem: lo calcula el back
export type EstadoRecepcionItem = 'Pendiente' | 'Parcial' | 'Completo'

export interface OrdenDetalle {
  id: number
  orden_id: number
  solicitud_detalle_id: number
  cantidad: string
  precio_unitario: string
  subtotal?: number
  cantidad_recibida?: number
  cantidad_pendiente?: number
  estado_recepcion?: EstadoRecepcionItem
  solicitud_detalle?: {
    id: number
    producto?: Producto
    unidad_medida?: UnidadMedida
  }
}

export interface RecepcionDetalle {
  id: number
  orden_detalle_id: number
  cantidad_recibida: string
  orden_detalle?: OrdenDetalle
}

export interface Recepcion {
  id: number
  fecha: string
  observaciones: string | null
  responsable?: UsuarioResumen
  detalles?: RecepcionDetalle[]
}

export interface Orden {
  id: number
  numero: string
  fecha_emision: string
  solicitud_id: number
  proveedor_id: number
  estado_orden_id: number
  total?: number
  proveedor?: Proveedor
  estado_orden?: EstadoOrdenCatalogo
  solicitud?: {
    id: number
    numero: string
    centro_costo?: CentroCosto
    solicitante?: UsuarioResumen
  }
  detalles?: OrdenDetalle[]
  recepciones?: Recepcion[]
}

// Fila del diálogo para generar la orden desde la solicitud
export interface ItemGenerarOrden {
  solicitud_detalle_id: number
  producto: string
  unidad: string
  cantidad_solicitada: number
  cantidad: number | null
  precio_unitario: number | null
}

// Fila del diálogo para registrar una entrega
export interface ItemRecepcion {
  orden_detalle_id: number
  producto: string
  cantidad_pendiente: number
  cantidad_recibida: number | null
}
