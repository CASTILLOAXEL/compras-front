import type { SolicitudDetalle, UsuarioResumen } from '@/types/solicitud'

export const nombreUsuario = (usuario?: UsuarioResumen | null): string =>
  usuario ? [usuario.primer_nombre, usuario.primer_apellido].filter(Boolean).join(' ') : ''

/**
 * 2026-11-22 → 22/11/2026 (sin new Date, para que la zona horaria no cambie el día)
 */
export const formatoFecha = (fecha?: string | null): string =>
  fecha ? fecha.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1') : ''

/**
 * Fecha y hora del historial; el back la manda en UTC y aquí se muestra en hora local.
 */
export const formatoFechaHora = (fecha: string): string =>
  new Date(fecha).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' })

/**
 * Dato calculado: cantidad × precio, redondeado a 2 decimales.
 */
export const subtotalItem = (detalle: SolicitudDetalle): number =>
  Math.round(Number(detalle.cantidad) * Number(detalle.precio_estimado) * 100) / 100
