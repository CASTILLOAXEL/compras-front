import { abilitiesPlugin } from '@casl/vue'
import { crearPermisos } from './ability'
import type { ReglaPermiso } from './ability'

interface UsuarioConPermisos {
  roles: string[]
  abilityRules: ReglaPermiso[]
}

const ROL_SUPER_ADMINISTRADOR = 'Super Administrador'

/**
 * Carga en CASL los permisos del usuario que devuelve GET /api/user.
 * El Super Administrador puede todo, igual que en el back.
 */
export default defineNuxtPlugin(nuxtApp => {
  const permisos = crearPermisos()
  const usuario = useSanctumUser<UsuarioConPermisos>()

  watch(usuario, usuarioActual => {
    const esSuperAdministrador = usuarioActual?.roles?.includes(ROL_SUPER_ADMINISTRADOR) ?? false

    permisos.update(esSuperAdministrador
      ? [{ action: 'manage', subject: 'all' }]
      : (usuarioActual?.abilityRules ?? []))
  }, { immediate: true, deep: true })

  nuxtApp.vueApp.use(abilitiesPlugin, permisos, { useGlobalProperties: true })
})
