<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import type { ItemRecepcion, Orden } from '@/types/orden'

const props = defineProps<{ orden: Orden }>()

const emit = defineEmits<{ registrada: [orden: Orden] }>()

const visible = defineModel<boolean>({ required: true })

const { enviar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()

const refFormulario = ref<VForm>()
const fecha = ref(fechaDeHoy())
const observaciones = ref('')
const items = ref<ItemRecepcion[]>([])
const errores = ref<Record<string, string>>({})
const registrando = ref(false)

// Al abrir: lo pendiente de cada ítem como cantidad sugerida
watch(visible, estaAbierto => {
  if (!estaAbierto)
    return

  fecha.value = fechaDeHoy()
  observaciones.value = ''
  errores.value = {}
  items.value = (props.orden.detalles ?? [])
    .filter(detalle => Number(detalle.cantidad_pendiente ?? 0) > 0)
    .map(detalle => ({
      orden_detalle_id: detalle.id,
      producto: detalle.solicitud_detalle?.producto?.nombre ?? '',
      cantidad_pendiente: Number(detalle.cantidad_pendiente ?? 0),
      cantidad_recibida: Number(detalle.cantidad_pendiente ?? 0),
    }))
})

const reglaFecha = (valor: string) => {
  if (!valor)
    return 'Indique la fecha de recepción.'

  if (valor > fechaDeHoy())
    return 'La fecha no puede ser futura.'

  return valor >= props.orden.fecha_emision || 'No puede ser anterior a la emisión de la orden.'
}

const reglaCantidad = (item: ItemRecepcion) => (valor: number | null) =>
  (Number(valor ?? 0) >= 0 && Number(valor ?? 0) <= item.cantidad_pendiente) || `Entre 0 y ${item.cantidad_pendiente}.`

const registrarRecepcion = async () => {
  const { valid: esValido } = await refFormulario.value!.validate()

  if (!esValido)
    return

  // Solo se envían los ítems que llegaron en esta entrega
  const itemsRecibidos = items.value.filter(item => Number(item.cantidad_recibida ?? 0) > 0)

  if (!itemsRecibidos.length) {
    notificarError('Indique la cantidad recibida de al menos un ítem.')

    return
  }

  registrando.value = true
  errores.value = {}

  try {
    const respuesta = await enviar<Orden>(`/api/ordenes/${props.orden.id}/recepciones`, {
      fecha: fecha.value,
      observaciones: observaciones.value.trim() || null,
      items: itemsRecibidos.map(item => ({
        orden_detalle_id: item.orden_detalle_id,
        cantidad_recibida: item.cantidad_recibida,
      })),
    })

    exito(respuesta.message)
    visible.value = false
    emit('registrada', respuesta.data)
  }
  catch (error) {
    errores.value = erroresPorCampo(error)
    notificarError(mensajeDeError(error))
  }
  finally {
    registrando.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="visible"
    max-width="760"
    :persistent="registrando"
  >
    <VCard :title="`Registrar recepción de ${orden.numero}`">
      <VForm
        ref="refFormulario"
        @submit.prevent="registrarRecepcion"
      >
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <AppTextField
                v-model="fecha"
                label="Fecha de recepción"
                type="date"
                :max="fechaDeHoy()"
                :rules="[reglaFecha]"
                :error-messages="errores.fecha"
              />
            </VCol>
            <VCol
              cols="12"
              md="8"
            >
              <AppTextField
                v-model="observaciones"
                label="Observaciones (opcional)"
                placeholder="Ej. Llegó una caja dañada"
                counter="500"
                :error-messages="errores.observaciones"
              />
            </VCol>
          </VRow>

          <p class="text-body-2 mt-4 mb-2">
            Escriba lo que llegó en esta entrega. Si un ítem no llegó, déjelo en 0.
          </p>

          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-end">
                  Pendiente
                </th>
                <th style="min-inline-size: 160px;">
                  Recibido ahora
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in items"
                :key="item.orden_detalle_id"
              >
                <td class="font-weight-medium text-high-emphasis">
                  {{ item.producto }}
                </td>
                <td class="text-end">
                  {{ item.cantidad_pendiente.toLocaleString('es-GT') }}
                </td>
                <td class="py-2">
                  <AppTextField
                    v-model.number="item.cantidad_recibida"
                    type="number"
                    min="0"
                    step="0.01"
                    density="compact"
                    :rules="[reglaCantidad(item)]"
                  />
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>

        <VCardText class="d-flex justify-end gap-4">
          <VBtn
            variant="tonal"
            color="secondary"
            :disabled="registrando"
            @click="visible = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            type="submit"
            :loading="registrando"
          >
            Registrar recepción
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
  </VDialog>
</template>
