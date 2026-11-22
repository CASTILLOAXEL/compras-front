/**
 * Estados de la orden: mismos ids que EstadoOrden en el back (Emitida = 1 ...).
 */
export const ESTADOS_ORDEN = {
  EMITIDA: 1,
  RECIBIDA: 2,
  CANCELADA: 3,
} as const

export const OPCIONES_ESTADO_ORDEN = [
  { title: 'Emitida', value: ESTADOS_ORDEN.EMITIDA },
  { title: 'Recibida', value: ESTADOS_ORDEN.RECIBIDA },
  { title: 'Cancelada', value: ESTADOS_ORDEN.CANCELADA },
]

const COLORES_POR_ESTADO_ORDEN: Record<number, string> = {
  [ESTADOS_ORDEN.EMITIDA]: 'info',
  [ESTADOS_ORDEN.RECIBIDA]: 'success',
  [ESTADOS_ORDEN.CANCELADA]: 'error',
}

export const colorEstadoOrden = (estadoOrdenId?: number): string =>
  COLORES_POR_ESTADO_ORDEN[estadoOrdenId ?? 0] ?? 'secondary'

const COLORES_POR_ESTADO_RECEPCION: Record<string, string> = {
  Pendiente: 'secondary',
  Parcial: 'warning',
  Completo: 'success',
}

export const colorEstadoRecepcion = (estadoRecepcion?: string): string =>
  COLORES_POR_ESTADO_RECEPCION[estadoRecepcion ?? ''] ?? 'secondary'
