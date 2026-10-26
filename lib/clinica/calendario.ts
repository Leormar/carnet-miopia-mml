/**
 * Generacion del calendario de controles al iniciar un tratamiento.
 */

import { PLANTILLAS_BASE, plantillaPorDefecto } from '@/config/calendarios-control'
import type { TipoTratamiento } from '@/config/tratamientos'
import { aIso, sumarDias } from './edad'

export interface CitaGenerada {
  dueDate: string
  label: string
  requires: {
    biometria?: boolean
    topografia?: boolean
    cicloplejia?: boolean
    fondoDeOjo?: boolean
  }
}

/**
 * Genera las citas del primer ano desde la plantilla, mas las de seguimiento
 * periodico hasta completar el horizonte pedido.
 */
export function generarCalendario(
  tipo: TipoTratamiento,
  fechaInicio: string,
  opciones: { claveePlantilla?: string | null; horizonteMeses?: number } = {},
): CitaGenerada[] {
  const plantilla =
    PLANTILLAS_BASE.find((p) => p.clave === opciones.claveePlantilla) ??
    plantillaPorDefecto(tipo)

  const horizonteDias = Math.round((opciones.horizonteMeses ?? 24) * 30.44)

  const citas: CitaGenerada[] = plantilla.items
    .filter((item) => item.offsetDias <= horizonteDias)
    .map((item) => ({
      dueDate: sumarDias(fechaInicio, item.offsetDias),
      label: item.etiqueta,
      requires: item.requiere,
    }))

  // Despues del ultimo item de la plantilla, control periodico.
  const ultimoOffset = plantilla.items.reduce((max, i) => Math.max(max, i.offsetDias), 0)
  let offset = ultimoOffset + plantilla.cadaDiasDespues
  while (offset <= horizonteDias) {
    const meses = Math.round(offset / 30.44)
    citas.push({
      dueDate: sumarDias(fechaInicio, offset),
      label: `${meses} meses`,
      // Refraccion ciclopejica y longitud axial cada 6 meses; fondo de ojo cada ano.
      requires: {
        biometria: true,
        cicloplejia: true,
        topografia: tipo === 'ortok',
        fondoDeOjo: Math.round(offset / 365) * 365 === offset || meses % 12 === 0,
      },
    })
    offset += plantilla.cadaDiasDespues
  }

  return citas.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export type EstadoCita = 'pendiente' | 'cumplida' | 'vencida' | 'omitida'

/** Una cita pendiente cuya fecha ya paso cuenta como vencida. */
export function estadoVigente(
  estado: EstadoCita,
  dueDate: string,
  hoy: string = aIso(new Date()),
): EstadoCita {
  if (estado === 'pendiente' && dueDate < hoy) return 'vencida'
  return estado
}

export function etiquetaEstado(estado: EstadoCita): string {
  return { pendiente: 'Pendiente', cumplida: 'Cumplida', vencida: 'Vencida', omitida: 'Omitida' }[
    estado
  ]
}
