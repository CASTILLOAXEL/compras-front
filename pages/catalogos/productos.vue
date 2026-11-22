<script setup lang="ts">
import type { Paginado } from '@/types/api'
import type { CampoCatalogo, OpcionSeleccion, TipoProducto } from '@/types/catalogo'

useHead({ title: 'Productos y servicios' })

const { obtener } = useClienteApi()

const tiposProducto = ref<OpcionSeleccion[]>([])

// computed: el combo se llena cuando llegan los tipos
const campos = computed<CampoCatalogo[]>(() => [
  { clave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', obligatorio: true, longitudMaxima: 150, placeholder: 'Computadora portátil' },
  { clave: 'tipo_producto_id', etiqueta: 'Tipo', tipo: 'seleccion', obligatorio: true, opciones: tiposProducto.value },
])

onMounted(async () => {
  const respuesta = await obtener<Paginado<TipoProducto>>('/api/tipos_producto', { 'page[size]': 100, 'sort': 'nombre' })

  tiposProducto.value = respuesta.data.data.map(tipo => ({ title: tipo.nombre, value: tipo.id }))
})
</script>

<template>
  <CatalogoCrud
    titulo="Productos y servicios"
    titulo-singular="producto"
    descripcion="Lo que se puede pedir en una solicitud de compra."
    ruta="/api/productos"
    sujeto="Producto"
    permiso="productos"
    :campos="campos"
  />
</template>
