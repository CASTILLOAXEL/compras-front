/**
 * Estados del contrato: mismos ids que EstadoContrato en el back (Vigente = 1 ...).
 */
export const ESTADOS_CONTRATO = {
  VIGENTE: 1,
  FINALIZADO: 2,
  ANULADO: 3,
} as const

export const OPCIONES_ESTADO_CONTRATO = [
  { title: 'Vigente', value: ESTADOS_CONTRATO.VIGENTE },
  { title: 'Finalizado', value: ESTADOS_CONTRATO.FINALIZADO },
  { title: 'Anulado', value: ESTADOS_CONTRATO.ANULADO },
]

const COLORES_POR_ESTADO_CONTRATO: Record<number, string> = {
  [ESTADOS_CONTRATO.VIGENTE]: 'success',
  [ESTADOS_CONTRATO.FINALIZADO]: 'info',
  [ESTADOS_CONTRATO.ANULADO]: 'error',
}

export const colorEstadoContrato = (estadoContratoId?: number): string =>
  COLORES_POR_ESTADO_CONTRATO[estadoContratoId ?? 0] ?? 'secondary'
