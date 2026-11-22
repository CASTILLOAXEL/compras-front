<script setup lang="ts">
import type { Solicitud } from '@/types/solicitud'
import DialogoSolicitud from '@/components/solicitudes/DialogoSolicitud.vue'

useHead({ title: 'Solicitudes' })

const { eliminar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()
const { centrosCosto, cargarCentrosCosto } = useCatalogosSolicitud()

const filtros = ref({
  numero: '',
  centro_costo_id: null as number | null,
  estado_solicitud_id: null as number | null,
})

const {
  registros: solicitudes,
  totalRegistros,
  cargando,
  opciones,
  cargar,
  alCambiarOpciones,
} = useTablaPaginada<Solicitud>('/api/solicitudes', filtros)

// Solo se ordenan las columnas que el back permite (allowedSorts)
const encabezados = [
  { title: 'Número', key: 'numero' },
  { title: 'Fecha', key: 'fecha' },
  { title: 'Centro de costo', key: 'centro_costo', sortable: false },
  { title: 'Solicitante', key: 'solicitante', sortable: false },
  { title: 'Estado', key: 'estado_solicitud_id' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' as const },
]

const esBorrador = (solicitud: Solicitud) => solicitud.estado_solicitud_id === ESTADOS_SOLICITUD.BORRADOR

// Crear o editar en el diálogo
const mostrarDialogo = ref(false)
const solicitudEnEdicion = ref<Solicitud | null>(null)

const abrirNuevaSolicitud = () => {
  solicitudEnEdicion.value = null
  mostrarDialogo.value = true
}

const abrirEdicion = (solicitud: Solicitud) => {
  solicitudEnEdicion.value = solicitud
  mostrarDialogo.value = true
}

// Al crear se abre el detalle para agregar los ítems; al editar solo se refresca la tablaconst alGuardarSolicitud = async (solicitud: Solicitud) => {
const alGuardarSolicitud = async (solicitud: Solicitud) => {
  await navigateTo(`/solicitudes/${solicitud.id}`)
}

// Eliminar con confirmación (solo en borrador)
const solicitudAEliminar = ref<Solicitud | null>(null)
const mostrarConfirmacion = ref(false)
const eliminando = ref(false)

const confirmarEliminacion = (solicitud: Solicitud) => {
  solicitudAEliminar.value = solicitud
  mostrarConfirmacion.value = true
}

const eliminarSolicitud = async () => {
  if (!solicitudAEliminar.value)
    return

  eliminando.value = true

  try {
    const respuesta = await eliminar(`/api/solicitudes/${solicitudAEliminar.value.id}`)

    exito(respuesta.message)
    mostrarConfirmacion.value = false
    await cargar()
  }
  catch (error) {
    notificarError(mensajeDeError(error))
  }
  finally {
    eliminando.value = false
  }
}

onMounted(cargarCentrosCosto)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center gap-4 mb-6">
      <div>
        <h4 class="text-h4 mb-1">
          Solicitudes de compra
        </h4>
        <p class="mb-0">
          Necesidades de compra de cada área, con sus ítems y su flujo de aprobación.
        </p>
      </div>

      <VBtn
        v-if="$can('crear solicitudes', 'Solicitud')"
        prepend-icon="tabler-plus"
        @click="abrirNuevaSolicitud"
      >
        Nueva solicitud
      </VBtn>
    </div>

    <VCard>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="filtros.numero"
              placeholder="Buscar por número"
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="filtros.centro_costo_id"
              placeholder="Todos los centros de costo"
              :items="centrosCosto"
              item-title="nombre"
              item-value="id"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="filtros.estado_solicitud_id"
              placeholder="Todos los estados"
              :items="OPCIONES_ESTADO_SOLICITUD"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VDataTableServer
        :headers="encabezados"
        :items="solicitudes"
        :items-length="totalRegistros"
        :items-per-page="opciones.itemsPerPage"
        :page="opciones.page"
        :loading="cargando"
        loading-text="Cargando solicitudes..."
        @update:options="alCambiarOpciones"
      >
        <template #item.numero="{ item }">
          <NuxtLink
            :to="`/solicitudes/${item.id}`"
            class="font-weight-medium"
          >
            {{ item.numero }}
          </NuxtLink>
        </template>

        <template #item.fecha="{ item }">
          {{ formatoFecha(item.fecha) }}
        </template>

        <template #item.centro_costo="{ item }">
          {{ item.centro_costo?.nombre }}
        </template>

        <template #item.solicitante="{ item }">
          {{ nombreUsuario(item.solicitante) }}
        </template>

        <template #item.estado_solicitud_id="{ item }">
          <VChip
            :color="colorEstadoSolicitud(item.estado_solicitud_id)"
            size="small"
            label
          >
            {{ item.estado_solicitud?.nombre }}
          </VChip>
        </template>

        <template #item.acciones="{ item }">
          <div class="d-flex justify-center gap-1">
            <IconBtn :to="`/solicitudes/${item.id}`">
              <VIcon icon="tabler-eye" />
              <VTooltip activator="parent">
                Ver detalle e ítems
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="esBorrador(item) && $can('editar solicitudes', 'Solicitud')"
              @click="abrirEdicion(item)"
            >
              <VIcon icon="tabler-pencil" />
              <VTooltip activator="parent">
                Editar
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="esBorrador(item) && $can('eliminar solicitudes', 'Solicitud')"
              @click="confirmarEliminacion(item)"
            >
              <VIcon
                icon="tabler-trash"
                color="error"
              />
              <VTooltip activator="parent">
                Eliminar
              </VTooltip>
            </IconBtn>
          </div>
        </template>

        <template #no-data>
          <div class="py-8 text-center">
            <img
              src="/images/guayacan/cooper.png"
              alt="Cooper"
              style="block-size: 110px;"
            >
            <p class="mt-4 mb-0">
              No hay solicitudes que mostrar.
            </p>
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <DialogoSolicitud
      v-model="mostrarDialogo"
      :solicitud="solicitudEnEdicion"
      @guardada="alGuardarSolicitud"
    />

    <DialogoConfirmacion
      v-model="mostrarConfirmacion"
      titulo="¿Eliminar solicitud?"
      :mensaje="`Se eliminará la solicitud ${solicitudAEliminar?.numero} con todos sus ítems.`"
      texto-confirmar="Sí, eliminar"
      :cargando="eliminando"
      @confirmar="eliminarSolicitud"
    />
  </div>
</template>
