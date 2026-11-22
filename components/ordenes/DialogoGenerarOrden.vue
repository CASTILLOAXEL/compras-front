<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import type { ItemGenerarOrden, Orden } from '@/types/orden'
import type { Solicitud } from '@/types/solicitud'

const props = defineProps<{ solicitud: Solicitud }>()

const emit = defineEmits<{ generada: [orden: Orden] }>()

const visible = defineModel<boolean>({ required: true })

const { enviar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()
const { proveedores, cargarProveedores } = useCatalogosCompras()

const refFormulario = ref<VForm>()
const proveedorId = ref<number | null>(null)
const items = ref<ItemGenerarOrden[]>([])
const errores = ref<Record<string, string>>({})
const generando = ref(false)

// Al abrir: un renglón por ítem de la solicitud
watch(visible, estaAbierto => {
  if (!estaAbierto)
    return

  proveedorId.value = null
  errores.value = {}
  items.value = (props.solicitud.detalles ?? []).map(detalle => ({
    solicitud_detalle_id: detalle.id,
    producto: detalle.producto?.nombre ?? '',
    unidad: detalle.unidad_medida?.abreviatura ?? '',
    cantidad_solicitada: Number(detalle.cantidad),
    cantidad: Number(detalle.cantidad),
    precio_unitario: Number(detalle.precio_estimado),
  }))
})

const subtotalDeItem = (item: ItemGenerarOrden) => Number(item.cantidad ?? 0) * Number(item.precio_unitario ?? 0)

const totalOrden = computed(() => items.value.reduce((suma, item) => suma + subtotalDeItem(item), 0))

const reglaProveedor = (valor: number | null) => !!valor || 'Seleccione el proveedor.'
const reglaPrecio = (valor: number | null) => (valor !== null && Number(valor) >= 0) || 'No puede ser negativo.'

const reglaCantidad = (item: ItemGenerarOrden) => (valor: number | null) =>
  (Number(valor) > 0 && Number(valor) <= item.cantidad_solicitada) || `Entre 0 y ${item.cantidad_solicitada}.`

const generarOrden = async () => {
  const { valid: esValido } = await refFormulario.value!.validate()

  if (!esValido)
    return

  generando.value = true
  errores.value = {}

  try {
    const respuesta = await enviar<Orden>(`/api/solicitudes/${props.solicitud.id}/orden`, {
      proveedor_id: proveedorId.value,
      items: items.value.map(item => ({
        solicitud_detalle_id: item.solicitud_detalle_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      })),
    })

    exito(respuesta.message)
    visible.value = false
    emit('generada', respuesta.data)
  }
  catch (error) {
    errores.value = erroresPorCampo(error)
    notificarError(mensajeDeError(error))
  }
  finally {
    generando.value = false
  }
}

onMounted(cargarProveedores)
</script>

<template>
  <VDialog
    v-model="visible"
    max-width="960"
    :persistent="generando"
  >
    <VCard :title="`Generar orden de compra de ${solicitud.numero}`">
      <VForm
        ref="refFormulario"
        @submit.prevent="generarOrden"
      >
        <VCardText>
          <p>
            El número de la orden y la fecha de emisión se asignan automáticamente. Al generarla, la solicitud pasa a <strong>Completada</strong>.
          </p>

          <AppAutocomplete
            v-model="proveedorId"
            label="Proveedor"
            placeholder="Seleccione"
            :items="proveedores"
            :rules="[reglaProveedor]"
            :error-messages="errores.proveedor_id"
            class="mb-4"
          />

          <VTable class="text-no-wrap">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidad</th>
                <th class="text-end">
                  Solicitado
                </th>
                <th style="min-inline-size: 140px;">
                  Cantidad
                </th>
                <th style="min-inline-size: 160px;">
                  Precio unitario (Q)
                </th>
                <th class="text-end">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, indice) in items"
                :key="item.solicitud_detalle_id"
              >
                <td class="font-weight-medium text-high-emphasis">
                  {{ item.producto }}
                </td>
                <td>{{ item.unidad }}</td>
                <td class="text-end">
                  {{ item.cantidad_solicitada.toLocaleString('es-GT') }}
                </td>
                <td class="py-2">
                  <AppTextField
                    v-model.number="item.cantidad"
                    type="number"
                    min="0"
                    step="0.01"
                    density="compact"
                    :rules="[reglaCantidad(item)]"
                    :error-messages="errores[`items.${indice}.cantidad`]"
                  />
                </td>
                <td class="py-2">
                  <AppTextField
                    v-model.number="item.precio_unitario"
                    type="number"
                    min="0"
                    step="0.01"
                    density="compact"
                    :rules="[reglaPrecio]"
                    :error-messages="errores[`items.${indice}.precio_unitario`]"
                  />
                </td>
                <td class="text-end">
                  {{ formatoQuetzales(subtotalDeItem(item)) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  colspan="5"
                  class="text-end font-weight-medium"
                >
                  Total de la orden
                </td>
                <td class="text-end text-h6 text-primary">
                  {{ formatoQuetzales(totalOrden) }}
                </td>
              </tr>
            </tfoot>
          </VTable>
        </VCardText>

        <VCardText class="d-flex justify-end gap-4">
          <VBtn
            variant="tonal"
            color="secondary"
            :disabled="generando"
            @click="visible = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            type="submit"
            color="success"
            :loading="generando"
          >
            Generar orden
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
  </VDialog>
</template>
