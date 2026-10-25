/** Edad en anos cumplidos a una fecha dada. */
export function edadEnAnos(fechaNacimiento: string | Date, enFecha: string | Date = new Date()) {
  const nacimiento = aFecha(fechaNacimiento)
  const referencia = aFecha(enFecha)
  let anos = referencia.getFullYear() - nacimiento.getFullYear()
  const mes = referencia.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && referencia.getDate() < nacimiento.getDate())) anos--
  return anos
}

/** Edad con un decimal, para mostrar en la tabla de controles. */
export function edadDecimal(fechaNacimiento: string | Date, enFecha: string | Date = new Date()) {
  const dias = diasEntre(fechaNacimiento, enFecha)
  return Math.round((dias / 365.25) * 10) / 10
}

export function diasEntre(desde: string | Date, hasta: string | Date) {
  const a = aFecha(desde).getTime()
  const b = aFecha(hasta).getTime()
  return Math.round((b - a) / 86_400_000)
}

/** Interpreta 'AAAA-MM-DD' como fecha local, no UTC, para no perder un dia. */
export function aFecha(valor: string | Date): Date {
  if (valor instanceof Date) return valor
  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (soloFecha) {
    return new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]))
  }
  return new Date(valor)
}

export function aIso(valor: string | Date): string {
  const f = aFecha(valor)
  const mes = String(f.getMonth() + 1).padStart(2, '0')
  const dia = String(f.getDate()).padStart(2, '0')
  return `${f.getFullYear()}-${mes}-${dia}`
}

export function sumarDias(valor: string | Date, dias: number): string {
  const f = aFecha(valor)
  f.setDate(f.getDate() + dias)
  return aIso(f)
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** 14 de marzo de 2026 */
export function fechaLarga(valor: string | Date): string {
  const f = aFecha(valor)
  return `${f.getDate()} de ${MESES[f.getMonth()]} de ${f.getFullYear()}`
}

/** 14/03/2026 */
export function fechaCorta(valor: string | Date): string {
  const f = aFecha(valor)
  return `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}/${f.getFullYear()}`
}
