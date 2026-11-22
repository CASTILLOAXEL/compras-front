type ColorNotificacion = 'success' | 'error' | 'warning' | 'info'

interface Notificacion {
  visible: boolean
  mensaje: string
  color: ColorNotificacion
}

/**
 * Mensajes emergentes de todo el sistema. El estado es global (useState),
 * así cualquier pantalla puede mostrar uno y NotificacionGlobal lo dibuja.
 */
export const useNotificacion = () => {
  const notificacion = useState<Notificacion>('notificacion', () => ({
    visible: false,
    mensaje: '',
    color: 'success',
  }))

  const mostrar = (mensaje: string, color: ColorNotificacion) => {
    notificacion.value = { visible: true, mensaje, color }
  }

  return {
    notificacion,
    exito: (mensaje: string) => mostrar(mensaje, 'success'),
    error: (mensaje: string) => mostrar(mensaje, 'error'),
    advertencia: (mensaje: string) => mostrar(mensaje, 'warning'),
  }
}
