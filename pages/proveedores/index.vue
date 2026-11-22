<script setup lang="ts">
import type { Proveedor } from '@/types/proveedor'

useHead({ title: 'Proveedores' })

const { eliminar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()

const filtros = ref({
  razon_social: '',
  nit: '',
  estado: null as boolean | null,
})

const {
  registros: proveedores,
  totalRegistros,
  cargando,
  opciones,
  cargar,
  alCambiarOpciones,
} = useTablaPaginada<Proveedor>('/api/proveedores', filtros)

const opcionesEstado = [
  { title: 'Activos', value: true },
  { title: 'Inactivos', value: false },
]

// Solo se pueden ordenar las columnas que el back permite (allowedSorts)
const encabezados = [
  { title: 'Razón social', key: 'razon_social' },
  { title: 'NIT', key: 'nit' },
  { title: 'Contacto', key: 'persona_contacto' },
  { title: 'Teléfono', key: 'telefono', sortable: false },
  { title: 'Correo', key: 'correo' },
  { title: 'Ubicación', key: 'ubicacion', sortable: false },
  { title: 'Estado', key: 'estado' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' as const },
]

const ubicacion = (proveedor: Proveedor) => {
  const municipio = proveedor.direccion?.municipio

  return municipio ? `${municipio.nombre}, ${municipio.departamento?.nombre ?? ''}` : ''
}

// Eliminar con confirmación
const proveedorAEliminar = ref<Proveedor | null>(null)
const mostrarConfirmacion = ref(false)
const eliminando = ref(false)

const confirmarEliminacion = (proveedor: Proveedor) => {
  proveedorAEliminar.value = proveedor
  mostrarConfirmacion.value = true
}

const eliminarProveedor = async () => {
  if (!proveedorAEliminar.value)
    return

  eliminando.value = true

  try {
    const respuesta = await eliminar(`/api/proveedores/${proveedorAEliminar.value.id}`)

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
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between align-center gap-4 mb-6">
      <div>
        <h4 class="text-h4 mb-1">
          Proveedores
        </h4>
        <p class="mb-0">
          Empresas y personas a las que la cooperativa compra bienes y servicios.
        </p>
      </div>

      <VBtn
        v-if="$can('crear proveedores', 'Proveedor')"
        prepend-icon="tabler-plus"
        to="/proveedores/crear"
      >
        Nuevo proveedor
      </VBtn>
    </div>

    <VCard>
      <!-- Filtros: la tabla se actualiza sola 0.4 s después de escribir -->
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="5"
          >
            <AppTextField
              v-model="filtros.razon_social"
              placeholder="Buscar por razón social"
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="filtros.nit"
              placeholder="Buscar por NIT"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="filtros.estado"
              placeholder="Todos los estados"
              :items="opcionesEstado"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VDataTableServer
        :headers="encabezados"
        :items="proveedores"
        :items-length="totalRegistros"
        :items-per-page="opciones.itemsPerPage"
        :page="opciones.page"
        :loading="cargando"
        loading-text="Cargando proveedores..."
        @update:options="alCambiarOpciones"
      >
        <template #item.razon_social="{ item }">
          <span class="font-weight-medium text-high-emphasis">{{ item.razon_social }}</span>
        </template>

        <template #item.ubicacion="{ item }">
          {{ ubicacion(item) }}
        </template>

        <template #item.estado="{ item }">
          <VChip
            :color="item.estado ? 'success' : 'secondary'"
            size="small"
            label
          >
            {{ item.estado ? 'Activo' : 'Inactivo' }}
          </VChip>
        </template>

        <template #item.acciones="{ item }">
          <div class="d-flex justify-center gap-1">
            <IconBtn
              v-if="$can('editar proveedores', 'Proveedor')"
              :to="`/proveedores/${item.id}/editar`"
            >
              <VIcon icon="tabler-pencil" />
              <VTooltip activator="parent">
                Editar
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="$can('eliminar proveedores', 'Proveedor')"
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

        <!-- Sin resultados: Cooper avisa -->
        <template #no-data>
          <div class="py-8 text-center">
            <img
              src="/images/guayacan/cooper.png"
              alt="Cooper"
              style="block-size: 110px;"
            >
            <p class="mt-4 mb-0">
              No hay proveedores que mostrar.
            </p>
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <DialogoConfirmacion
      v-model="mostrarConfirmacion"
      titulo="¿Eliminar proveedor?"
      :mensaje="`Se eliminará a ${proveedorAEliminar?.razon_social}. Esta acción no se puede deshacer desde el sistema.`"
      texto-confirmar="Sí, eliminar"
      :cargando="eliminando"
      @confirmar="eliminarProveedor"
    />
  </div>
</template>
