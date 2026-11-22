import { useAbility } from '@casl/vue'
import { driver } from 'driver.js'
import type { DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'

type Mascota = 'cooper' | 'nino'

interface PasoRecorrido {
  ruta?: string // opción del menú que se ilumina; sin ruta, el globo sale al centro
  titulo: string
  texto: string
  mascota: Mascota
  accion?: string // permiso necesario para ver el paso
  sujeto?: string
}

const IMAGENES_MASCOTAS: Record<Mascota, string> = {
  cooper: '/images/guayacan/cooper.png',
  nino: '/images/guayacan/mascota.png',
}

const CLAVE_RECORRIDO_VISTO = 'compras:recorrido-menu-visto'

// Las mascotas se turnan para explicar cada opción del menú
const PASOS: PasoRecorrido[] = [
  {
    titulo: '¡Bienvenido!',
    texto: 'Este es el Sistema de Compras de la Cooperativa Guayacán. Con Cooper te mostramos para qué sirve cada opción del menú.',
    mascota: 'nino',
  },
  {
    ruta: '/',
    titulo: 'Inicio',
    texto: '¡Guau! Aquí ves el resumen: tus solicitudes por estado y los indicadores de compras.',
    mascota: 'cooper',
  },
  {
    ruta: '/solicitudes',
    titulo: 'Solicitudes',
    texto: 'Aquí pides lo que tu área necesita: creas la solicitud, le agregas los ítems y la envías a aprobación.',
    mascota: 'nino',
    accion: 'ver solicitudes',
    sujeto: 'Solicitud',
  },
  {
    ruta: '/ordenes',
    titulo: 'Órdenes de compra',
    texto: 'Cuando una solicitud se aprueba, genera su orden. Aquí registras lo que entrega el proveedor, aunque llegue por partes.',
    mascota: 'cooper',
    accion: 'ver ordenes',
    sujeto: 'Orden',
  },
  {
    ruta: '/proveedores',
    titulo: 'Proveedores',
    texto: 'Las empresas y personas a las que compramos, con su NIT, contacto y dirección.',
    mascota: 'nino',
    accion: 'ver proveedores',
    sujeto: 'Proveedor',
  },
  {
    ruta: '/contratos',
    titulo: 'Contratos',
    texto: 'Los contratos de bienes o servicios con cada proveedor, con su vigencia y su monto.',
    mascota: 'cooper',
    accion: 'ver contratos',
    sujeto: 'Contrato',
  },
  {
    ruta: '/reportes/ordenes',
    titulo: 'Reportes',
    texto: 'Las órdenes agrupadas por proveedor y estado, para el control administrativo. ¡También lo puedes imprimir!',
    mascota: 'nino',
    accion: 'ver ordenes',
    sujeto: 'Orden',
  },
  {
    ruta: '/catalogos/centros-costo',
    titulo: 'Catálogos',
    texto: 'Centros de costo, productos, tipos y unidades de medida: los datos que usan los formularios.',
    mascota: 'cooper',
    accion: 'ver centro costos',
    sujeto: 'CentroCosto',
  },
  {
    titulo: '¡Listo!',
    texto: 'Ya conoces el menú. Si quieres repetir el recorrido, usa el botón «Recorrer el menú» del inicio. ¡Guau!',
    mascota: 'cooper',
  },
]

/**
 * Recorrido guiado por el menú, explicado por las mascotas de la cooperativa.
 */
export const useRecorridoMenu = () => {
  const permisos = useAbility()

  // El globo lleva la imagen de la mascota y su texto (contenido fijo, no viene del usuario)
  const contenidoDelGlobo = (paso: PasoRecorrido) =>
    `<div class="recorrido-mascota"><img src="${IMAGENES_MASCOTAS[paso.mascota]}" alt=""><p>${paso.texto}</p></div>`

  // Solo se ilumina la opción si está visible; si no (menú cerrado o pantalla chica), el globo sale al centro
  const selectorVisible = (ruta?: string) => {
    if (!ruta)
      return undefined

    const selector = `.layout-vertical-nav a[href="${ruta}"]`
    const elemento = document.querySelector<HTMLElement>(selector)

    return elemento?.offsetParent ? selector : undefined
  }

  const marcarComoVisto = () => {
    try {
      localStorage.setItem(CLAVE_RECORRIDO_VISTO, 'si')
    }
    catch {
      // Si el navegador bloquea el almacenamiento, el recorrido simplemente se volverá a ofrecer
    }
  }

  const recorridoYaVisto = () => {
    try {
      return localStorage.getItem(CLAVE_RECORRIDO_VISTO) === 'si'
    }
    catch {
      return true
    }
  }

  const iniciarRecorrido = () => {
    const pasos: DriveStep[] = PASOS
      .filter(paso => !paso.accion || permisos.can(paso.accion, paso.sujeto ?? ''))
      .map(paso => ({
        element: selectorVisible(paso.ruta),
        popover: {
          title: paso.titulo,
          description: contenidoDelGlobo(paso),
          side: 'right',
          align: 'start',
        },
      }))

    driver({
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Terminar',
      popoverClass: 'recorrido-guayacan',
      steps: pasos,
      onDestroyed: marcarComoVisto,
    }).drive()
  }

  return { iniciarRecorrido, recorridoYaVisto }
}
