<script setup lang="ts">
interface UsuarioSesion {
  nombre_completo: string
  correo: string
  roles: string[]
}

const { logout } = useSanctumAuth()
const usuario = useSanctumUser<UsuarioSesion>()

// "Administrador Sistema" -> "AS"
const iniciales = computed(() => (usuario.value?.nombre_completo ?? '')
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map(palabra => palabra[0])
  .join(''))

const rolPrincipal = computed(() => usuario.value?.roles?.[0] ?? '')

const cerrarSesion = async () => {
  // POST api/auth/logout: elimina el token en el back y redirige al login
  await logout()
}
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <span class="text-body-1 font-weight-medium">{{ iniciales }}</span>

      <VMenu
        activator="parent"
        width="240"
        location="bottom end"
        offset="12px"
      >
        <VList>
          <VListItem>
            <template #prepend>
              <VAvatar
                color="primary"
                variant="tonal"
                class="me-3"
              >
                <span class="text-body-1 font-weight-medium">{{ iniciales }}</span>
              </VAvatar>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ usuario?.nombre_completo }}
            </VListItemTitle>
            <VListItemSubtitle>{{ rolPrincipal }}</VListItemSubtitle>
          </VListItem>

          <VDivider class="my-2" />

          <VListItem @click="cerrarSesion">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-logout"
                size="22"
              />
            </template>

            <VListItemTitle>Cerrar sesión</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
    </VAvatar>
  </VBadge>
</template>
