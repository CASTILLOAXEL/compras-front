import { watchDebounced } from '@vueuse/core'
import type { Ref } from 'vue'
import type { OpcionesTabla, Paginado } from '@/types/api'

type Filtros = Record<string, string | number | boolean | null | undefined>

/**
 * Tabla paginada del lado del servidor (VDataTableServer).
 * Convierte la página, el orden y los filtros al formato del back:
 * ?page[number]=1&page[size]=10&sort=-id&filter[razon_social]=progreso
 */
export const useTablaPaginada = <T>(ruta: string, filtros: Ref<Filtros>) => {
  const { obtener } = useClienteApi()
  const { error: notificarError } = useNotificacion()

  const registros = ref<T[]>([]) as Ref<T[]>
  const totalRegistros = ref(0)
  const cargando = ref(false)
  const opciones = ref<OpcionesTabla>({ page: 1, itemsPerPage: 10, sortBy: [] })

  const construirParametros = () => {
    const parametros: Record<string, unknown> = {
      'page[number]': opciones.value.page,
      'page[size]': opciones.value.itemsPerPage,
    }

    const orden = opciones.value.sortBy[0]

    if (orden)
      parametros.sort = orden.order === 'desc' ? `-${orden.key}` : orden.key

    Object.entries(filtros.value).forEach(([campo, valor]) => {
      if (valor === null || valor === undefined || valor === '')
        return

      // Los booleanos van como 1/0 para que SQL Server los compare con la columna bit
      parametros[`filter[${campo}]`] = typeof valor === 'boolean' ? Number(valor) : valor
    })

    return parametros
  }

  const cargar = async () => {
    cargando.value = true

    try {
      const respuesta = await obtener<Paginado<T>>(ruta, construirParametros())

      registros.value = respuesta.data.data
      totalRegistros.value = respuesta.data.total
    }
    catch (error) {
      notificarError(mensajeDeError(error))
    }
    finally {
      cargando.value = false
    }
  }

  // VDataTableServer avisa cuando cambian la página, la cantidad por página o el orden
  const alCambiarOpciones = (nuevasOpciones: OpcionesTabla) => {
    opciones.value = nuevasOpciones
    cargar()
  }

  // Al escribir en un filtro se espera 400 ms antes de consultar, para no llamar en cada tecla
  watchDebounced(filtros, () => {
    opciones.value.page = 1
    cargar()
  }, { debounce: 400, deep: true })

  return { registros, totalRegistros, cargando, opciones, cargar, alCambiarOpciones }
}
