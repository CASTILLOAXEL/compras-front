<script setup lang="ts">
const { notificacion } = useNotificacion()
</script>

<template>
  <VSnackbar
    v-model="notificacion.visible"
    :color="notificacion.color"
    location="top end"
    :timeout="4000"
  >
    {{ notificacion.mensaje }}

    <template #actions>
      <VBtn
        icon="tabler-x"
        variant="text"
        size="small"
        @click="notificacion.visible = false"
      />
    </template>
  </VSnackbar>
</template>
