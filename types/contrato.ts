import type { TipoProducto } from '@/types/catalogo'
import type { Proveedor } from '@/types/proveedor'

export interface Contrato {
  id: number
  proveedor_id: number
  tipo_producto_id: number
  estado_contrato_id: number
  fecha_inicio: string
  fecha_fin: string
  monto: string
  proveedor?: Proveedor
  tipo_producto?: TipoProducto
  estado_contrato?: { id: number; nombre: string }
}

export interface FormularioContrato {
  proveedor_id: number | null
  tipo_producto_id: number | null
  estado_contrato_id: number | null
  fecha_inicio: string
  fecha_fin: string
  monto: number | null
}
