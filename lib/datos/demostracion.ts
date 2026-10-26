/**
 * El paciente de demostracion. Existe para mostrar la aplicacion sin abrir la
 * historia de un niño real, y tiene que anunciarse como lo que es en todas
 * partes donde aparezca: sus numeros son inventados y no prueban nada.
 *
 * Se marca con el tipo de documento, que asi no hace falta una columna nueva.
 * Lo crea y lo borra `scripts/demo.ts`.
 */

export const MARCA_DEMO = 'demostracion'

export function esDemostracion(paciente: { documentType: string | null }): boolean {
  return paciente.documentType === MARCA_DEMO
}

export const AVISO_DEMO = {
  titulo: 'Paciente de demostración',
  texto:
    'Esta historia es inventada y sirve solo para mostrar como funciona la aplicación. Los datos no vienen de ningún niño y no ilustran el resultado de ningún tratamiento.',
} as const
