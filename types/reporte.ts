export interface FilaResumenReporte {
  proveedor_id: number
  razon_social: string
  estado_orden_id: number
  estado: string
  cantidad_ordenes: number
  monto_total: number
}

export interface OrdenReporte {
  id: number
  numero: string
  fecha_emision: string
  estado_orden_id: number
  estado: string
  razon_social: string
  total: number
}

export interface ReporteOrdenes {
  resumen: FilaResumenReporte[]
  ordenes: OrdenReporte[]
  totales: {
    cantidad_ordenes: number
    monto_total: number
  }
}

export interface Indicadores {
  solicitudes_por_estado: { estado_solicitud_id: number;nombre: string;cantidad: number }[]
  ordenes_emitidas: number
  monto_ordenes: number
  contratos_vigentes: number
  proveedores_activos: number
}
