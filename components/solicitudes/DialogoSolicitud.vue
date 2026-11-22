<script setup lang="ts">
import type { Solicitud } from '@/types/solicitud'

interface Props {
  solicitud?: Solicitud | null
}

const props = withDefaults(defineProps<Props>(), {
  solicitud: null,
})

const emit = defineEmits<{ guardada: [solicitud: Solicitud] }>()

const visible = defineModel<boolean>({ required: true })

const { crear, actualizar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()
const { centrosCosto, cargarCentrosCosto } = useCatalogosSolicitud()

const centroCostoId = ref<number | null>(null)
const errores = ref<Record<string, string>>({})
const guardando = ref(false)

const esEdicion = computed(() => props.solicitud !== null)

// Cada vez que se abre, toma el centro de costo de la solicitud (o vacío si es nueva)
watch(visible, (estaAbierto) => {
  if (!estaAbierto)
    return

  centroCostoId.value = props.solicitud?.centro_costo_id ?? null
  errores.value = {}
})

const guardar = async () => {
  if (!centroCostoId.value) {
    errores.value = { centro_costo_id: 'Seleccione el centro de costo.' }

    return
  }

  guardando.value = true

  try {
    const datos = { centro_costo_id: centroCostoId.value }

    const respuesta = props.solicitud
      ? await actualizar<Solicitud>(`/api/solicitudes/${props.solicitud.id}`, datos)
      : await crear<Solicitud>('/api/solicitudes', datos)

    exito(respuesta.message)
    visible.value = false
    emit('guardada', respuesta.data)
  }
  catch (error) {
    errores.value = erroresPorCampo(error)
    notificarError(mensajeDeError(error))
  }
  finally {
    guardando.value = false
  }
}

onMounted(cargarCentrosCosto)
</script>

<template>
  <VDialog
    v-model="visible"
    max-width="500"
    :persistent="guardando"
  >
    <VCard :title="esEdicion ? `Editar solicitud ${solicitud?.numero}` : 'Nueva solicitud'">
      <VCardText>
        <p v-if="!esEdicion">
          El número, la fecha y el solicitante se asignan automáticamente. La solicitud se crea en borrador para agregarle sus ítems.
        </p>

        <AppSelect
          v-model="centroCostoId"
          label="Centro de costo"
          placeholder="Seleccione"
          :items="centrosCosto"
          item-title="nombre"
          item-value="id"
          :error-messages="errores.centro_costo_id"
        />
      </VCardText>

      <VCardText class="d-flex justify-end gap-4">
        <VBtn
          variant="tonal"
          color="secondary"
          :disabled="guardando"
          @click="visible = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          :loading="guardando"
          @click="guardar"
        >
          {{ esEdicion ? 'Guardar cambios' : 'Crear solicitud' }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
