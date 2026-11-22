import type { MongoAbility } from '@casl/ability'
import type { VBtn } from 'vuetify/components'

declare module 'vue' {
  interface ComponentCustomProperties {
    $ability: MongoAbility
    $can: (accion: string, sujeto: string) => boolean
  }

  interface GlobalComponents {
    IconBtn: typeof VBtn
  }
}

export {}
