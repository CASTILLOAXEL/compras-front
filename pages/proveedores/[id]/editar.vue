<script setup lang="ts">
import type { FormularioProveedor, Proveedor } from '@/types/proveedor'

useHead({ title: 'Editar proveedor' })

const ruta = useRoute('proveedores-id-editar')
const proveedorId = Number(ruta.params.id)

const { obtener, actualizar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()

const formulario = ref<FormularioProveedor | null>(null)
const errores = ref<Record<string, string>>({})
const guardando = ref(false)

const cargarProveedor = async () => {
  try {
    const respuesta = await obtener<Proveedor>(`/api/proveedores/${proveedorId}`)

    formulario.value = formularioDesdeProveedor(respuesta.data)
  }
  catch (error) {
    notificarError(mensajeDeError(error))
    await navigateTo('/proveedores')
  }
}

const guardar = async () => {
  if (!formulario.value)
    return

  guardando.value = true
  errores.value = {}

  try {
    const respuesta = await actualizar<Proveedor>(`/api/proveedores/${proveedorId}`, formulario.value)

    exito(respuesta.message)
    await navigateTo('/proveedores')
  }
  catch (error) {
    errores.value = erroresPorCampo(error)
    notificarError(mensajeDeError(error))
  }
  finally {
    guardando.value = false
  }
}

onMounted(cargarProveedor)
</script>

<template>
  <div>
    <h4 class="text-h4 mb-6">
      Editar proveedor
    </h4>

    <!-- El formulario se muestra cuando ya llegaron los datos, para cargar bien los combos -->
    <FormularioProveedor
      v-if="formulario"
      v-model="formulario"
      :errores="errores"
      :cargando="guardando"
      texto-boton="Guardar cambios"
      @guardar="guardar"
    />

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
