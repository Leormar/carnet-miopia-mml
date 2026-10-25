/**
 * Equivalente esferico: esfera mas la mitad del cilindro.
 * En la base de datos es una columna generada; esta funcion es para mostrarlo
 * en el formulario mientras se digita, antes de guardar.
 */
export function equivalenteEsferico(
  esfera: number | string | null | undefined,
  cilindro: number | string | null | undefined,
): number | null {
  const e = aNumero(esfera)
  const c = aNumero(cilindro)
  if (e === null) return null
  return redondear(e + (c ?? 0) / 2, 2)
}

/** Formato clinico con signo: -3,25 */
export function formatoDioptrias(valor: number | string | null | undefined): string {
  const n = aNumero(valor)
  if (n === null) return ''
  const signo = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${signo}${Math.abs(n).toFixed(2).replace('.', ',')}`
}

/** -3,25 -1,00 x 180 */
export function formatoRefraccion(
  esfera: number | string | null | undefined,
  cilindro: number | string | null | undefined,
  eje: number | string | null | undefined,
): string {
  const e = aNumero(esfera)
  if (e === null) return ''
  const c = aNumero(cilindro)
  const x = aNumero(eje)
  if (c === null || c === 0) return formatoDioptrias(e)
  return `${formatoDioptrias(e)} ${formatoDioptrias(c)} x ${x ?? 0}`
}

export function aNumero(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  const n = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function redondear(n: number, decimales: number) {
  const f = 10 ** decimales
  return Math.round(n * f) / f
}
