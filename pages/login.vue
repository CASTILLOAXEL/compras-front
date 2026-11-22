<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'

// Página de invitado (si ya hay sesión, redirige al inicio) y sin menú
definePageMeta({
  layout: 'blank',
  sanctum: { guestOnly: true },
})

useHead({ title: 'Iniciar sesión' })

const { login } = useSanctumAuth()

const refFormulario = ref<VForm>()
const formulario = ref({ correo: '', password: '' })
const mostrarPassword = ref(false)
const cargando = ref(false)
const mensajeError = ref('')

const reglaObligatoria = (valor: string) => !!valor || 'Este campo es obligatorio.'
const reglaCorreo = (valor: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) || 'Ingrese un correo válido.'

const iniciarSesion = async () => {
  const { valid: esValido } = await refFormulario.value!.validate()

  if (!esValido)
    return

  cargando.value = true
  mensajeError.value = ''

  try {
    // Envía { correo, password } a POST api/auth/login; el módulo guarda el token y redirige
    await login(formulario.value)
  }
  catch (error: any) {
    mensajeError.value = error?.data?.message ?? 'No se pudo iniciar sesión, intente de nuevo.'
  }
  finally {
    cargando.value = false
  }
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <!-- Panel institucional siempre claro (los logos están hechos para fondo blanco) -->
    <VCol
      md="7"
      lg="8"
      class="d-none d-md-flex"
    >
      <div class="panel-institucional w-100 ma-6 d-flex flex-column align-center justify-center text-center">
        <img
          src="/images/guayacan/logo-60-aniversario.png"
          alt="60 aniversario de Guayacán"
          class="panel-institucional__logo mb-6"
        >
        <h4 class="text-h4 panel-institucional__titulo mb-2">
          Sistema de Compras y Contrataciones
        </h4>
        <p class="text-body-1 panel-institucional__texto mb-0">
          Solicitudes, proveedores y aprobaciones en un solo lugar.
        </p>
      </div>
    </VCol>

    <!-- Formulario -->
    <VCol
      cols="12"
      md="5"
      lg="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="440"
        class="mt-12 mt-sm-0 pa-4 w-100"
      >
        <VCardText class="text-center">
          <!-- Logo institucional en SVG -->
          <img
            src="/guayacan_logo.svg"
            alt="Cooperativa Guayacán"
            class="logo-formulario mb-8"
          >
          <h4 class="text-h4 mb-1">
            ¡Bienvenido!
          </h4>
          <p class="mb-0">
            Inicie sesión con su correo y contraseña.
          </p>
        </VCardText>

        <VCardText>
          <VAlert
            v-if="mensajeError"
            type="error"
            variant="tonal"
            class="mb-6"
          >
            {{ mensajeError }}
          </VAlert>

          <VForm
            ref="refFormulario"
            @submit.prevent="iniciarSesion"
          >
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="formulario.correo"
                  label="Correo"
                  type="email"
                  placeholder="usuario@compras.test"
                  autofocus
                  :rules="[reglaObligatoria, reglaCorreo]"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="formulario.password"
                  label="Contraseña"
                  placeholder="············"
                  autocomplete="current-password"
                  :type="mostrarPassword ? 'text' : 'password'"
                  :append-inner-icon="mostrarPassword ? 'tabler-eye-off' : 'tabler-eye'"
                  :rules="[reglaObligatoria]"
                  @click:append-inner="mostrarPassword = !mostrarPassword"
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  size="large"
                  type="submit"
                  :loading="cargando"
                >
                  Iniciar sesión
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

// Panel siempre claro, con un degradado suave en verde y azul de Guayacán
.panel-institucional {
  border-radius: 24px;
  background: linear-gradient(160deg, #eef7ec 0%, #fff 55%, #e8edf8 100%);
  padding-block: 48px;
  padding-inline: 48px;

  &__logo {
    inline-size: 260px;
  }

  &__titulo {
    color: #1b2a5c;
    font-weight: 600;
  }

  &__texto {
    color: #4b5675;
  }
}

.logo-formulario {
  display: block;
  inline-size: 190px;
  margin-inline: auto;
}
</style>
