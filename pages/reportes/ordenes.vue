<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import type { ReporteOrdenes } from '@/types/reporte'

useHead({ title: 'Reporte de órdenes' })

const { obtener } = useClienteApi()
const { error: notificarError } = useNotificacion()
const { proveedores, cargarProveedores } = useCatalogosCompras()

const filtros = ref({
  proveedor_id: null as number | null,
  estado_orden_id: null as number | null,
  fecha_desde: '',
  fecha_hasta: '',
})

const reporte = ref<ReporteOrdenes | null>(null)
const cargando = ref(false)

// Solo se envían los filtros que tienen valor
const parametrosDelReporte = () =>
  Object.fromEntries(Object.entries(filtros.value).filter(([, valor]) => valor !== null && valor !== ''))

const cargarReporte = async () => {
  cargando.value = true

  try {
    const respuesta = await obtener<ReporteOrdenes>('/api/reportes/ordenes', parametrosDelReporte())

    reporte.value = respuesta.data
  }
  catch (error) {
    notificarError(mensajeDeError(error))
  }
  finally {
    cargando.value = false
  }
}

const cantidadProveedores = computed(() => new Set(reporte.value?.resumen.map(fila => fila.proveedor_id)).size)

const imprimir = () => window.print()

watchDebounced(filtros, cargarReporte, { debounce: 300, deep: true })

onMounted(async () => {
  await Promise.all([cargarProveedores(), cargarReporte()])
})
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center gap-4 mb-6">
      <div>
        <h4 class="text-h4 mb-1">
          Reporte de órdenes de compra
        </h4>
        <p class="mb-0">
          Órdenes agrupadas por proveedor y estado, para control administrativo.
        </p>
      </div>

      <VBtn
        variant="tonal"
        prepend-icon="tabler-printer"
        @click="imprimir"
      >
        Imprimir
      </VBtn>
    </div>

    <!-- Filtros -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppAutocomplete
              v-model="filtros.proveedor_id"
              label="Proveedor"
              placeholder="Todos"
              :items="proveedores"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="2"
          >
            <AppSelect
              v-model="filtros.estado_orden_id"
              label="Estado"
              placeholder="Todos"
              :items="OPCIONES_ESTADO_ORDEN"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="filtros.fecha_desde"
              label="Emitidas desde"
              type="date"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="filtros.fecha_hasta"
              label="Hasta"
              type="date"
              :min="filtros.fecha_desde"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VProgressLinear
      v-if="cargando"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <template v-if="reporte">
      <!-- Totales -->
      <VRow class="mb-2">
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar
                color="primary"
                variant="tonal"
                rounded
                size="44"
              >
                <VIcon icon="tabler-file-invoice" />
              </VAvatar>
              <div>
                <h4 class="text-h4">
                  {{ reporte.totales.cantidad_ordenes }}
                </h4>
                <span>Órdenes</span>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar
                color="success"
                variant="tonal"
                rounded
                size="44"
              >
                <VIcon icon="tabler-cash" />
              </VAvatar>
              <div>
                <h4 class="text-h4">
                  {{ formatoQuetzales(reporte.totales.monto_total) }}
                </h4>
                <span>Monto total</span>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar
                color="info"
                variant="tonal"
                rounded
                size="44"
              >
                <VIcon icon="tabler-building-store" />
              </VAvatar>
              <div>
                <h4 class="text-h4">
                  {{ cantidadProveedores }}
                </h4>
                <span>Proveedores</span>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Resumen agrupado -->
      <VCard
        title="Resumen por proveedor y estado"
        class="mb-6"
      >
        <VTable class="text-no-wrap">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Estado</th>
              <th class="text-end">
                Órdenes
              </th>
              <th class="text-end">
                Monto
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="fila in reporte.resumen"
              :key="`${fila.proveedor_id}-${fila.estado_orden_id}`"
            >
              <td class="font-weight-medium text-high-emphasis">
                {{ fila.razon_social }}
              </td>
              <td>
                <VChip
                  :color="colorEstadoOrden(fila.estado_orden_id)"
                  size="small"
                  label
                >
                  {{ fila.estado }}
                </VChip>
              </td>
              <td class="text-end">
                {{ fila.cantidad_ordenes }}
              </td>
              <td class="text-end">
                {{ formatoQuetzales(fila.monto_total) }}
              </td>
            </tr>
            <tr v-if="!reporte.resumen.length">
              <td
                colspan="4"
                class="text-center py-6"
              >
                No hay órdenes con esos filtros.
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>

      <!-- Detalle -->
      <VCard title="Detalle de órdenes">
        <VTable class="text-no-wrap">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha de emisión</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th class="text-end">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ordenReporte in reporte.ordenes"
              :key="ordenReporte.id"
            >
              <td>
                <NuxtLink :to="`/ordenes/${ordenReporte.id}`">
                  {{ ordenReporte.numero }}
                </NuxtLink>
              </td>
              <td>{{ formatoFecha(ordenReporte.fecha_emision) }}</td>
              <td>{{ ordenReporte.razon_social }}</td>
              <td>
                <VChip
                  :color="colorEstadoOrden(ordenReporte.estado_orden_id)"
                  size="small"
                  label
                >
                  {{ ordenReporte.estado }}
                </VChip>
              </td>
              <td class="text-end">
                {{ formatoQuetzales(ordenReporte.total) }}
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </template>
  </div>
</template>
