<script setup lang="ts">
import type { Contrato } from '@/types/contrato'
import DialogoContrato from '@/components/contratos/DialogoContrato.vue'

useHead({ title: 'Contratos' })

const { eliminar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()
const { proveedores, tiposProducto, cargarProveedores, cargarTiposProducto } = useCatalogosCompras()

const filtros = ref({
  proveedor_id: null as number | null,
  tipo_producto_id: null as number | null,
  estado_contrato_id: null as number | null,
})

const {
  registros: contratos,
  totalRegistros,
  cargando,
  opciones,
  cargar,
  alCambiarOpciones,
} = useTablaPaginada<Contrato>('/api/contratos', filtros)

const encabezados = [
  { title: 'Proveedor', key: 'proveedor', sortable: false },
  { title: 'Tipo', key: 'tipo_producto', sortable: false },
  { title: 'Inicio', key: 'fecha_inicio' },
  { title: 'Finalización', key: 'fecha_fin' },
  { title: 'Monto', key: 'monto', align: 'end' as const },
  { title: 'Estado', key: 'estado_contrato_id' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' as const },
]

const estaAnulado = (contrato: Contrato) => contrato.estado_contrato_id === ESTADOS_CONTRATO.ANULADO

// Crear o editar en el diálogo
const mostrarDialogo = ref(false)
const contratoEnEdicion = ref<Contrato | null>(null)

const abrirNuevoContrato = () => {
  contratoEnEdicion.value = null
  mostrarDialogo.value = true
}

const abrirEdicion = (contrato: Contrato) => {
  contratoEnEdicion.value = contrato
  mostrarDialogo.value = true
}

// Eliminar con confirmación
const contratoAEliminar = ref<Contrato | null>(null)
const mostrarConfirmacion = ref(false)
const eliminando = ref(false)

const confirmarEliminacion = (contrato: Contrato) => {
  contratoAEliminar.value = contrato
  mostrarConfirmacion.value = true
}

const eliminarContrato = async () => {
  if (!contratoAEliminar.value)
    return

  eliminando.value = true

  try {
    const respuesta = await eliminar(`/api/contratos/${contratoAEliminar.value.id}`)

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

onMounted(async () => {
  await Promise.all([cargarProveedores(), cargarTiposProducto()])
})
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center gap-4 mb-6">
      <div>
        <h4 class="text-h4 mb-1">
          Contratos con proveedores
        </h4>
        <p class="mb-0">
          Contratos de bienes y servicios con su vigencia y monto.
        </p>
      </div>

      <VBtn
        v-if="$can('crear contratos', 'Contrato')"
        prepend-icon="tabler-plus"
        @click="abrirNuevoContrato"
      >
        Nuevo contrato
      </VBtn>
    </div>

    <VCard>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppAutocomplete
              v-model="filtros.proveedor_id"
              placeholder="Todos los proveedores"
              :items="proveedores"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="filtros.tipo_producto_id"
              placeholder="Bien o servicio"
              :items="tiposProducto"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="filtros.estado_contrato_id"
              placeholder="Todos los estados"
              :items="OPCIONES_ESTADO_CONTRATO"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VDataTableServer
        :headers="encabezados"
        :items="contratos"
        :items-length="totalRegistros"
        :items-per-page="opciones.itemsPerPage"
        :page="opciones.page"
        :loading="cargando"
        loading-text="Cargando contratos..."
        @update:options="alCambiarOpciones"
      >
        <template #item.proveedor="{ item }">
          <span class="font-weight-medium text-high-emphasis">{{ item.proveedor?.razon_social }}</span>
        </template>

        <template #item.tipo_producto="{ item }">
          {{ item.tipo_producto?.nombre }}
        </template>

        <template #item.fecha_inicio="{ item }">
          {{ formatoFecha(item.fecha_inicio) }}
        </template>

        <template #item.fecha_fin="{ item }">
          {{ formatoFecha(item.fecha_fin) }}
        </template>

        <template #item.monto="{ item }">
          {{ formatoQuetzales(Number(item.monto)) }}
        </template>

        <template #item.estado_contrato_id="{ item }">
          <VChip
            :color="colorEstadoContrato(item.estado_contrato_id)"
            size="small"
            label
          >
            {{ item.estado_contrato?.nombre }}
          </VChip>
        </template>

        <template #item.acciones="{ item }">
          <div class="d-flex justify-center gap-1">
            <IconBtn
              v-if="!estaAnulado(item) && $can('editar contratos', 'Contrato')"
              @click="abrirEdicion(item)"
            >
              <VIcon icon="tabler-pencil" />
              <VTooltip activator="parent">
                Editar
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="$can('eliminar contratos', 'Contrato')"
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
              No hay contratos que mostrar.
            </p>
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <DialogoContrato
      v-model="mostrarDialogo"
      :contrato="contratoEnEdicion"
      @guardado="cargar"
    />

    <DialogoConfirmacion
      v-model="mostrarConfirmacion"
      titulo="¿Eliminar contrato?"
      :mensaje="`Se eliminará el contrato con ${contratoAEliminar?.proveedor?.razon_social}.`"
      texto-confirmar="Sí, eliminar"
      :cargando="eliminando"
      @confirmar="eliminarContrato"
    />
  </div>
</template>
