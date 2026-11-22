<script setup lang="ts">
import type { Proveedor } from '@/types/proveedor'

useHead({ title: 'Nuevo proveedor' })

const { crear } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()

const formulario = ref(formularioProveedorVacio())
const errores = ref<Record<string, string>>({})
const guardando = ref(false)

const guardar = async () => {
  guardando.value = true
  errores.value = {}

  try {
    const respuesta = await crear<Proveedor>('/api/proveedores', formulario.value)

    exito(respuesta.message)
    await navigateTo('/proveedores')
  }
  catch (error) {
    // 422: los mensajes del back aparecen debajo de cada campo
    errores.value = erroresPorCampo(error)
    notificarError(mensajeDeError(error))
  }
  finally {
    guardando.value = false
  }
}
</script>

<template>
  <div>
    <h4 class="text-h4 mb-6">
      Nuevo proveedor
    </h4>

    <FormularioProveedor
      v-model="formulario"
      :errores="errores"
      :cargando="guardando"
      texto-boton="Crear proveedor"
      @guardar="guardar"
    />
  </div>
</template>
