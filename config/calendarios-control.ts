/**
 * Calendarios de control del primer ano.
 *
 * Plantillas base, de solo lectura, del Consejo Mundial de Optometria
 * (World Council of Optometry, "Myopia measurement and patient follow-up").
 * Despues del primer ano, control cada 6 meses. Refraccion ciclopejica y
 * longitud axial cada 6 meses; examen completo con fondo de ojo cada ano.
 *
 * Cada organizacion puede crear sus propias plantillas en la base de datos.
 * Estas solo son el punto de partida cuando una organizacion no ha definido la
 * suya.
 */

import type { TipoTratamiento } from './tratamientos'

export interface ItemCalendario {
  /** Dias desde el inicio del tratamiento. */
  offsetDias: number
  etiqueta: string
  requiere: {
    biometria?: boolean
    topografia?: boolean
    ciclopejia?: boolean
    fondoDeOjo?: boolean
  }
}

export interface PlantillaCalendario {
  clave: string
  nombre: string
  tipo: TipoTratamiento
  fuente: string
  items: ItemCalendario[]
  /** Cada cuantos dias se repite el control despues del ultimo item. */
  cadaDiasDespues: number
}

const CADA_6_MESES = 182

export const PLANTILLAS_BASE: PlantillaCalendario[] = [
  {
    clave: 'wco-gafas',
    nombre: 'Gafas, Consejo Mundial de Optometría',
    tipo: 'gafas',
    fuente: 'World Council of Optometry, Myopia measurement and patient follow-up',
    cadaDiasDespues: CADA_6_MESES,
    items: [
      { offsetDias: 30, etiqueta: '1 mes', requiere: {} },
      { offsetDias: 182, etiqueta: '6 meses', requiere: { biometria: true, ciclopejia: true } },
      {
        offsetDias: 365,
        etiqueta: '1 año',
        requiere: { biometria: true, ciclopejia: true, fondoDeOjo: true },
      },
    ],
  },
  {
    clave: 'wco-blandos',
    nombre: 'Lentes blandos, Consejo Mundial de Optometría',
    tipo: 'lentes_blandos',
    fuente: 'World Council of Optometry, Myopia measurement and patient follow-up',
    cadaDiasDespues: CADA_6_MESES,
    items: [
      { offsetDias: 7, etiqueta: '1 semana', requiere: {} },
      { offsetDias: 30, etiqueta: '1 mes', requiere: {} },
      { offsetDias: 182, etiqueta: '6 meses', requiere: { biometria: true, ciclopejia: true } },
      {
        offsetDias: 365,
        etiqueta: '1 año',
        requiere: { biometria: true, ciclopejia: true, fondoDeOjo: true },
      },
    ],
  },
  {
    clave: 'wco-ortok',
    nombre: 'Ortoqueratología, Consejo Mundial de Optometría',
    tipo: 'ortok',
    fuente: 'World Council of Optometry, Myopia measurement and patient follow-up',
    cadaDiasDespues: CADA_6_MESES,
    items: [
      { offsetDias: 1, etiqueta: '1 día', requiere: { topografia: true } },
      { offsetDias: 7, etiqueta: '1 semana', requiere: { topografia: true } },
      { offsetDias: 30, etiqueta: '1 mes', requiere: { topografia: true } },
      { offsetDias: 91, etiqueta: '3 meses', requiere: { topografia: true } },
      {
        offsetDias: 182,
        etiqueta: '6 meses',
        requiere: { biometria: true, topografia: true, ciclopejia: true },
      },
      {
        offsetDias: 365,
        etiqueta: '1 año',
        requiere: { biometria: true, topografia: true, ciclopejia: true, fondoDeOjo: true },
      },
    ],
  },
  {
    clave: 'wco-atropina',
    nombre: 'Atropina, Consejo Mundial de Optometría',
    tipo: 'atropina',
    fuente: 'World Council of Optometry, Myopia measurement and patient follow-up',
    cadaDiasDespues: CADA_6_MESES,
    items: [
      { offsetDias: 1, etiqueta: '1 día', requiere: {} },
      { offsetDias: 7, etiqueta: '1 semana', requiere: {} },
      { offsetDias: 30, etiqueta: '1 mes', requiere: {} },
      { offsetDias: 91, etiqueta: '3 meses', requiere: {} },
      { offsetDias: 182, etiqueta: '6 meses', requiere: { biometria: true, ciclopejia: true } },
      {
        offsetDias: 365,
        etiqueta: '1 año',
        requiere: { biometria: true, ciclopejia: true, fondoDeOjo: true },
      },
    ],
  },
  {
    /**
     * Protocolo propio de la practica de Leonardo Orjuela Marino, descrito en el
     * post "Si no se usa, no funciona": primera noche con los lentes puestos,
     * control a la manana siguiente, 15 dias, 1 mes, 3 meses y luego cada 6
     * meses con biometria y topografia. Reemplazo del lente cada ano.
     */
    clave: 'prolens-ortok',
    nombre: 'Ortoqueratología, protocolo PROLENS',
    tipo: 'ortok',
    fuente: 'Protocolo de la práctica de Leonardo Orjuela Mariño, PROLENS',
    cadaDiasDespues: CADA_6_MESES,
    items: [
      {
        offsetDias: 1,
        etiqueta: 'Mañana siguiente, con los lentes puestos',
        requiere: { topografia: true },
      },
      { offsetDias: 15, etiqueta: '15 días', requiere: { topografia: true } },
      { offsetDias: 30, etiqueta: '1 mes', requiere: { topografia: true } },
      { offsetDias: 91, etiqueta: '3 meses', requiere: { topografia: true } },
      {
        offsetDias: 182,
        etiqueta: '6 meses',
        requiere: { biometria: true, topografia: true, ciclopejia: true },
      },
      {
        offsetDias: 365,
        etiqueta: '1 año, con reemplazo del lente',
        requiere: { biometria: true, topografia: true, ciclopejia: true, fondoDeOjo: true },
      },
    ],
  },
]

export function plantillaPorDefecto(tipo: TipoTratamiento): PlantillaCalendario {
  const preferida = tipo === 'ortok' ? 'prolens-ortok' : null
  return (
    PLANTILLAS_BASE.find((p) => p.clave === preferida) ??
    PLANTILLAS_BASE.find((p) => p.tipo === tipo)!
  )
}
