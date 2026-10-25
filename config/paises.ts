/**
 * Paises de la red. Se usa para saber cual es la autoridad que habilita a un
 * profesional, que cambia en cada uno.
 *
 * El nombre oficial del registro o tarjeta profesional de cada pais NO esta
 * aqui a proposito: es un dato que debe aportar la red, no uno que se pueda
 * suponer. Mientras tanto la persona escribe como se llama en su pais.
 */

export const PAISES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'Espana',
  'Guatemala',
  'Honduras',
  'Mexico',
  'Nicaragua',
  'Panama',
  'Paraguay',
  'Peru',
  'Puerto Rico',
  'Republica Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro',
] as const

export type Pais = (typeof PAISES)[number]

/**
 * Tipos de documento en terminos genericos, porque el nombre exacto cambia de
 * un pais a otro. La persona escribe el nombre oficial en el campo de al lado.
 */
export const TIPOS_DE_CREDENCIAL = [
  { valor: 'tarjeta_profesional', texto: 'Tarjeta o licencia profesional' },
  { valor: 'registro_sanitario', texto: 'Registro ante la autoridad sanitaria' },
  { valor: 'colegiatura', texto: 'Colegiatura o matricula del colegio profesional' },
  { valor: 'titulo', texto: 'Titulo universitario' },
  { valor: 'otro', texto: 'Otro documento que acredite el ejercicio' },
] as const

export type TipoCredencial = (typeof TIPOS_DE_CREDENCIAL)[number]['valor']

/** Lo que se acepta subir. */
export const ARCHIVO_CREDENCIAL = {
  tiposMime: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
  extensiones: '.pdf, .jpg, .png',
  maximoBytes: 4 * 1024 * 1024,
  maximoTexto: '4 MB',
} as const
