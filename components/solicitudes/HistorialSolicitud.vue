<script setup lang="ts">
import type { SolicitudHistorial } from '@/types/solicitud'

defineProps<{ historial: SolicitudHistorial[] }>()
</script>

<template>
  <VCard title="Historial">
    <VCardText>
      <!-- El back lo manda del más reciente al más antiguo -->
      <VTimeline
        side="end"
        align="start"
        truncate-line="both"
        density="compact"
      >
        <VTimelineItem
          v-for="registro in historial"
          :key="registro.id"
          :dot-color="colorEstadoSolicitud(Number(registro.estado_solicitud_id))"
          size="x-small"
        >
          <div class="d-flex justify-space-between flex-wrap gap-2 mb-1">
            <span class="font-weight-medium text-high-emphasis">
              {{ registro.estado_solicitud?.nombre }}
            </span>
            <small class="text-disabled">{{ formatoFechaHora(registro.created_at) }}</small>
          </div>
          <p
            v-if="registro.observacion"
            class="mb-1"
          >
            {{ registro.observacion }}
          </p>
          <small>{{ nombreUsuario(registro.usuario) }}</small>
        </VTimelineItem>
      </VTimeline>
    </VCardText>
  </VCard>
</template>
