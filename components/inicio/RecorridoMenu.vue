<script setup lang="ts">
const { iniciarRecorrido, recorridoYaVisto } = useRecorridoMenu()

onMounted(() => {
  if (!recorridoYaVisto())
    setTimeout(iniciarRecorrido, 800)
})
</script>

<template>
  <div class="d-flex justify-center mt-5">
    <VBtn
      color="primary"
      prepend-icon="tabler-route"
      @click="iniciarRecorrido"
    >
      Recorrer el menú
    </VBtn>
  </div>
</template>
