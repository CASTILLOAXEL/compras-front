import { createMongoAbility } from '@casl/ability'
import type { MongoAbility } from '@casl/ability'

/**
 * Una regla = acción + sujeto, igual que los permisos del back:
 * { action: 'crear proveedores', subject: 'Proveedor' }
 */
export interface ReglaPermiso {
  action: string
  subject: string
}

export type PermisosUsuario = MongoAbility<[string, string]>

export const crearPermisos = (): PermisosUsuario => createMongoAbility<[string, string]>([])
