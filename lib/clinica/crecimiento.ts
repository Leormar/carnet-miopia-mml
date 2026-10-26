/**
 * Crecimiento de la longitud axial y semaforo.
 *
 * Los umbrales viven en config/umbrales-clinicos.ts, con su fuente. Aqui solo
 * esta la aritmetica.
 */

import {
  META_LONGITUD_AXIAL,
  SEMAFORO_CRECIMIENTO,
  VENTANA_12_MESES,
} from '@/config/umbrales-clinicos'
import { diasEntre, edadEnAnos } from './edad'
import { aNumero, redondear } from './refraccion'

export type Ojo = 'od' | 'oi'
export type ColorSemaforo = 'verde' | 'amarillo' | 'rojo' | 'sin_color'

export interface MedidaAxial {
  examId: string
  fecha: string
  alOd: number | null
  alOi: number | null
  biometerId: string | null
  biometerNombre: string | null
}

export interface Crecimiento {
  /** mm por ano. */
  mmPorAno: number
  /** Diferencia absoluta medida, sin anualizar. */
  mmAbsoluto: number
  diasEntreControles: number
  desde: { fecha: string; valor: number; biometerNombre: string | null }
  hasta: { fecha: string; valor: number; biometerNombre: string | null }
  /** true si los dos controles se midieron con equipos distintos. */
  cambioDeEquipo: boolean
}

/** Crecimiento anualizado entre dos medidas de un mismo ojo. */
export function crecimientoEntre(
  anterior: MedidaAxial,
  actual: MedidaAxial,
  ojo: Ojo,
): Crecimiento | null {
  const v1 = ojo === 'od' ? aNumero(anterior.alOd) : aNumero(anterior.alOi)
  const v2 = ojo === 'od' ? aNumero(actual.alOd) : aNumero(actual.alOi)
  if (v1 === null || v2 === null) return null

  const dias = diasEntre(anterior.fecha, actual.fecha)
  if (dias <= 0) return null

  const mmAbsoluto = redondear(v2 - v1, 2)
  return {
    mmPorAno: redondear((mmAbsoluto * 365.25) / dias, 2),
    mmAbsoluto,
    diasEntreControles: dias,
    desde: { fecha: anterior.fecha, valor: v1, biometerNombre: anterior.biometerNombre },
    hasta: { fecha: actual.fecha, valor: v2, biometerNombre: actual.biometerNombre },
    cambioDeEquipo:
      anterior.biometerId !== null &&
      actual.biometerId !== null &&
      anterior.biometerId !== actual.biometerId,
  }
}

/**
 * Crecimiento de los ultimos 12 meses: se compara el control dado contra el
 * control mas cercano a 12 meses antes, dentro de la ventana de tolerancia.
 * Si no hay ninguno en la ventana, devuelve null y la interfaz muestra solo el
 * crecimiento entre controles consecutivos.
 */
export function crecimiento12Meses(
  medidas: MedidaAxial[],
  actual: MedidaAxial,
  ojo: Ojo,
): Crecimiento | null {
  const valorActual = ojo === 'od' ? aNumero(actual.alOd) : aNumero(actual.alOi)
  if (valorActual === null) return null

  const { objetivoDias, toleranciaDias } = VENTANA_12_MESES

  const candidatos = medidas
    .filter((m) => m.examId !== actual.examId)
    .filter((m) => (ojo === 'od' ? aNumero(m.alOd) : aNumero(m.alOi)) !== null)
    .map((m) => ({ medida: m, dias: diasEntre(m.fecha, actual.fecha) }))
    .filter((c) => c.dias > 0)
    .filter((c) => Math.abs(c.dias - objetivoDias) <= toleranciaDias)
    .sort((a, b) => Math.abs(a.dias - objetivoDias) - Math.abs(b.dias - objetivoDias))

  if (candidatos.length === 0) return null
  return crecimientoEntre(candidatos[0].medida, actual, ojo)
}

export interface Semaforo {
  color: ColorSemaforo
  etiqueta: string
  descripcion: string
  /** Franja de edad aplicada, para mostrarla junto al color. */
  franja: string | null
  nota: string | null
}

/**
 * Clasifica un crecimiento de 12 meses segun la edad del nino.
 * Fuera de 7 a 16 anos se devuelve 'sin_color' con la nota correspondiente.
 */
export function semaforo(mmPorAno: number | null, edad: number): Semaforo {
  if (mmPorAno === null) {
    return {
      color: 'sin_color',
      etiqueta: 'Sin dato',
      descripcion: 'Faltan dos mediciones de longitud axial separadas en el tiempo.',
      franja: null,
      nota: null,
    }
  }

  const franja = SEMAFORO_CRECIMIENTO.franjas.find(
    (f) => edad >= f.edadMin && edad <= f.edadMax,
  )

  if (!franja) {
    return {
      color: 'sin_color',
      etiqueta: `${formatoMm(mmPorAno)} mm/año`,
      descripcion: SEMAFORO_CRECIMIENTO.notaFueraDeRango,
      franja: null,
      nota: SEMAFORO_CRECIMIENTO.notaFueraDeRango,
    }
  }

  const etiquetaFranja = `${franja.edadMin} a ${franja.edadMax} años`

  if (mmPorAno <= franja.verdeHasta) {
    return {
      color: 'verde',
      etiqueta: `${formatoMm(mmPorAno)} mm/año`,
      descripcion: franja.descripcionVerde,
      franja: etiquetaFranja,
      nota: null,
    }
  }
  if (mmPorAno >= franja.rojoDesde) {
    return {
      color: 'rojo',
      etiqueta: `${formatoMm(mmPorAno)} mm/año`,
      descripcion: franja.descripcionRojo,
      franja: etiquetaFranja,
      nota: null,
    }
  }
  return {
    color: 'amarillo',
    etiqueta: `${formatoMm(mmPorAno)} mm/año`,
    descripcion: franja.descripcionAmarillo,
    franja: etiquetaFranja,
    nota: null,
  }
}

/** El color mas preocupante de los dos ojos, para el panel del profesional. */
export function peorSemaforo(a: ColorSemaforo, b: ColorSemaforo): ColorSemaforo {
  const orden: ColorSemaforo[] = ['sin_color', 'verde', 'amarillo', 'rojo']
  return orden.indexOf(a) >= orden.indexOf(b) ? a : b
}

export interface AvisoAxial {
  nivel: 'aviso' | 'alerta'
  texto: string
}

/** Aviso al acercarse o superar la meta de largo plazo de 26 mm. */
export function avisoLongitudAxial(alOd: number | null, alOi: number | null): AvisoAxial | null {
  const maximo = Math.max(alOd ?? 0, alOi ?? 0)
  if (maximo === 0) return null
  if (maximo >= META_LONGITUD_AXIAL.limiteMm) {
    return {
      nivel: 'alerta',
      texto: `La longitud axial supera los ${META_LONGITUD_AXIAL.limiteMm} mm de la meta de largo plazo (${META_LONGITUD_AXIAL.fuente}).`,
    }
  }
  if (maximo >= META_LONGITUD_AXIAL.avisoDesdeMm) {
    return {
      nivel: 'aviso',
      texto: `La longitud axial se acerca a los ${META_LONGITUD_AXIAL.limiteMm} mm de la meta de largo plazo (${META_LONGITUD_AXIAL.fuente}).`,
    }
  }
  return null
}

export function formatoMm(n: number, decimales = 2) {
  const signo = n > 0 ? '+' : ''
  return `${signo}${n.toFixed(decimales).replace('.', ',')}`
}

export function edadEnControl(fechaNacimiento: string, fechaControl: string) {
  return edadEnAnos(fechaNacimiento, fechaControl)
}
