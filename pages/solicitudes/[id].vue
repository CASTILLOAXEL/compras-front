<script setup lang="ts">
import type { Solicitud } from '@/types/solicitud'
import HistorialSolicitud from '@/components/solicitudes/HistorialSolicitud.vue'
import TablaItems from '@/components/solicitudes/TablaItems.vue'

useHead({ title: 'Detalle de solicitud' })

const ruta = useRoute('solicitudes-id')
const solicitudId = Number(ruta.params.id)

const { obtener, enviar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()

const solicitud = ref<Solicitud | null>(null)

const cargarSolicitud = async () => {
  try {
    const respuesta = await obtener<Solicitud>(`/api/solicitudes/${solicitudId}`)

    solicitud.value = respuesta.data
  }
  catch (error) {
    notificarError(mensajeDeError(error))
    await navigateTo('/solicitudes')
  }
}

const esBorrador = computed(() => solicitud.value?.estado_solicitud_id === ESTADOS_SOLICITUD.BORRADOR)
const estaEnAprobacion = computed(() => solicitud.value?.estado_solicitud_id === ESTADOS_SOLICITUD.EN_APROBACION)

const procesando = ref(false)

const mostrarConfirmacionEnvio = ref(false)

const enviarAAprobacion = async () => {
  procesando.value = true

  try {
    const respuesta = await enviar<Solicitud>(`/api/solicitudes/${solicitudId}/enviar`)

    solicitud.value = respuesta.data
    exito(respuesta.message)
    mostrarConfirmacionEnvio.value = false
  }
  catch (error) {
    notificarError(mensajeDeError(error))
  }
  finally {
    procesando.value = false
  }
}

type Decision = 'aprobar' | 'rechazar'

const decision = ref<Decision>('aprobar')
const mostrarDialogoDecision = ref(false)
const observacion = ref('')
const errorObservacion = ref('')

const abrirDecision = (nuevaDecision: Decision) => {
  decision.value = nuevaDecision
  observacion.value = ''
  errorObservacion.value = ''
  mostrarDialogoDecision.value = true
}

const confirmarDecision = async () => {
  if (decision.value === 'rechazar' && !observacion.value.trim()) {
    errorObservacion.value = 'Indique el motivo del rechazo.'

    return
  }

  procesando.value = true

  try {
    const respuesta = await enviar<Solicitud>(`/api/solicitudes/${solicitudId}/${decision.value}`, {
      observacion: observacion.value.trim() || null,
    })

    solicitud.value = respuesta.data
    exito(respuesta.message)
    mostrarDialogoDecision.value = false
  }
  catch (error) {
    errorObservacion.value = erroresPorCampo(error).observacion ?? ''
    notificarError(mensajeDeError(error))
  }
  finally {
    procesando.value = false
  }
}

onMounted(cargarSolicitud)
</script>

<template>
  <div>
    <template v-if="solicitud">
      <!-- Encabezado: número, estado y acciones del flujo -->
      <div class="d-flex flex-wrap justify-space-between align-center gap-4 mb-6">
        <div class="d-flex align-center gap-3">
          <IconBtn to="/solicitudes">
            <VIcon icon="tabler-arrow-left" />
            <VTooltip activator="parent">
              Volver al listado
            </VTooltip>
          </IconBtn>
          <h4 class="text-h4">
            Solicitud {{ solicitud.numero }}
          </h4>
          <VChip
            :color="colorEstadoSolicitud(solicitud.estado_solicitud_id)"
            size="small"
            label
          >
            {{ solicitud.estado_solicitud?.nombre }}
          </VChip>
        </div>

        <div class="d-flex flex-wrap gap-4">
          <VBtn
            v-if="esBorrador && $can('enviar solicitudes', 'Solicitud')"
            prepend-icon="tabler-send"
            @click="mostrarConfirmacionEnvio = true"
          >
            Enviar a aprobación
          </VBtn>

          <template v-if="estaEnAprobacion && $can('aprobar solicitudes', 'Solicitud')">
            <VBtn
              color="error"
              variant="tonal"
              prepend-icon="tabler-x"
              @click="abrirDecision('rechazar')"
            >
              Rechazar
            </VBtn>
            <VBtn
              color="success"
              prepend-icon="tabler-check"
              @click="abrirDecision('aprobar')"
            >
              Aprobar
            </VBtn>
          </template>
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
              <small class="text-disabled">Fecha</small>
              <p class="text-body-1 font-weight-medium mb-0">
                {{ formatoFecha(solicitud.fecha) }}
              </p>
            </VCol>
            <VCol
              cols="12"
              sm="6"
              md="3"
            >
              <small class="text-disabled">Centro de costo</small>
              <p class="text-body-1 font-weight-medium mb-0">
                {{ solicitud.centro_costo?.codigo }} · {{ solicitud.centro_costo?.nombre }}
              </p>
            </VCol>
            <VCol
              cols="12"
              sm="6"
              md="3"
            >
              <small class="text-disabled">Solicitante</small>
              <p class="text-body-1 font-weight-medium mb-0">
                {{ nombreUsuario(solicitud.solicitante) }}
              </p>
            </VCol>
            <VCol
              cols="12"
              sm="6"
              md="3"
            >
              <small class="text-disabled">Total estimado</small>
              <p class="text-h5 text-primary mb-0">
                {{ formatoQuetzales(solicitud.total_estimado) }}
              </p>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <VRow>
        <VCol
          cols="12"
          lg="8"
        >
          <TablaItems
            :solicitud-id="solicitud.id"
            :detalles="solicitud.detalles ?? []"
            :total-estimado="solicitud.total_estimado ?? 0"
            :es-borrador="esBorrador"
            @actualizada="cargarSolicitud"
          />
        </VCol>
        <VCol
          cols="12"
          lg="4"
        >
          <HistorialSolicitud :historial="solicitud.historial ?? []" />
        </VCol>
      </VRow>

      <DialogoConfirmacion
        v-model="mostrarConfirmacionEnvio"
        titulo="¿Enviar a aprobación?"
        mensaje="Después de enviarla ya no podrá modificar sus ítems."
        texto-confirmar="Sí, enviar"
        color="primary"
        :cargando="procesando"
        @confirmar="enviarAAprobacion"
      />

      <VDialog
        v-model="mostrarDialogoDecision"
        max-width="500"
        :persistent="procesando"
      >
        <VCard :title="decision === 'aprobar' ? 'Aprobar solicitud' : 'Rechazar solicitud'">
          <VCardText>
            <AppTextarea
              v-model="observacion"
              :label="decision === 'aprobar' ? 'Observación (opcional)' : 'Motivo del rechazo'"
              rows="3"
              counter="500"
              :error-messages="errorObservacion"
            />
          </VCardText>
          <VCardText class="d-flex justify-end gap-4">
            <VBtn
              variant="tonal"
              color="secondary"
              :disabled="procesando"
              @click="mostrarDialogoDecision = false"
            >
              Cancelar
            </VBtn>
            <VBtn
              :color="decision === 'aprobar' ? 'success' : 'error'"
              :loading="procesando"
              @click="confirmarDecision"
            >
              {{ decision === 'aprobar' ? 'Aprobar' : 'Rechazar' }}
            </VBtn>
          </VCardText>
        </VCard>
      </VDialog>
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
