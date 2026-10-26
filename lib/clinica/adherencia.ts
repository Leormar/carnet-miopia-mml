/**
 * Adherencia: que tanto se esta usando realmente el tratamiento.
 *
 * Principio del carnet: si no se usa, no funciona. El porcentaje se calcula
 * siempre sobre los dias que el tratamiento estuvo activo dentro del periodo,
 * no sobre los dias que la familia alcanzo a registrar. Un dia sin registro
 * cuenta como dia no cumplido, y se informa aparte cuantos dias quedaron sin
 * registrar para no confundir falta de uso con falta de registro.
 */

import { TRATAMIENTOS, type TipoTratamiento } from '@/config/tratamientos'
import { aIso, diasEntre, sumarDias } from './edad'
import { aNumero, redondear } from './refraccion'

export interface RegistroUso {
  logDate: string
  hours: number | string | null
  done: boolean | null
  outdoorMinutes: number | null
  discomfort: boolean
}

export interface TratamientoParaAdherencia {
  id: string
  type: TipoTratamiento
  startDate: string
  endDate: string | null
  adherenceGoal: { horasPorDia?: number; diasPorSemana?: number; nochesPorSemana?: number }
}

export interface ResumenAdherencia {
  dias: number
  /** Dias del periodo en que el tratamiento estuvo activo. */
  diasActivos: number
  diasRegistrados: number
  diasSinRegistro: number
  diasCumplidos: number
  /** 0 a 100. null si el tratamiento no estuvo activo en el periodo. */
  porcentaje: number | null
  /** Solo para gafas y lentes blandos. */
  promedioHoras: number | null
  /** Meta leida del tratamiento, en texto, para mostrarla junto al porcentaje. */
  metaTexto: string
  diasConMolestias: number
  promedioMinutosAireLibre: number | null
}

/** Meta efectiva: la del tratamiento si existe, si no la de config. */
export function metaDe(t: TratamientoParaAdherencia) {
  const porDefecto = TRATAMIENTOS[t.type].metaPorDefecto
  return { ...porDefecto, ...(t.adherenceGoal ?? {}) }
}

export function metaEnTexto(t: TratamientoParaAdherencia): string {
  const meta = metaDe(t)
  const modo = TRATAMIENTOS[t.type].modoRegistro
  if (modo === 'horas') {
    const horas = meta.horasPorDia ?? 0
    const dias = meta.diasPorSemana ?? 7
    return dias >= 7
      ? `${horas} horas al dia, todos los dias`
      : `${horas} horas al dia, ${dias} dias por semana`
  }
  const noches = meta.nochesPorSemana ?? 7
  const palabra = modo === 'noche' ? 'noches' : 'gotas'
  return noches >= 7 ? `Todas las ${palabra}` : `${noches} ${palabra} por semana`
}

/**
 * Un dia cuenta como cumplido si:
 * - horas: se registraron al menos las horas de la meta
 * - noche o gota: se registro que si se hizo
 */
function diaCumplido(t: TratamientoParaAdherencia, r: RegistroUso): boolean {
  const modo = TRATAMIENTOS[t.type].modoRegistro
  if (modo === 'horas') {
    const horas = aNumero(r.hours)
    const meta = metaDe(t).horasPorDia ?? 0
    return horas !== null && horas >= meta
  }
  return r.done === true
}

/**
 * Dias del periodo en que el tratamiento estuvo activo. Si el tratamiento
 * empezo despues del inicio del periodo o termino antes del final, solo cuentan
 * los dias de traslape. Para metas de menos de 7 dias por semana, los dias
 * esperados se ajustan en proporcion.
 */
function diasActivosEnPeriodo(
  t: TratamientoParaAdherencia,
  desde: string,
  hasta: string,
): number {
  const inicio = t.startDate > desde ? t.startDate : desde
  const fin = t.endDate && t.endDate < hasta ? t.endDate : hasta
  const dias = diasEntre(inicio, fin) + 1
  if (dias <= 0) return 0

  const meta = metaDe(t)
  const diasPorSemana = meta.diasPorSemana ?? meta.nochesPorSemana ?? 7
  if (diasPorSemana >= 7) return dias
  return Math.round((dias * diasPorSemana) / 7)
}

export function resumenAdherencia(
  tratamiento: TratamientoParaAdherencia,
  registros: RegistroUso[],
  dias: number,
  hoy: string = aIso(new Date()),
): ResumenAdherencia {
  const desde = sumarDias(hoy, -(dias - 1))
  const enPeriodo = registros.filter((r) => r.logDate >= desde && r.logDate <= hoy)

  const diasActivos = diasActivosEnPeriodo(tratamiento, desde, hoy)
  const diasRegistrados = enPeriodo.length
  const diasCumplidos = enPeriodo.filter((r) => diaCumplido(tratamiento, r)).length

  const conHoras = enPeriodo
    .map((r) => aNumero(r.hours))
    .filter((h): h is number => h !== null)
  const promedioHoras =
    TRATAMIENTOS[tratamiento.type].modoRegistro === 'horas' && conHoras.length > 0
      ? redondear(conHoras.reduce((a, b) => a + b, 0) / conHoras.length, 1)
      : null

  const conAireLibre = enPeriodo
    .map((r) => r.outdoorMinutes)
    .filter((m): m is number => m !== null && m !== undefined)

  return {
    dias,
    diasActivos,
    diasRegistrados,
    diasSinRegistro: Math.max(0, diasActivos - diasRegistrados),
    diasCumplidos,
    porcentaje:
      diasActivos > 0 ? Math.min(100, Math.round((diasCumplidos / diasActivos) * 100)) : null,
    promedioHoras,
    metaTexto: metaEnTexto(tratamiento),
    diasConMolestias: enPeriodo.filter((r) => r.discomfort).length,
    promedioMinutosAireLibre:
      conAireLibre.length > 0
        ? Math.round(conAireLibre.reduce((a, b) => a + b, 0) / conAireLibre.length)
        : null,
  }
}

export type NivelAdherencia = 'alta' | 'media' | 'baja' | 'sin_dato'

/**
 * Corte operativo para la interfaz, no un umbral clinico publicado: alta desde
 * 80 %, baja por debajo de 50 %. Sirve solo para ordenar el panel y para
 * decidir cuando mostrar el texto que invita a revisar el uso.
 */
export function nivelAdherencia(porcentaje: number | null): NivelAdherencia {
  if (porcentaje === null) return 'sin_dato'
  if (porcentaje >= 80) return 'alta'
  if (porcentaje >= 50) return 'media'
  return 'baja'
}

/**
 * Texto que se muestra junto al crecimiento del ojo cuando el ojo crecio mas de
 * lo esperado y la adherencia fue baja. Es informativo: la aplicacion registra
 * y calcula, no decide tratamientos.
 */
export function lecturaConjunta(
  colorSemaforo: 'verde' | 'amarillo' | 'rojo' | 'sin_color',
  porcentajeAdherencia: number | null,
): string | null {
  const nivel = nivelAdherencia(porcentajeAdherencia)
  if (colorSemaforo !== 'amarillo' && colorSemaforo !== 'rojo') return null
  if (nivel === 'alta') {
    return 'El ojo creció mas de lo esperado con una adherencia alta. Vale la pena revisar si el dispositivo sigue siendo el adecuado y descartar otros factores.'
  }
  if (nivel === 'media' || nivel === 'baja') {
    return 'El ojo creció mas de lo esperado y el uso registrado quedó por debajo de la meta. Antes de cambiar de tratamiento, conviene revisar el uso del que ya tiene.'
  }
  return 'El ojo creció mas de lo esperado y no hay registro de uso suficiente en el periodo. Conviene preguntar por el uso antes de tomar una decisión.'
}
