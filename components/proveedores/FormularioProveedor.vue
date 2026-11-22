<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import type { FormularioProveedor } from '@/types/proveedor'

interface Props {
  errores?: Record<string, string>
  cargando?: boolean
  textoBoton?: string
}

withDefaults(defineProps<Props>(), {
  errores: () => ({}),
  cargando: false,
  textoBoton: 'Guardar',
})

const emit = defineEmits<{ guardar: [] }>()

const formulario = defineModel<FormularioProveedor>({ required: true })

const { departamentos, municipios, aldeas, cargarDepartamentos, cargarMunicipios, cargarAldeas } = useUbicacion()

const refFormulario = ref<VForm>()

// Mismas reglas que el back, para avisar antes de enviar
const reglaObligatoria = (valor: unknown) => (valor !== null && valor !== undefined && valor !== '') || 'Este campo es obligatorio.'
const reglaNit = (valor: string) => /^\d+-?[\dK]$/i.test(valor) || 'Solo números y dígito verificador (ej. 1234567-8).'
const reglaDpi = (valor: string | null) => !valor || /^\d{13}$/.test(valor) || 'El DPI debe tener 13 dígitos.'
const reglaTelefono = (valor: string) => /^\d{8}$/.test(valor) || 'El teléfono debe tener 8 dígitos.'
const reglaCorreo = (valor: string) => /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(valor) || 'Ingrese un correo válido.'

// Al cambiar el departamento se limpian municipio y aldea, y se cargan los municipios nuevos
const alCambiarDepartamento = async (departamentoId: number | null) => {
  formulario.value.direccion.municipio_id = null
  formulario.value.direccion.aldea_id = null
  municipios.value = []
  aldeas.value = []

  if (departamentoId)
    await cargarMunicipios(departamentoId)
}

const alCambiarMunicipio = async (municipioId: number | null) => {
  formulario.value.direccion.aldea_id = null
  aldeas.value = []

  if (municipioId)
    await cargarAldeas(municipioId)
}

const enviarFormulario = async () => {
  const { valid: esValido } = await refFormulario.value!.validate()

  if (esValido)
    emit('guardar')
}

// Al editar, se cargan los combos con la ubicación que ya tiene el proveedor
onMounted(async () => {
  await cargarDepartamentos()

  const { departamento_id: departamentoId, municipio_id: municipioId } = formulario.value.direccion

  if (departamentoId)
    await cargarMunicipios(departamentoId)

  if (municipioId)
    await cargarAldeas(municipioId)
})
</script>

<template>
  <VForm
    ref="refFormulario"
    @submit.prevent="enviarFormulario"
  >
    <!-- Datos generales -->
    <VCard class="mb-6">
      <VCardItem>
        <VCardTitle>Datos del proveedor</VCardTitle>
      </VCardItem>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="formulario.razon_social"
              label="Nombre o razón social"
              placeholder="Distribuidora El Progreso, S.A."
              :rules="[reglaObligatoria]"
              :error-messages="errores.razon_social"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="formulario.nit"
              label="NIT"
              placeholder="1234567-8"
              :rules="[reglaObligatoria, reglaNit]"
              :error-messages="errores.nit"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="formulario.dpi"
              label="DPI (opcional)"
              placeholder="13 dígitos"
              :rules="[reglaDpi]"
              :error-messages="errores.dpi"
            />
          </VCol>
          <VCol cols="12">
            <VSwitch
              v-model="formulario.estado"
              color="success"
              :label="formulario.estado ? 'Proveedor activo' : 'Proveedor inactivo'"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Contacto -->
    <VCard class="mb-6">
      <VCardItem>
        <VCardTitle>Contacto</VCardTitle>
      </VCardItem>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="formulario.persona_contacto"
              label="Persona de contacto"
              placeholder="Carlos Pérez"
              :rules="[reglaObligatoria]"
              :error-messages="errores.persona_contacto"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="formulario.telefono"
              label="Teléfono"
              placeholder="55551234"
              :rules="[reglaObligatoria, reglaTelefono]"
              :error-messages="errores.telefono"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="formulario.correo"
              label="Correo electrónico"
              type="email"
              placeholder="ventas@proveedor.com"
              :rules="[reglaObligatoria, reglaCorreo]"
              :error-messages="errores.correo"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Dirección -->
    <VCard class="mb-6">
      <VCardItem>
        <VCardTitle>Dirección</VCardTitle>
      </VCardItem>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="formulario.direccion.departamento_id"
              label="Departamento"
              placeholder="Seleccione"
              :items="departamentos"
              item-title="nombre"
              item-value="id"
              :rules="[reglaObligatoria]"
              @update:model-value="alCambiarDepartamento"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppAutocomplete
              v-model="formulario.direccion.municipio_id"
              label="Municipio"
              placeholder="Seleccione"
              :items="municipios"
              item-title="nombre"
              item-value="id"
              :disabled="!formulario.direccion.departamento_id"
              :rules="[reglaObligatoria]"
              :error-messages="errores['direccion.municipio_id']"
              @update:model-value="alCambiarMunicipio"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppAutocomplete
              v-model="formulario.direccion.aldea_id"
              label="Aldea (opcional)"
              placeholder="Zona urbana"
              :items="aldeas"
              item-title="nombre"
              item-value="id"
              clearable
              :disabled="!formulario.direccion.municipio_id"
              :error-messages="errores['direccion.aldea_id']"
            />
          </VCol>
          <VCol cols="12">
            <AppTextField
              v-model="formulario.direccion.detalle"
              label="Dirección"
              placeholder="3a. calle 4-25 zona 1"
              :rules="[reglaObligatoria]"
              :error-messages="errores['direccion.detalle']"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <div class="d-flex justify-end gap-4">
      <VBtn
        variant="tonal"
        color="secondary"
        to="/proveedores"
      >
        Cancelar
      </VBtn>
      <VBtn
        type="submit"
        :loading="cargando"
      >
        {{ textoBoton }}
      </VBtn>
    </div>
  </VForm>
</template>
