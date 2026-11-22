/**
 * Estados de la solicitud: mismos ids que EstadoSolicitud en el back (Borrador = 1 ...).
 */
export const ESTADOS_SOLICITUD = {
  BORRADOR: 1,
  EN_APROBACION: 2,
  APROBADA: 3,
  RECHAZADA: 4,
  COMPLETADA: 5,
} as const

export const OPCIONES_ESTADO_SOLICITUD = [
  { title: 'Borrador', value: ESTADOS_SOLICITUD.BORRADOR },
  { title: 'En aprobación', value: ESTADOS_SOLICITUD.EN_APROBACION },
  { title: 'Aprobada', value: ESTADOS_SOLICITUD.APROBADA },
  { title: 'Rechazada', value: ESTADOS_SOLICITUD.RECHAZADA },
  { title: 'Completada', value: ESTADOS_SOLICITUD.COMPLETADA },
]

const COLORES_POR_ESTADO: Record<number, string> = {
  [ESTADOS_SOLICITUD.BORRADOR]: 'secondary',
  [ESTADOS_SOLICITUD.EN_APROBACION]: 'warning',
  [ESTADOS_SOLICITUD.APROBADA]: 'success',
  [ESTADOS_SOLICITUD.RECHAZADA]: 'error',
  [ESTADOS_SOLICITUD.COMPLETADA]: 'info',
}

export const colorEstadoSolicitud = (estadoSolicitudId?: number): string =>
  COLORES_POR_ESTADO[estadoSolicitudId ?? 0] ?? 'secondary'

/**
 * Formato de moneda en quetzales: 15000 → Q 15,000.00
 */
export const formatoQuetzales = (monto?: number | null): string =>
  `Q ${Number(monto ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
