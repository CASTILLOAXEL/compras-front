<script setup lang="ts">
import type { CampoCatalogo } from '@/types/catalogo'

useHead({ title: 'Tipos de producto' })

const campos: CampoCatalogo[] = [
  { clave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', obligatorio: true, longitudMaxima: 50, placeholder: 'Bien' },
]
</script>

<template>
  <CatalogoCrud
    titulo="Tipos de producto"
    titulo-singular="tipo de producto"
    descripcion="Clasifica productos y contratos como bien o servicio."
    ruta="/api/tipos_producto"
    sujeto="TipoProducto"
    permiso="tipo productos"
    :campos="campos"
  />
</template>
