/**
 * Fecha de hoy en formato YYYY-MM-DD, en la zona horaria del navegador.
 */
export const fechaDeHoy = (): string => new Date().toLocaleDateString('en-CA')
