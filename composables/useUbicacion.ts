import type { Paginado } from '@/types/api'
import type { Aldea, Departamento, Municipio } from '@/types/proveedor'

// Catálogo completo, ordenado por nombre y solo registros activos
const PARAMETROS_CATALOGO = {
  'page[size]': 100,
  'sort': 'nombre',
  'filter[estado]': 1,
}

/**
 * Combos en cascada de la dirección: departamento -> municipio -> aldea.
 */
export const useUbicacion = () => {
  const { obtener } = useClienteApi()

  const departamentos = ref<Departamento[]>([])
  const municipios = ref<Municipio[]>([])
  const aldeas = ref<Aldea[]>([])

  const cargarDepartamentos = async () => {
    const respuesta = await obtener<Paginado<Departamento>>('/api/departamentos', PARAMETROS_CATALOGO)

    departamentos.value = respuesta.data.data
  }

  const cargarMunicipios = async (departamentoId: number) => {
    const respuesta = await obtener<Paginado<Municipio>>('/api/municipios', {
      ...PARAMETROS_CATALOGO,
      'filter[departamento_id]': departamentoId,
    })

    municipios.value = respuesta.data.data
  }

  const cargarAldeas = async (municipioId: number) => {
    const respuesta = await obtener<Paginado<Aldea>>('/api/aldeas', {
      ...PARAMETROS_CATALOGO,
      'filter[municipio_id]': municipioId,
    })

    aldeas.value = respuesta.data.data
  }

  return { departamentos, municipios, aldeas, cargarDepartamentos, cargarMunicipios, cargarAldeas }
}
