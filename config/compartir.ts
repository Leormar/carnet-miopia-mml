/**
 * Opciones del enlace de solo lectura. Van aparte de lib/compartir/enlaces.ts
 * para que el formulario del navegador no arrastre la base de datos ni el
 * generador de QR, que son solo del servidor.
 */

/** Vencimientos que ofrece el formulario. No existe el enlace que no caduca. */
export const DURACIONES = [
  { dias: 7, texto: '7 días' },
  { dias: 15, texto: '15 días' },
  { dias: 30, texto: '30 días' },
  { dias: 90, texto: '90 días' },
  { dias: 180, texto: '180 días' },
] as const

export const DIAS_POR_DEFECTO = 30
export const DIAS_MAXIMO = 180
