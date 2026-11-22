<script setup lang="ts">
import type { CampoCatalogo } from '@/types/catalogo'

useHead({ title: 'Unidades de medida' })

const campos: CampoCatalogo[] = [
  { clave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', obligatorio: true, longitudMaxima: 50, placeholder: 'Caja' },
  { clave: 'abreviatura', etiqueta: 'Abreviatura', tipo: 'texto', obligatorio: true, longitudMaxima: 10, placeholder: 'CJA' },
]
</script>

<template>
  <CatalogoCrud
    titulo="Unidades de medida"
    titulo-singular="unidad de medida"
    descripcion="Cómo se cuenta cada ítem de una solicitud: unidad, caja, resma, servicio..."
    ruta="/api/unidades_medida"
    sujeto="UnidadMedida"
    permiso="unidad medidas"
    :campos="campos"
  />
</template>
