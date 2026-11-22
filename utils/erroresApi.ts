/**
 * Mensaje principal de un error de la API (422, 403, 500...).
 */
export const mensajeDeError = (error: any): string =>
  error?.data?.message ?? 'Ocurrió un error inesperado, intente de nuevo.'

/**
 * Errores de validación (422) como { campo: 'primer mensaje' },
 * listos para mostrar debajo de cada campo del formulario.
 */
export const erroresPorCampo = (error: any): Record<string, string> => {
  const errores: Record<string, string[]> = error?.data?.errors ?? {}

  return Object.fromEntries(
    Object.entries(errores).map(([campo, mensajes]) => [campo, mensajes[0] ?? '']),
  )
}
