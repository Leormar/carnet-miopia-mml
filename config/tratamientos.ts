/**
 * Catalogo de tipos de tratamiento, independiente de marca.
 *
 * "Combinado" no es un tipo: es la consecuencia de tener mas de un tratamiento
 * activo al mismo tiempo (por ejemplo ortoqueratologia mas atropina). Asi cada
 * uno conserva su propia meta de adherencia y su propio calendario.
 */

export type TipoTratamiento = 'ortok' | 'gafas' | 'lentes_blandos' | 'atropina'

/** Como se registra el uso diario de cada tratamiento. */
export type ModoRegistro = 'horas' | 'noche' | 'gota'

export interface DefinicionTratamiento {
  tipo: TipoTratamiento
  nombre: string
  nombreCorto: string
  color: string
  modoRegistro: ModoRegistro
  /** Texto del boton grande en la vista de la familia. */
  preguntaDiaria: string
  /** Meta por defecto, editable por el profesional en cada tratamiento. */
  metaPorDefecto: { horasPorDia?: number; diasPorSemana?: number; nochesPorSemana?: number }
  /** Que se revisa en consulta. Tomado de la pagina 2 del carnet de papel. */
  queRevisar: string
  /** Campos de hallazgos especificos que muestra el formulario de control. */
  hallazgos: { clave: string; etiqueta: string; tipo: 'texto' | 'numero' }[]
}

export const TRATAMIENTOS: Record<TipoTratamiento, DefinicionTratamiento> = {
  ortok: {
    tipo: 'ortok',
    nombre: 'Ortoqueratología',
    nombreCorto: 'Orto-k',
    color: '#5a9a3a',
    modoRegistro: 'noche',
    preguntaDiaria: 'Anoche durmió con los lentes',
    metaPorDefecto: { nochesPorSemana: 7 },
    queRevisar:
      'Topografía corneal. Visión al levantarse. Córnea en lámpara de hendidura. Limpieza de los lentes. Reemplazo del lente cada año. Biometría y topografía cada 6 meses.',
    hallazgos: [
      { clave: 'topografia', etiqueta: 'Topografía corneal', tipo: 'texto' },
      { clave: 'centrado', etiqueta: 'Centrado del lente', tipo: 'texto' },
      { clave: 'cornea', etiqueta: 'Córnea en lámpara de hendidura', tipo: 'texto' },
      { clave: 'vision_al_levantarse', etiqueta: 'Visión al levantarse', tipo: 'texto' },
      { clave: 'estado_lente', etiqueta: 'Estado y limpieza del lente', tipo: 'texto' },
    ],
  },
  gafas: {
    tipo: 'gafas',
    nombre: 'Gafas para control de miopía',
    nombreCorto: 'Gafas',
    color: '#1fa3dd',
    modoRegistro: 'horas',
    preguntaDiaria: 'Horas que uso las gafas hoy',
    metaPorDefecto: { horasPorDia: 12, diasPorSemana: 7 },
    queRevisar:
      'Montura bien ajustada que no se baje. Lentes centradas. Uso todo el día, 12 horas o más. Estado de las lentes.',
    hallazgos: [
      { clave: 'ajuste_montura', etiqueta: 'Ajuste de la montura', tipo: 'texto' },
      { clave: 'centrado', etiqueta: 'Centrado de las lentes', tipo: 'texto' },
      { clave: 'estado_lentes', etiqueta: 'Estado de las lentes', tipo: 'texto' },
    ],
  },
  lentes_blandos: {
    tipo: 'lentes_blandos',
    nombre: 'Lentes de contacto blandos',
    nombreCorto: 'Blandos',
    color: '#e2104f',
    modoRegistro: 'horas',
    preguntaDiaria: 'Horas que uso los lentes hoy',
    metaPorDefecto: { horasPorDia: 10, diasPorSemana: 6 },
    queRevisar:
      'Córnea en lámpara de hendidura. Horas y días de uso. Como se pone, se quita y cuida los lentes. Ojo rojo o molestias.',
    hallazgos: [
      { clave: 'cornea', etiqueta: 'Córnea en lámpara de hendidura', tipo: 'texto' },
      { clave: 'ajuste', etiqueta: 'Ajuste del lente', tipo: 'texto' },
      { clave: 'manejo', etiqueta: 'Manejo e higiene', tipo: 'texto' },
    ],
  },
  atropina: {
    tipo: 'atropina',
    nombre: 'Atropina en baja dosis',
    nombreCorto: 'Atropina',
    color: '#f5c400',
    modoRegistro: 'gota',
    preguntaDiaria: 'Anoche se puso la gota',
    metaPorDefecto: { nochesPorSemana: 7 },
    queRevisar:
      'Tamaño de la pupila. Sensibilidad a la luz. Visión de cerca y acomodación. Presión del ojo. Uso todas las noches.',
    hallazgos: [
      { clave: 'pupila_od', etiqueta: 'Pupila OD (mm)', tipo: 'numero' },
      { clave: 'pupila_oi', etiqueta: 'Pupila OI (mm)', tipo: 'numero' },
      { clave: 'fotofobia', etiqueta: 'Sensibilidad a la luz', tipo: 'texto' },
      { clave: 'acomodacion', etiqueta: 'Visión de cerca y acomodación', tipo: 'texto' },
      { clave: 'pio_od', etiqueta: 'Presión intraocular OD (mmHg)', tipo: 'numero' },
      { clave: 'pio_oi', etiqueta: 'Presión intraocular OI (mmHg)', tipo: 'numero' },
    ],
  },
}

/** Concentraciones sugeridas de atropina. No es una lista cerrada. */
export const CONCENTRACIONES_ATROPINA = ['0,01 %', '0,025 %', '0,05 %']

export const ORDEN_TRATAMIENTOS: TipoTratamiento[] = [
  'ortok',
  'gafas',
  'lentes_blandos',
  'atropina',
]
