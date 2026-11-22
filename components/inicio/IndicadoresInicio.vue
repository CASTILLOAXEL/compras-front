<script setup lang="ts">
import type { Indicadores } from '@/types/reporte'

const { obtener } = useClienteApi()

const indicadores = ref<Indicadores | null>(null)

const ICONOS_POR_ESTADO: Record<number, string> = {
  1: 'tabler-file-pencil',
  2: 'tabler-send',
  3: 'tabler-circle-check',
  4: 'tabler-circle-x',
  5: 'tabler-checks',
}

onMounted(async () => {
  try {
    const respuesta = await obtener<Indicadores>('/api/inicio/indicadores')

    indicadores.value = respuesta.data
  }
  catch {
    // Si falla, el inicio se muestra sin indicadores
  }
})
</script>

<template>
  <div v-if="indicadores">
    <h5 class="text-h5 mb-4">
      Solicitudes por estado
    </h5>

    <VRow class="mb-4">
      <VCol
        v-for="estadoSolicitud in indicadores.solicitudes_por_estado"
        :key="estadoSolicitud.estado_solicitud_id"
        cols="12"
        sm="6"
        md
      >
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar
              :color="colorEstadoSolicitud(estadoSolicitud.estado_solicitud_id)"
              variant="tonal"
              rounded
              size="44"
            >
              <VIcon :icon="ICONOS_POR_ESTADO[estadoSolicitud.estado_solicitud_id] ?? 'tabler-file'" />
            </VAvatar>
            <div>
              <h4 class="text-h4">
                {{ estadoSolicitud.cantidad }}
              </h4>
              <span>{{ estadoSolicitud.nombre }}</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <template v-if="$can('ver ordenes', 'Orden')">
      <h5 class="text-h5 mb-4">
        Compras
      </h5>

      <VRow>
        <VCol
          cols="12"
          sm="6"
          md="3"
        >
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar
                color="info"
                variant="tonal"
                rounded
                size="44"
              >
                <VIcon icon="tabler-file-invoice" />
              </VAvatar>
              <div>
                <h4 class="text-h4">
                  {{ indicadores.ordenes_emitidas }}
                </h4>
                <span>Órdenes por recibir</span>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          sm="6"
          md="3"
        >
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar
                color="success"
                variant="tonal"
                rounded
                size="44"
              >
                <VIcon icon="tabler-cash" />
              </VAvatar>
              <div>
                <h4 class="text-h5">
                  {{ formatoQuetzales(indicadores.monto_ordenes) }}
                </h4>
                <span>Monto en órdenes</span>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          sm="6"
          md="3"
        >
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar
                color="warning"
                variant="tonal"
                rounded
                size="44"
              >
                <VIcon icon="tabler-file-certificate" />
              </VAvatar>
              <div>
                <h4 class="text-h4">
                  {{ indicadores.contratos_vigentes }}
                </h4>
                <span>Contratos vigentes</span>
              </div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          sm="6"
          md="3"
        >
          <VCard>
            <VCardText class="d-flex align-center gap-4">
              <VAvatar
                color="primary"
                variant="tonal"
                rounded
                size="44"
              >
                <VIcon icon="tabler-building-store" />
              </VAvatar>
              <div>
                <h4 class="text-h4">
                  {{ indicadores.proveedores_activos }}
                </h4>
                <span>Proveedores activos</span>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>
  </div>
</template>
