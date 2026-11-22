<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import type { Contrato, FormularioContrato } from '@/types/contrato'

interface Props {
  contrato?: Contrato | null
}

const props = withDefaults(defineProps<Props>(), {
  contrato: null,
})

const emit = defineEmits<{ guardado: [] }>()

const visible = defineModel<boolean>({ required: true })

const { crear, actualizar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()
const { proveedores, tiposProducto, cargarProveedores, cargarTiposProducto } = useCatalogosCompras()

const formularioVacio = (): FormularioContrato => ({
  proveedor_id: null,
  tipo_producto_id: null,
  estado_contrato_id: ESTADOS_CONTRATO.VIGENTE,
  fecha_inicio: fechaDeHoy(),
  fecha_fin: '',
  monto: null,
})

const refFormulario = ref<VForm>()
const formulario = ref<FormularioContrato>(formularioVacio())
const errores = ref<Record<string, string>>({})
const guardando = ref(false)

const esEdicion = computed(() => props.contrato !== null)

// MODIFICADO: con if en lugar del ternario de varias líneas (ESLint no lograba acomodar su sangría)
watch(visible, estaAbierto => {
  if (!estaAbierto)
    return

  errores.value = {}

  if (!props.contrato) {
    formulario.value = formularioVacio()

    return
  }

  // Edición: datos del contrato seleccionado
  formulario.value = {
    proveedor_id: props.contrato.proveedor_id,
    tipo_producto_id: props.contrato.tipo_producto_id,
    estado_contrato_id: props.contrato.estado_contrato_id,
    fecha_inicio: props.contrato.fecha_inicio,
    fecha_fin: props.contrato.fecha_fin,
    monto: Number(props.contrato.monto),
  }
})

// Mismas reglas que el back
const reglaObligatoria = (valor: unknown) => (valor !== null && valor !== undefined && valor !== '') || 'Este campo es obligatorio.'
const reglaMonto = (valor: number | null) => Number(valor) > 0 || 'El monto debe ser mayor a 0.'

const reglaFechaFin = (valor: string) =>
  !valor || !formulario.value.fecha_inicio || valor >= formulario.value.fecha_inicio
  || 'La fecha de finalización no puede ser anterior a la de inicio.'

const guardar = async () => {
  const { valid: esValido } = await refFormulario.value!.validate()

  if (!esValido)
    return

  guardando.value = true
  errores.value = {}

  try {
    const respuesta = props.contrato
      ? await actualizar<Contrato>(`/api/contratos/${props.contrato.id}`, formulario.value)
      : await crear<Contrato>('/api/contratos', formulario.value)

    exito(respuesta.message)
    visible.value = false
    emit('guardado')
  }
  catch (error) {
    errores.value = erroresPorCampo(error)
    notificarError(mensajeDeError(error))
  }
  finally {
    guardando.value = false
  }
}

onMounted(async () => {
  await Promise.all([cargarProveedores(), cargarTiposProducto()])
})
</script>

<template>
  <VDialog
    v-model="visible"
    max-width="640"
    :persistent="guardando"
  >
    <VCard :title="esEdicion ? 'Editar contrato' : 'Nuevo contrato'">
      <VForm
        ref="refFormulario"
        @submit.prevent="guardar"
      >
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppAutocomplete
                v-model="formulario.proveedor_id"
                label="Proveedor"
                placeholder="Seleccione"
                :items="proveedores"
                :rules="[reglaObligatoria]"
                :error-messages="errores.proveedor_id"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formulario.tipo_producto_id"
                label="Tipo de contrato"
                placeholder="Bien o servicio"
                :items="tiposProducto"
                :rules="[reglaObligatoria]"
                :error-messages="errores.tipo_producto_id"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formulario.estado_contrato_id"
                label="Estado"
                :items="OPCIONES_ESTADO_CONTRATO"
                :rules="[reglaObligatoria]"
                :error-messages="errores.estado_contrato_id"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <AppTextField
                v-model="formulario.fecha_inicio"
                label="Fecha de inicio"
                type="date"
                :rules="[reglaObligatoria]"
                :error-messages="errores.fecha_inicio"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <AppTextField
                v-model="formulario.fecha_fin"
                label="Fecha de finalización"
                type="date"
                :min="formulario.fecha_inicio"
                :rules="[reglaObligatoria, reglaFechaFin]"
                :error-messages="errores.fecha_fin"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <AppTextField
                v-model.number="formulario.monto"
                label="Monto (Q)"
                type="number"
                min="0"
                step="0.01"
                :rules="[reglaObligatoria, reglaMonto]"
                :error-messages="errores.monto"
              />
            </VCol>
          </VRow>
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
            type="submit"
            :loading="guardando"
          >
            {{ esEdicion ? 'Guardar cambios' : 'Registrar contrato' }}
          </VBtn>
        </VCardText>
      </VForm>
    </VCard>
  </VDialog>
</template>
