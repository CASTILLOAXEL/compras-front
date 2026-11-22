import type { Paginado } from '@/types/api'
import type { OpcionSeleccion, TipoProducto } from '@/types/catalogo'
import type { Proveedor } from '@/types/proveedor'

// Solo registros activos, hasta 100
const PARAMETROS_ACTIVOS = {
  'page[size]': 100,
  'filter[estado]': 1,
}

/**
 * Combos de órdenes y contratos: proveedores activos y tipos de producto (bien o servicio).
 */
export const useCatalogosCompras = () => {
  const { obtener } = useClienteApi()

  const proveedores = ref<OpcionSeleccion[]>([])
  const tiposProducto = ref<OpcionSeleccion[]>([])

  const cargarProveedores = async () => {
    const respuesta = await obtener<Paginado<Proveedor>>('/api/proveedores', { ...PARAMETROS_ACTIVOS, sort: 'razon_social' })

    proveedores.value = respuesta.data.data.map(proveedor => ({
      title: `${proveedor.razon_social} (NIT ${proveedor.nit})`,
      value: proveedor.id,
    }))
  }

  const cargarTiposProducto = async () => {
    const respuesta = await obtener<Paginado<TipoProducto>>('/api/tipos_producto', { ...PARAMETROS_ACTIVOS, sort: 'nombre' })

    tiposProducto.value = respuesta.data.data.map(tipoProducto => ({ title: tipoProducto.nombre, value: tipoProducto.id }))
  }

  return { proveedores, tiposProducto, cargarProveedores, cargarTiposProducto }
}
