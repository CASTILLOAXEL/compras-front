<script setup lang="ts">
import type { Orden } from '@/types/orden'
import DialogoRecepcion from '@/components/ordenes/DialogoRecepcion.vue'

useHead({ title: 'Detalle de orden de compra' })

const ruta = useRoute('ordenes-id')
const ordenId = Number(ruta.params.id)

const { obtener, enviar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()

const orden = ref<Orden | null>(null)

const cargarOrden = async () => {
  try {
    const respuesta = await obtener<Orden>(`/api/ordenes/${ordenId}`)

    orden.value = respuesta.data
  }
  catch (error) {
    notificarError(mensajeDeError(error))
    await navigateTo('/ordenes')
  }
}

const estaEmitida = computed(() => orden.value?.estado_orden_id === ESTADOS_ORDEN.EMITIDA)
const tieneRecepciones = computed(() => (orden.value?.recepciones?.length ?? 0) > 0)

// Recepción: el back devuelve la orden actualizada (ítems, estado y recepciones)
const mostrarDialogoRecepcion = ref(false)

const alRegistrarRecepcion = (ordenActualizada: Orden) => {
  orden.value = ordenActualizada
}

// Cancelar: solo una orden emitida y sin recepciones
const mostrarConfirmacionCancelar = ref(false)
const cancelando = ref(false)

const cancelarOrden = async () => {
  cancelando.value = true

  try {
    const respuesta = await enviar<Orden>(`/api/ordenes/${ordenId}/cancelar`)

    orden.value = respuesta.data
    exito(respuesta.message)
    mostrarConfirmacionCancelar.value = false
  }
  catch (error) {
    notificarError(mensajeDeError(error))
  }
  finally {
    cancelando.value = false
  }
}

onMounted(cargarOrden)
</script>

<template>
  <div>
    <template v-if="orden">
      <div class="d-flex flex-wrap justify-space-between align-center gap-4 mb-6">
        <div class="d-flex align-center gap-3">
          <IconBtn to="/ordenes">
            <VIcon icon="tabler-arrow-left" />
            <VTooltip activator="parent">
              Volver al listado
            </VTooltip>
          </IconBtn>
          <h4 class="text-h4">
            Orden {{ orden.numero }}
          </h4>
          <VChip
            :color="colorEstadoOrden(orden.estado_orden_id)"
            size="small"
            label
          >
            {{ orden.estado_orden?.nombre }}
          </VChip>
        </div>

        <div class="d-flex flex-wrap gap-4">
          <VBtn
            v-if="estaEmitida && !tieneRecepciones && $can('cancelar ordenes', 'Orden')"
            color="error"
            variant="tonal"
            prepend-icon="tabler-ban"
            @click="mostrarConfirmacionCancelar = true"
          >
            Cancelar orden
          </VBtn>
          <VBtn
            v-if="estaEmitida && $can('recibir ordenes', 'Orden')"
            prepend-icon="tabler-truck-delivery"
            @click="mostrarDialogoRecepcion = true"
          >
            Registrar recepción
          </VBtn>
        </div>
      </div>

      <!-- Datos generales -->
      <VCard class="mb-6">
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              sm="6"
              md="3"
            >
              <small class="text-disabled">Fecha de emisión</small>
              <p class="text-body-1 font-weight-medium mb-0">
                {{ formatoFecha(orden.fecha_emision) }}
              </p>
            </VCol>
            <VCol
              cols="12"
              sm="6"
              md="3"
            >
              <small class="text-disabled">Proveedor</small>
              <p class="text-body-1 font-weight-medium mb-0">
                {{ orden.proveedor?.razon_social }}
              </p>
              <small>NIT {{ orden.proveedor?.nit }}</small>
            </VCol>
            <VCol
              cols="12"
              sm="6"
              md="3"
            >
              <small class="text-disabled">Solicitud de origen</small>
              <p class="text-body-1 font-weight-medium mb-0">
                <NuxtLink
                  v-if="orden.solicitud"
                  :to="`/solicitudes/${orden.solicitud.id}`"
                >
                  {{ orden.solicitud.numero }}
                </NuxtLink>
              </p>
              <small>{{ orden.solicitud?.centro_costo?.nombre }}</small>
            </VCol>
            <VCol
              cols="12"
              sm="6"
              md="3"
            >
              <small class="text-disabled">Total de la orden</small>
              <p class="text-h5 text-primary mb-0">
                {{ formatoQuetzales(orden.total) }}
              </p>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <VRow>
        <!-- Ítems con su avance de recepción -->
        <VCol
          cols="12"
          lg="8"
        >
          <VCard title="Ítems de la orden">
            <VTable class="text-no-wrap">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Unidad</th>
                  <th class="text-end">
                    Cantidad
                  </th>
                  <th class="text-end">
                    Precio unitario
                  </th>
                  <th class="text-end">
                    Subtotal
                  </th>
                  <th class="text-end">
                    Recibido
                  </th>
                  <th class="text-end">
                    Pendiente
                  </th>
                  <th class="text-center">
                    Recepción
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="detalle in orden.detalles ?? []"
                  :key="detalle.id"
                >
                  <td class="font-weight-medium text-high-emphasis">
                    {{ detalle.solicitud_detalle?.producto?.nombre }}
                  </td>
                  <td>{{ detalle.solicitud_detalle?.unidad_medida?.abreviatura }}</td>
                  <td class="text-end">
                    {{ Number(detalle.cantidad).toLocaleString('es-GT') }}
                  </td>
                  <td class="text-end">
                    {{ formatoQuetzales(Number(detalle.precio_unitario)) }}
                  </td>
                  <td class="text-end">
                    {{ formatoQuetzales(detalle.subtotal) }}
                  </td>
                  <td class="text-end">
                    {{ Number(detalle.cantidad_recibida ?? 0).toLocaleString('es-GT') }}
                  </td>
                  <td class="text-end">
                    {{ Number(detalle.cantidad_pendiente ?? 0).toLocaleString('es-GT') }}
                  </td>
                  <td class="text-center">
                    <VChip
                      :color="colorEstadoRecepcion(detalle.estado_recepcion)"
                      size="small"
                      label
                    >
                      {{ detalle.estado_recepcion }}
                    </VChip>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colspan="4"
                    class="text-end font-weight-medium"
                  >
                    Total
                  </td>
                  <td class="text-end text-h6 text-primary">
                    {{ formatoQuetzales(orden.total) }}
                  </td>
                  <td colspan="3" />
                </tr>
              </tfoot>
            </VTable>
          </VCard>
        </VCol>

        <!-- Entregas registradas -->
        <VCol
          cols="12"
          lg="4"
        >
          <VCard title="Recepciones">
            <VCardText>
              <p
                v-if="!tieneRecepciones"
                class="mb-0"
              >
                Aún no se ha registrado ninguna entrega.
              </p>

              <VTimeline
                v-else
                side="end"
                align="start"
                truncate-line="both"
                density="compact"
              >
                <VTimelineItem
                  v-for="recepcion in orden.recepciones"
                  :key="recepcion.id"
                  dot-color="primary"
                  size="x-small"
                >
                  <div class="d-flex justify-space-between flex-wrap gap-2 mb-1">
                    <span class="font-weight-medium text-high-emphasis">{{ formatoFecha(recepcion.fecha) }}</span>
                    <small>{{ nombreUsuario(recepcion.responsable) }}</small>
                  </div>
                  <p
                    v-if="recepcion.observaciones"
                    class="mb-1"
                  >
                    {{ recepcion.observaciones }}
                  </p>
                  <ul class="ps-4 mb-0">
                    <li
                      v-for="detalleRecepcion in recepcion.detalles ?? []"
                      :key="detalleRecepcion.id"
                    >
                      {{ detalleRecepcion.orden_detalle?.solicitud_detalle?.producto?.nombre }}:
                      {{ Number(detalleRecepcion.cantidad_recibida).toLocaleString('es-GT') }}
                    </li>
                  </ul>
                </VTimelineItem>
              </VTimeline>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <DialogoRecepcion
        v-model="mostrarDialogoRecepcion"
        :orden="orden"
        @registrada="alRegistrarRecepcion"
      />

      <DialogoConfirmacion
        v-model="mostrarConfirmacionCancelar"
        titulo="¿Cancelar la orden?"
        :mensaje="`La orden ${orden.numero} quedará cancelada y no podrá recibirse.`"
        texto-confirmar="Sí, cancelar"
        :cargando="cancelando"
        @confirmar="cancelarOrden"
      />
    </template>

    <VCard
      v-else
      class="pa-12 text-center"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </VCard>
  </div>
</template>
