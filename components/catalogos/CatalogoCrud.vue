<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import type { CampoCatalogo, RegistroCatalogo } from '@/types/catalogo'

interface Props {
  titulo: string
  tituloSingular: string
  descripcion: string
  ruta: string
  sujeto: string
  permiso: string
  campos: CampoCatalogo[]
}

const props = defineProps<Props>()

const { crear, actualizar, eliminar } = useClienteApi()
const { exito, error: notificarError } = useNotificacion()

// Listado con filtros
const filtros = ref({
  nombre: '',
  estado: null as boolean | null,
})

const {
  registros,
  totalRegistros,
  cargando,
  opciones,
  cargar,
  alCambiarOpciones,
} = useTablaPaginada<RegistroCatalogo>(props.ruta, filtros)

const opcionesEstado = [
  { title: 'Activos', value: true },
  { title: 'Inactivos', value: false },
]

// Las columnas salen de los campos; se ordena por nombre
const encabezados = computed(() => [
  ...props.campos.map(campo => ({ title: campo.etiqueta, key: campo.clave, sortable: campo.clave === 'nombre' })),
  { title: 'Estado', key: 'estado', sortable: false },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' as const },
])

// En los campos de selección, la tabla muestra el texto de la opción y no el id
const camposSeleccion = computed(() => props.campos.filter(campo => campo.tipo === 'seleccion'))

const textoDeOpcion = (campo: CampoCatalogo, valor: unknown) =>
  campo.opciones?.find(opcion => opcion.value === valor)?.title ?? ''

// Formulario en diálogo: el mismo para agregar y editar
type Regla = (valor: unknown) => true | string

const refFormulario = ref<VForm>()
const mostrarDialogo = ref(false)
const registroEnEdicionId = ref<number | null>(null)
const formulario = ref<Record<string, unknown>>({})
const errores = ref<Record<string, string>>({})
const guardando = ref(false)

const abrirFormulario = (registro?: RegistroCatalogo) => {
  const valores: Record<string, unknown> = { estado: registro?.estado ?? true }

  // MODIFICADO: sin paréntesis en el parámetro (regla arrow-parens)
  props.campos.forEach(campo => {
    valores[campo.clave] = registro?.[campo.clave] ?? null
  })

  formulario.value = valores
  registroEnEdicionId.value = registro?.id ?? null
  errores.value = {}
  mostrarDialogo.value = true
}

// NUEVO: el botón Agregar abre el formulario vacío (sin recibir el evento del clic)
const abrirNuevo = () => abrirFormulario()

const reglasDelCampo = (campo: CampoCatalogo): Regla[] => {
  const reglas: Regla[] = []
  const longitudMaxima = campo.longitudMaxima

  if (campo.obligatorio)
    reglas.push(valor => (valor !== null && valor !== undefined && valor !== '') || 'Este campo es obligatorio.')

  if (longitudMaxima)
    reglas.push(valor => String(valor ?? '').length <= longitudMaxima || `Máximo ${longitudMaxima} caracteres.`)

  return reglas
}

const guardar = async () => {
  const { valid: esValido } = await refFormulario.value!.validate()

  if (!esValido)
    return

  guardando.value = true
  errores.value = {}

  try {
    const respuesta = registroEnEdicionId.value
      ? await actualizar(`${props.ruta}/${registroEnEdicionId.value}`, formulario.value)
      : await crear(props.ruta, formulario.value)

    exito(respuesta.message)
    mostrarDialogo.value = false
    await cargar()
  }
  catch (error) {
    errores.value = erroresPorCampo(error)
    notificarError(mensajeDeError(error))
  }
  finally {
    guardando.value = false
  }
}

// Eliminar con confirmación
const registroAEliminar = ref<RegistroCatalogo | null>(null)
const mostrarConfirmacion = ref(false)
const eliminando = ref(false)

const confirmarEliminacion = (registro: RegistroCatalogo) => {
  registroAEliminar.value = registro
  mostrarConfirmacion.value = true
}

const eliminarRegistro = async () => {
  if (!registroAEliminar.value)
    return

  eliminando.value = true

  try {
    const respuesta = await eliminar(`${props.ruta}/${registroAEliminar.value.id}`)

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
          {{ titulo }}
        </h4>
        <p class="mb-0">
          {{ descripcion }}
        </p>
      </div>

      <!-- MODIFICADO: llama a abrirNuevo, sin paréntesis (regla v-on-function-call) -->
      <VBtn
        v-if="$can(`crear ${permiso}`, sujeto)"
        prepend-icon="tabler-plus"
        @click="abrirNuevo"
      >
        Agregar {{ tituloSingular }}
      </VBtn>
    </div>

    <VCard>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="8"
          >
            <AppTextField
              v-model="filtros.nombre"
              placeholder="Buscar por nombre"
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
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
        :items="registros"
        :items-length="totalRegistros"
        :items-per-page="opciones.itemsPerPage"
        :page="opciones.page"
        :loading="cargando"
        loading-text="Cargando..."
        @update:options="alCambiarOpciones"
      >
        <template
          v-for="campo in camposSeleccion"
          :key="campo.clave"
          #[`item.${campo.clave}`]="{ item }"
        >
          {{ textoDeOpcion(campo, item[campo.clave]) }}
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
              v-if="$can(`editar ${permiso}`, sujeto)"
              @click="abrirFormulario(item)"
            >
              <VIcon icon="tabler-pencil" />
              <VTooltip activator="parent">
                Editar
              </VTooltip>
            </IconBtn>
            <IconBtn
              v-if="$can(`eliminar ${permiso}`, sujeto)"
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
              No hay registros que mostrar.
            </p>
          </div>
        </template>
      </VDataTableServer>
    </VCard>

    <!-- Agregar o editar -->
    <VDialog
      v-model="mostrarDialogo"
      max-width="560"
      :persistent="guardando"
    >
      <VCard :title="registroEnEdicionId ? `Editar ${tituloSingular}` : `Agregar ${tituloSingular}`">
        <VForm
          ref="refFormulario"
          @submit.prevent="guardar"
        >
          <VCardText>
            <VRow>
              <VCol
                v-for="campo in campos"
                :key="campo.clave"
                cols="12"
              >
                <AppSelect
                  v-if="campo.tipo === 'seleccion'"
                  v-model="formulario[campo.clave]"
                  :label="campo.etiqueta"
                  placeholder="Seleccione"
                  :items="campo.opciones ?? []"
                  :rules="reglasDelCampo(campo)"
                  :error-messages="errores[campo.clave]"
                />
                <AppTextField
                  v-else
                  v-model="formulario[campo.clave]"
                  :label="campo.etiqueta"
                  :placeholder="campo.placeholder"
                  :rules="reglasDelCampo(campo)"
                  :error-messages="errores[campo.clave]"
                />
              </VCol>
              <VCol cols="12">
                <VSwitch
                  v-model="formulario.estado"
                  color="success"
                  :label="formulario.estado ? 'Activo' : 'Inactivo'"
                />
              </VCol>
            </VRow>
          </VCardText>

          <VCardText class="d-flex justify-end gap-4">
            <VBtn
              variant="tonal"
              color="secondary"
              :disabled="guardando"
              @click="mostrarDialogo = false"
            >
              Cancelar
            </VBtn>
            <VBtn
              type="submit"
              :loading="guardando"
            >
              Guardar
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VDialog>

    <DialogoConfirmacion
      v-model="mostrarConfirmacion"
      :titulo="`¿Eliminar ${tituloSingular}?`"
      :mensaje="`Se eliminará ${registroAEliminar?.nombre}. Los registros que ya lo usan lo seguirán mostrando.`"
      texto-confirmar="Sí, eliminar"
      :cargando="eliminando"
      @confirmar="eliminarRegistro"
    />
  </div>
</template>
