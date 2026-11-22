<script setup lang="ts">
import type { CampoCatalogo } from '@/types/catalogo'

useHead({ title: 'Centros de costo' })

const campos: CampoCatalogo[] = [
  { clave: 'codigo', etiqueta: 'Código', tipo: 'texto', obligatorio: true, longitudMaxima: 20, placeholder: 'CC-010' },
  { clave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', obligatorio: true, longitudMaxima: 150, placeholder: 'Tecnología' },
]
</script>

<template>
  <CatalogoCrud
    titulo="Centros de costo"
    titulo-singular="centro de costo"
    descripcion="Áreas de la cooperativa a las que se carga cada solicitud de compra."
    ruta="/api/centros_costo"
    sujeto="CentroCosto"
    permiso="centro costos"
    :campos="campos"
  />
</template>
