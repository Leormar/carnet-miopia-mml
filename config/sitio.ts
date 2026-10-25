/**
 * Datos del sitio y de la marca.
 */

export const SITIO = {
  nombre: 'Carnet de seguimiento del control de miopia',
  nombreCorto: 'Carnet MML',
  organizacion: 'Grupo Manejo Miopia Latam',
  /** Subdominio de la aplicacion. El dominio raiz queda libre para el sitio. */
  dominio: 'seguimiento.miopialatam.org',
  url: 'https://seguimiento.miopialatam.org',
  substack: 'grupomiopialatam.substack.com',
  autorClinico: 'Leonardo Orjuela Marino, optometra',
} as const

export const COLORES = {
  crema: '#faf8f3',
  tinta: '#111c26',
  grisTexto: '#5b6570',
  borde: '#ddd6c8',
  magenta: '#e2104f',
  azul: '#1fa3dd',
  amarillo: '#f5c400',
  verde: '#5a9a3a',
} as const

/** Las cuatro barras de color de la cabecera del carnet, en su orden. */
export const BARRAS = [COLORES.amarillo, COLORES.verde, COLORES.azul, COLORES.magenta]
