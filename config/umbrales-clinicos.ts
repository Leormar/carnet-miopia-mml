/**
 * Umbrales clinicos del carnet MML.
 *
 * Ningun valor de este archivo debe quemarse en el codigo de la aplicacion.
 * Cada umbral lleva su fuente. Si una fuente cambia, se cambia aqui.
 */

export const NOTA_EDUCATIVA =
  'Este contenido es educativo y no reemplaza una valoracion visual individual.'

/**
 * Semaforo de crecimiento de longitud axial en 12 meses, en mm/ano.
 *
 * Fuente: Myopia Profile (Gifford) y el post del Grupo Manejo Miopia Latam
 * "Si no se usa, no funciona", seccion "Como leer el crecimiento del ojo en
 * 12 meses" del carnet de papel.
 *
 * Lectura: verde es un crecimiento comparable al de un ojo sin miopia; rojo es
 * comparable al de un miope sin tratamiento; amarillo es la franja intermedia.
 */
export const SEMAFORO_CRECIMIENTO = {
  fuente:
    'Myopia Profile (Gifford) y carnet de seguimiento del Grupo Manejo Miopia Latam',
  franjas: [
    {
      edadMin: 7,
      edadMax: 10,
      verdeHasta: 0.2, // mm/ano, inclusive
      rojoDesde: 0.3, // mm/ano, inclusive
      descripcionVerde: 'Como un ojo sin miopia',
      descripcionAmarillo: 'Mas de lo ideal. Revisar adherencia y habitos',
      descripcionRojo: 'Como un miope sin tratamiento',
    },
    {
      edadMin: 11,
      edadMax: 16,
      verdeHasta: 0.1,
      rojoDesde: 0.2,
      descripcionVerde: 'Como un ojo sin miopia',
      descripcionAmarillo: 'Mas de lo ideal. Revisar adherencia y habitos',
      descripcionRojo: 'Como un miope sin tratamiento',
    },
  ],
  /** Fuera de 7 a 16 anos se muestra el dato sin color y con esta nota. */
  notaFueraDeRango:
    'No hay umbral de semaforo publicado para esta edad. Se muestra el crecimiento medido, sin clasificacion.',
} as const

/**
 * Meta de longitud axial de largo plazo.
 *
 * Fuente: Tideman JWL, et al. Association of axial length with risk of
 * uncorrectable visual impairment for Europeans with myopia.
 * JAMA Ophthalmol. 2016;134(12):1355-1363.
 */
export const META_LONGITUD_AXIAL = {
  fuente: 'Tideman 2016, JAMA Ophthalmology',
  limiteMm: 26.0,
  /** A partir de este valor se muestra un aviso de cercania a la meta. */
  avisoDesdeMm: 25.5,
  texto: 'Meta de largo plazo: mantener la longitud axial por debajo de 26 mm.',
} as const

/**
 * Ventana para comparar un control contra el de hace 12 meses.
 * Si no hay ningun control dentro de la ventana, no se calcula el dato de
 * 12 meses y se muestra solo el crecimiento anualizado entre controles.
 */
export const VENTANA_12_MESES = {
  objetivoDias: 365,
  toleranciaDias: 60,
} as const

/**
 * Percentiles de longitud axial.
 *
 * NO IMPLEMENTADO A PROPOSITO. Se activa unicamente cuando exista una tabla
 * verificada con su fuente (por ejemplo Tideman 2018). Hasta entonces la
 * aplicacion no muestra percentil en ninguna vista.
 */
export const PERCENTILES_DISPONIBLES = false
