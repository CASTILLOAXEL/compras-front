<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import type { FormularioItem, SolicitudDetalle } from '@/types/solicitud'

interface Props {
  solicitudId: number
  detalles: SolicitudDetalle[]
  totalEstimado: number
  esBorrador: boolean
}

const props = defineProps<Props>()

// Avisa a la página que algo cambió, para que vuelva a pedir la solicitud (ítems, total e historial)
const emit = defineEmits<{ actualizada: [] }>()

const { crear, actualizar, eliminar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()
const { productos, unidadesMedida, cargarCatalogosItems } = useCatalogosSolicitud()

const formularioVacio = (): FormularioItem => ({
  producto_id: null,
  unidad_medida_id: null,
  cantidad: null,
  precio_estimado: null,
})

const refFormulario = ref<VForm>()
const formulario = ref<FormularioItem>(formularioVacio())
const itemEnEdicionId = ref<number | null>(null)
const errores = ref<Record<string, string>>({})
const guardando = ref(false)

// Mismas reglas que el back: cantidad > 0 y precio >= 0
const reglaObligatoria = (valor: unknown) => (valor !== null && valor !== undefined && valor !== '') || 'Este campo es obligatorio.'
const reglaCantidad = (valor: number | null) => Number(valor) > 0 || 'La cantidad debe ser mayor a 0.'
const reglaPrecio = (valor: number | null) => Number(valor) >= 0 || 'El precio no puede ser negativo.'

const subtotalFormulario = computed(() =>
  Number(formulario.value.cantidad ?? 0) * Number(formulario.value.precio_estimado ?? 0),
)

const limpiarFormulario = () => {
  formulario.value = formularioVacio()
  itemEnEdicionId.value = null
  errores.value = {}
  refFormulario.value?.resetValidation()
}

// El ítem a editar se carga en el mismo formulario de arriba
const editarItem = (detalle: SolicitudDetalle) => {
  itemEnEdicionId.value = detalle.id
  errores.value = {}
  formulario.value = {
    producto_id: detalle.producto_id,
    unidad_medida_id: detalle.unidad_medida_id,
    cantidad: Number(detalle.cantidad),
    precio_estimado: Number(detalle.precio_estimado),
  }
}

const guardarItem = async () => {
  const { valid: esValido } = await refFormulario.value!.validate()

  if (!esValido)
    return

  guardando.value = true
  errores.value = {}

  try {
    const respuesta = itemEnEdicionId.value
      ? await actualizar<SolicitudDetalle>(`/api/solicitud_detalles/${itemEnEdicionId.value}`, formulario.value)
      : await crear<SolicitudDetalle>('/api/solicitud_detalles', { ...formulario.value, solicitud_id: props.solicitudId })

    exito(respuesta.message)
    limpiarFormulario()
    emit('actualizada')
  }
  catch (error) {
    // Por ejemplo: "Este producto ya está en la solicitud"
    errores.value = erroresPorCampo(error)
    notificarError(mensajeDeError(error))
  }
  finally {
    guardando.value = false
  }
}

// Quitar un ítem con confirmación
const itemAEliminar = ref<SolicitudDetalle | null>(null)
const mostrarConfirmacion = ref(false)
const eliminando = ref(false)

const confirmarEliminacion = (detalle: SolicitudDetalle) => {
  itemAEliminar.value = detalle
  mostrarConfirmacion.value = true
}

const eliminarItem = async () => {
  if (!itemAEliminar.value)
    return

  eliminando.value = true

  try {
    const respuesta = await eliminar(`/api/solicitud_detalles/${itemAEliminar.value.id}`)

    exito(respuesta.message)
    mostrarConfirmacion.value = false

    if (itemAEliminar.value.id === itemEnEdicionId.value)
      limpiarFormulario()

    emit('actualizada')
  }
  catch (error) {
    notificarError(mensajeDeError(error))
  }
  finally {
    eliminando.value = false
  }
}

onMounted(cargarCatalogosItems)
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>Ítems de la solicitud</VCardTitle>
      <VCardSubtitle v-if="!esBorrador">
        Los ítems solo se pueden modificar mientras la solicitud está en borrador.
      </VCardSubtitle>
    </VCardItem>

    <!-- Formulario para agregar o editar un ítem sin recargar la página -->
    <VCardText v-if="esBorrador && $can('crear solicitud detalles', 'SolicitudDetalle')">
      <VForm
        ref="refFormulario"
        @submit.prevent="guardarItem"
      >
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppAutocomplete
              v-model="formulario.producto_id"
              label="Producto o servicio"
              placeholder="Seleccione"
              :items="productos"
              item-title="nombre"
              item-value="id"
              :rules="[reglaObligatoria]"
              :error-messages="errores.producto_id"
            />
          </VCol>
          <VCol
            cols="12"
            md="2"
          >
            <AppSelect
              v-model="formulario.unidad_medida_id"
              label="Unidad"
              placeholder="Seleccione"
              :items="unidadesMedida"
              item-title="nombre"
              item-value="id"
              :rules="[reglaObligatoria]"
              :error-messages="errores.unidad_medida_id"
            />
          </VCol>
          <VCol
            cols="6"
            md="2"
          >
            <AppTextField
              v-model.number="formulario.cantidad"
              label="Cantidad"
              type="number"
              min="0"
              step="0.01"
              :rules="[reglaObligatoria, reglaCantidad]"
              :error-messages="errores.cantidad"
            />
          </VCol>
          <VCol
            cols="6"
            md="2"
          >
            <AppTextField
              v-model.number="formulario.precio_estimado"
              label="Precio (Q)"
              type="number"
              min="0"
              step="0.01"
              :rules="[reglaObligatoria, reglaPrecio]"
              :error-messages="errores.precio_estimado"
            />
          </VCol>
          <VCol
            cols="12"
            md="2"
            class="d-flex align-end gap-2"
          >
            <VBtn
              type="submit"
              :loading="guardando"
              :prepend-icon="itemEnEdicionId ? 'tabler-device-floppy' : 'tabler-plus'"
            >
              {{ itemEnEdicionId ? 'Guardar' : 'Agregar' }}
            </VBtn>
            <IconBtn
              v-if="itemEnEdicionId"
              @click="limpiarFormulario"
            >
              <VIcon icon="tabler-x" />
              <VTooltip activator="parent">
                Cancelar edición
              </VTooltip>
            </IconBtn>
          </VCol>
        </VRow>
        <p class="text-body-2 mt-2 mb-0">
          Subtotal del ítem: <strong>{{ formatoQuetzales(subtotalFormulario) }}</strong>
        </p>
      </VForm>
    </VCardText>

    <VDivider />

    <VTable class="text-no-wrap">
      <thead>
      <tr>
        <th>Producto</th>
        <th>Unidad</th>
        <th class="text-end">
          Cantidad
        </th>
        <th class="text-end">
          Precio estimado
        </th>
        <th class="text-end">
          Subtotal
        </th>
        <th
          v-if="esBorrador"
          class="text-center"
        >
          Acciones
        </th>
      </tr>
      </thead>

      <tbody>
      <tr
        v-for="detalle in detalles"
        :key="detalle.id"
      >
        <td class="font-weight-medium text-high-emphasis">
          {{ detalle.producto?.nombre }}
        </td>
        <td>{{ detalle.unidad_medida?.abreviatura }}</td>
        <td class="text-end">
          {{ Number(detalle.cantidad).toLocaleString('es-GT') }}
        </td>
        <td class="text-end">
          {{ formatoQuetzales(Number(detalle.precio_estimado)) }}
        </td>
        <td class="text-end">
          {{ formatoQuetzales(subtotalItem(detalle)) }}
        </td>
        <td
          v-if="esBorrador"
          class="text-center"
        >
          <IconBtn
            v-if="$can('editar solicitud detalles', 'SolicitudDetalle')"
            @click="editarItem(detalle)"
          >
            <VIcon icon="tabler-pencil" />
            <VTooltip activator="parent">
              Editar
            </VTooltip>
          </IconBtn>
          <IconBtn
            v-if="$can('eliminar solicitud detalles', 'SolicitudDetalle')"
            @click="confirmarEliminacion(detalle)"
          >
            <VIcon
              icon="tabler-trash"
              color="error"
            />
            <VTooltip activator="parent">
              Quitar
            </VTooltip>
          </IconBtn>
        </td>
      </tr>

      <tr v-if="!detalles.length">
        <td
          colspan="6"
          class="text-center py-6"
        >
          Aún no hay ítems. Agregue el primero con el formulario de arriba.
        </td>
      </tr>
      </tbody>

      <tfoot>
      <tr>
        <td
          colspan="4"
          class="text-end font-weight-medium"
        >
          Total estimado
        </td>
        <td class="text-end text-h6 text-primary">
          {{ formatoQuetzales(totalEstimado) }}
        </td>
        <td v-if="esBorrador" />
      </tr>
      </tfoot>
    </VTable>

    <DialogoConfirmacion
      v-model="mostrarConfirmacion"
      titulo="¿Quitar ítem?"
      :mensaje="`Se quitará ${itemAEliminar?.producto?.nombre} de la solicitud.`"
      texto-confirmar="Sí, quitar"
      :cargando="eliminando"
      @confirmar="eliminarItem"
    />
  </VCard>
</template>
