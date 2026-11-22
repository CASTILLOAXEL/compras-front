import type { Paginado } from '@/types/api'
import type { CentroCosto, Producto, UnidadMedida } from '@/types/solicitud'

// Catálogo completo, ordenado por nombre y solo registros activos
const PARAMETROS_CATALOGO = {
  'page[size]': 100,
  'sort': 'nombre',
  'filter[estado]': 1,
}

/**
 * Combos de la solicitud (centro de costo) y de sus ítems (producto y unidad de medida).
 */
export const useCatalogosSolicitud = () => {
  const { obtener } = useClienteApi()

  const centrosCosto = ref<CentroCosto[]>([])
  const productos = ref<Producto[]>([])
  const unidadesMedida = ref<UnidadMedida[]>([])

  const cargarCentrosCosto = async () => {
    const respuesta = await obtener<Paginado<CentroCosto>>('/api/centros_costo', PARAMETROS_CATALOGO)

    centrosCosto.value = respuesta.data.data
  }

  // Los dos catálogos se piden al mismo tiempo
  const cargarCatalogosItems = async () => {
    const [respuestaProductos, respuestaUnidades] = await Promise.all([
      obtener<Paginado<Producto>>('/api/productos', PARAMETROS_CATALOGO),
      obtener<Paginado<UnidadMedida>>('/api/unidades_medida', PARAMETROS_CATALOGO),
    ])

    productos.value = respuestaProductos.data.data
    unidadesMedida.value = respuestaUnidades.data.data
  }

  return { centrosCosto, productos, unidadesMedida, cargarCentrosCosto, cargarCatalogosItems }
}
