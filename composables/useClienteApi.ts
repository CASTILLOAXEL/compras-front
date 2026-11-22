import type { RespuestaApi } from '@/types/api'

type ParametrosConsulta = Record<string, unknown>

/**
 * Cliente de la API. Usa el cliente de nuxt-auth-sanctum, que:
 * - agrega el token (Authorization: Bearer ...)
 * - pasa por el proxy /services hacia compras-back.local
 * - envía al login si la sesión venció (401)
 */
export const useClienteApi = () => {
  const clienteSanctum = useSanctumClient()

  const obtener = <T>(ruta: string, parametros?: ParametrosConsulta) =>
    clienteSanctum<RespuestaApi<T>>(ruta, { method: 'GET', query: parametros })

  const crear = <T>(ruta: string, datos: object) =>
    clienteSanctum<RespuestaApi<T>>(ruta, { method: 'POST', body: datos })

  const actualizar = <T>(ruta: string, datos: object) =>
    clienteSanctum<RespuestaApi<T>>(ruta, { method: 'PUT', body: datos })

  const eliminar = (ruta: string) =>
    clienteSanctum<RespuestaApi<null>>(ruta, { method: 'DELETE' })

  // Acciones que no son CRUD, por ejemplo: enviar, aprobar o rechazar una solicitud
  const enviar = <T>(ruta: string, datos: object = {}) =>
    clienteSanctum<RespuestaApi<T>>(ruta, { method: 'POST', body: datos })

  return { obtener, crear, actualizar, eliminar, enviar }
}
