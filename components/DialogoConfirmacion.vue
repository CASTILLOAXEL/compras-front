<script setup lang="ts">
interface Props {
  titulo?: string
  mensaje: string
  textoConfirmar?: string
  color?: string
  cargando?: boolean
}

withDefaults(defineProps<Props>(), {
  titulo: 'Confirmar',
  textoConfirmar: 'Sí, continuar',
  color: 'error',
  cargando: false,
})

const emit = defineEmits<{ confirmar: [] }>()

const visible = defineModel<boolean>({ required: true })
</script>

<template>
  <VDialog
    v-model="visible"
    max-width="460"
    :persistent="cargando"
  >
    <VCard class="text-center pa-6">
      <VIcon
        icon="tabler-alert-circle"
        :color="color"
        size="64"
        class="mx-auto mb-4"
      />
      <h5 class="text-h5 mb-2">
        {{ titulo }}
      </h5>
      <p class="text-body-1 mb-6">
        {{ mensaje }}
      </p>

      <div class="d-flex justify-center gap-4">
        <VBtn
          variant="tonal"
          color="secondary"
          :disabled="cargando"
          @click="visible = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          :color="color"
          :loading="cargando"
          @click="emit('confirmar')"
        >
          {{ textoConfirmar }}
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>
