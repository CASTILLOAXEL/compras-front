<script setup lang="ts">
import type { Orden } from '@/types/orden'

useHead({ title: 'Órdenes de compra' })

const { proveedores, cargarProveedores } = useCatalogosCompras()

const filtros = ref({
  numero: '',
  proveedor_id: null as number | null,
  estado_orden_id: null as number | null,
})

const {
  registros: ordenes,
  totalRegistros,
  cargando,
  opciones,
  alCambiarOpciones,
} = useTablaPaginada<Orden>('/api/ordenes', filtros)

const encabezados = [
  { title: 'Número', key: 'numero' },
  { title: 'Fecha de emisión', key: 'fecha_emision' },
  { title: 'Proveedor', key: 'proveedor', sortable: false },
  { title: 'Solicitud', key: 'solicitud', sortable: false },
  { title: 'Total', key: 'total', sortable: false, align: 'end' as const },
  { title: 'Estado', key: 'estado_orden_id' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' as const },
]

onMounted(cargarProveedores)
</script>

<template>
  <div>
    <div class="mb-6">
      <h4 class="text-h4 mb-1">
        Órdenes de compra
      </h4>
      <p class="mb-0">
        Se generan desde una solicitud aprobada y se reciben en una o varias entregas.
      </p>
    </div>

    <VCard>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="filtros.numero"
              placeholder="Buscar por número"
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppAutocomplete
              v-model="filtros.proveedor_id"
              placeholder="Todos los proveedores"
              :items="proveedores"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="filtros.estado_orden_id"
              placeholder="Todos los estados"
              :items="OPCIONES_ESTADO_ORDEN"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VDataTableServer
        :headers="encabezados"
        :items="ordenes"
        :items-length="totalRegistros"
        :items-per-page="opciones.itemsPerPage"
        :page="opciones.page"
        :loading="cargando"
        loading-text="Cargando órdenes..."
        @update:options="alCambiarOpciones"
      >
        <template #item.numero="{ item }">
          <NuxtLink
            :to="`/ordenes/${item.id}`"
            class="font-weight-medium"
          >
            {{ item.numero }}
          </NuxtLink>
        </template>

        <template #item.fecha_emision="{ item }">
          {{ formatoFecha(item.fecha_emision) }}
        </template>

        <template #item.proveedor="{ item }">
          {{ item.proveedor?.razon_social }}
        </template>

        <template #item.solicitud="{ item }">
          <NuxtLink
            v-if="item.solicitud"
            :to="`/solicitudes/${item.solicitud.id}`"
          >
            {{ item.solicitud.numero }}
          </NuxtLink>
        </template>

        <template #item.total="{ item }">
          {{ formatoQuetzales(item.total) }}
        </template>

        <template #item.estado_orden_id="{ item }">
          <VChip
            :color="colorEstadoOrden(item.estado_orden_id)"
            size="small"
            label
          >
            {{ item.estado_orden?.nombre }}
          </VChip>
        </template>

        <template #item.acciones="{ item }">
          <IconBtn :to="`/ordenes/${item.id}`">
            <VIcon icon="tabler-eye" />
            <VTooltip activator="parent">
              Ver detalle y recepciones
            </VTooltip>
          </IconBtn>
        </template>

        <template #no-data>
          <div class="py-8 text-center">
            <img
              src="/images/guayacan/cooper.png"
              alt="Cooper"
              style="block-size: 110px;"
            >
            <p class="mt-4 mb-0">
              No hay órdenes que mostrar.
            </p>
          </div>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
