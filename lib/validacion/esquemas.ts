import { z } from 'zod'
import { ORDEN_TRATAMIENTOS } from '@/config/tratamientos'

/** Convierte '' en null y acepta coma decimal, como se digita en espanol. */
const numeroOpcional = (min?: number, max?: number) =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined || v === '') return null
      const n = typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.'))
      return Number.isFinite(n) ? n : null
    })
    .refine((n) => n === null || ((min === undefined || n >= min) && (max === undefined || n <= max)), {
      message: `Debe estar entre ${min} y ${max}`,
    })

const textoOpcional = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    const s = (v ?? '').toString().trim()
    return s === '' ? null : s
  })

const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use el formato AAAA-MM-DD')
const fechaOpcional = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null))

export const esquemaPaciente = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio').max(120),
  lastName: z.string().trim().min(1, 'El apellido es obligatorio').max(120),
  birthDate: fecha,
  sex: z.enum(['femenino', 'masculino', 'otro', 'no_declara']).default('no_declara'),
  documentType: textoOpcional,
  documentNumber: textoOpcional,
  myopiaOnsetAge: numeroOpcional(0, 25),
  myopicParents: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => (v === '' || v === null || v === undefined ? null : Number(v)))
    .refine((n) => n === null || [0, 1, 2].includes(n), { message: 'Debe ser 0, 1 o 2' }),
  ophthalmologistName: textoOpcional,
  institutionName: textoOpcional,
  caregiverName: textoOpcional,
  caregiverEmail: textoOpcional.refine(
    (v) => v === null || z.string().email().safeParse(v).success,
    { message: 'Correo no valido' },
  ),
  caregiverPhone: textoOpcional,
  notes: textoOpcional,

  // Consentimiento informado. Ley 1581 de 2012 y Decreto 1377 de 2013.
  consentGuardianName: z.string().trim().min(1, 'Quien autoriza es obligatorio').max(160),
  consentGuardianDocument: textoOpcional,
  consentRelationship: textoOpcional,
  consentMethod: z.enum(['en_consulta', 'digital']).default('en_consulta'),
  consentAccepted: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .transform(() => true)
    .optional(),
})

export const esquemaTratamiento = z.object({
  type: z.enum(ORDEN_TRATAMIENTOS as [string, ...string[]]),
  deviceLabel: textoOpcional,
  concentration: textoOpcional,
  startDate: fecha,
  endDate: fechaOpcional,
  changeReason: textoOpcional,
  calendarTemplateKey: textoOpcional,
  metaHorasPorDia: numeroOpcional(0, 24),
  metaDiasPorSemana: numeroOpcional(0, 7),
  metaNochesPorSemana: numeroOpcional(0, 7),
  notes: textoOpcional,
  generarCalendario: z.union([z.literal('on'), z.boolean(), z.null(), z.undefined()]).transform(
    (v) => v === 'on' || v === true,
  ),
})

export const esquemaControl = z.object({
  examDate: fecha,
  examType: z.enum(['inicio', 'rutina', 'urgencia']).default('rutina'),
  vaOd: textoOpcional,
  vaOi: textoOpcional,
  vaNotation: z.enum(['snellen_20', 'snellen_6', 'logmar', 'decimal']).default('snellen_20'),
  cycloplegic: z.union([z.literal('on'), z.boolean(), z.null(), z.undefined()]).transform(
    (v) => v === 'on' || v === true,
  ),
  sphereOd: numeroOpcional(-40, 40),
  cylOd: numeroOpcional(-20, 20),
  axisOd: numeroOpcional(0, 180),
  sphereOi: numeroOpcional(-40, 40),
  cylOi: numeroOpcional(-20, 20),
  axisOi: numeroOpcional(0, 180),
  alOd: numeroOpcional(15, 35),
  alOi: numeroOpcional(15, 35),
  /** Obligatorio si se registro longitud axial: siempre hay que saber con que equipo. */
  biometerId: textoOpcional,
  reportedHoursPerDay: numeroOpcional(0, 24),
  outdoorHoursPerDay: numeroOpcional(0, 24),
  screenHoursPerDay: numeroOpcional(0, 24),
  adverseEvents: textoOpcional,
  decision: textoOpcional,
  fundusDone: z.union([z.literal('on'), z.boolean(), z.null(), z.undefined()]).transform(
    (v) => v === 'on' || v === true,
  ),
  nextExamDate: fechaOpcional,
})
  .refine((d) => !(d.alOd !== null || d.alOi !== null) || d.biometerId !== null, {
    message: 'Si registra longitud axial debe indicar con que equipo se midio',
    path: ['biometerId'],
  })

export const esquemaUso = z.object({
  treatmentId: z.string().uuid(),
  logDate: fecha,
  hours: numeroOpcional(0, 24),
  done: z.union([z.literal('si'), z.literal('no'), z.null(), z.undefined()]).transform((v) =>
    v === 'si' ? true : v === 'no' ? false : null,
  ),
  outdoorMinutes: numeroOpcional(0, 1440),
  discomfort: z.union([z.literal('on'), z.boolean(), z.null(), z.undefined()]).transform(
    (v) => v === 'on' || v === true,
  ),
  discomfortNote: textoOpcional,
})

/**
 * Enlace de solo lectura para oftalmopediatria.
 * El vencimiento es obligatorio: no existe el enlace que no caduca.
 */
export const esquemaEnlace = z.object({
  label: textoOpcional.refine((v) => v === null || v.length <= 120, {
    message: 'Maximo 120 caracteres',
  }),
  dias: z
    .union([z.string(), z.number()])
    .transform((v) => Number(String(v).trim()))
    .refine((n) => Number.isInteger(n) && n >= 1 && n <= 180, {
      message: 'El vencimiento debe estar entre 1 y 180 dias',
    }),
})

export const esquemaEquipo = z.object({
  name: z.string().trim().min(1, 'El nombre del equipo es obligatorio').max(120),
  serial: textoOpcional,
})

/** Convierte un FormData en objeto plano para pasarlo a Zod. */
export function desdeFormData(formData: FormData): Record<string, unknown> {
  const objeto: Record<string, unknown> = {}
  formData.forEach((valor, clave) => {
    objeto[clave] = typeof valor === 'string' ? valor : undefined
  })
  return objeto
}

export type ResultadoAccion =
  | { ok: true; id?: string }
  | { ok: false; error: string; campos?: Record<string, string> }

/** Primer mensaje de error por campo, para mostrarlo junto al input. */
export function erroresDeZod(error: z.ZodError): Record<string, string> {
  const salida: Record<string, string> = {}
  for (const asunto of error.issues) {
    const clave = String(asunto.path[0] ?? 'general')
    if (!salida[clave]) salida[clave] = asunto.message
  }
  return salida
}
