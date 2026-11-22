<script setup lang="ts">
import IndicadoresInicio from '@/components/inicio/IndicadoresInicio.vue'

interface UsuarioSesion {
  primer_nombre: string
  roles: string[]
}

useHead({ title: 'Inicio' })

const usuario = useSanctumUser<UsuarioSesion>()
</script>

<template>
  <VCard class="tarjeta-bienvenida overflow-visible mt-16">
    <div class="d-flex align-end justify-space-between">
      <img
        src="/images/guayacan/mascota.png"
        alt="Mascota de Guayacán"
        class="tarjeta-bienvenida__mascota d-none d-md-block"
      >

      <!-- Saludo al centro -->
      <VCardText class="text-center pa-8 flex-grow-1 align-self-center">
        <h4 class="text-h4 mb-2">
          ¡Hola, {{ usuario?.primer_nombre }}!
        </h4>
        <p class="text-body-1 mb-4">
          Bienvenido al Sistema de Compras y Contrataciones de la Cooperativa Guayacán.
          <br>
          Desde el menú puede gestionar proveedores y solicitudes de compra.
        </p>
        <VChip
          v-for="rol in usuario?.roles"
          :key="rol"
          color="primary"
          variant="tonal"
          class="mx-1"
        >
          {{ rol }}
        </VChip>
      </VCardText>

      <img
        src="/images/guayacan/cooper.png"
        alt="Cooper, mascota de Guayacán"
        class="tarjeta-bienvenida__cooper d-none d-md-block"
      >
    </div>
  </VCard>
  <IndicadoresInicio class="mt-6" />
</template>

<style lang="scss" scoped>
.tarjeta-bienvenida {
  background: linear-gradient(90deg,
    rgba(var(--v-theme-primary), 0.12) 0%,
    rgb(var(--v-theme-surface)) 35%,
    rgb(var(--v-theme-surface)) 65%,
    rgba(var(--v-theme-primary), 0.12) 100%);
}

.tarjeta-bienvenida__mascota {
  block-size: 240px;
  margin-block-start: -70px;
  margin-inline-start: 24px;
}

.tarjeta-bienvenida__cooper {
  block-size: 170px;
  margin-inline-end: 24px;
}
</style>
