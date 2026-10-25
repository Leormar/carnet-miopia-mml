import { and, asc, desc, eq, gt, inArray, isNull, or, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import {
  biometers,
  consents,
  exams,
  patientAccess,
  patients,
  scheduledExams,
  treatments,
  usageLogs,
} from '@/lib/db/schema'
import type { Sesion } from '@/lib/auth/sesion'
import type { TipoTratamiento } from '@/config/tratamientos'
import { aIso, edadEnAnos } from '@/lib/clinica/edad'
import {
  avisoLongitudAxial,
  crecimiento12Meses,
  crecimientoEntre,
  peorSemaforo,
  semaforo,
  type ColorSemaforo,
  type MedidaAxial,
} from '@/lib/clinica/crecimiento'
import { aNumero } from '@/lib/clinica/refraccion'
import { resumenAdherencia, type RegistroUso } from '@/lib/clinica/adherencia'
import { estadoVigente } from '@/lib/clinica/calendario'

/** Ids de los pacientes que este usuario puede ver. Un admin los ve todos. */
export async function idsPacientesVisibles(sesion: Sesion): Promise<string[] | 'todos'> {
  if (sesion.user.isAdmin) return 'todos'
  const ahora = new Date()
  const filas = await db
    .selectDistinct({ patientId: patientAccess.patientId })
    .from(patientAccess)
    .where(
      and(
        eq(patientAccess.userId, sesion.user.id),
        isNull(patientAccess.revokedAt),
        or(isNull(patientAccess.expiresAt), gt(patientAccess.expiresAt, ahora)),
      ),
    )
  return filas.map((f) => f.patientId)
}

export interface FilaPanel {
  id: string
  nombre: string
  edad: number
  tratamientosActivos: { tipo: TipoTratamiento; etiqueta: string }[]
  ultimoControl: string | null
  semaforoColor: ColorSemaforo
  semaforoTexto: string
  adherencia30: number | null
  proximoControl: { fecha: string; etiqueta: string } | null
  controlesVencidos: number
}

export async function filasDelPanel(sesion: Sesion): Promise<FilaPanel[]> {
  const visibles = await idsPacientesVisibles(sesion)
  if (visibles !== 'todos' && visibles.length === 0) return []

  const filtro = visibles === 'todos' ? undefined : inArray(patients.id, visibles)

  const listaPacientes = await db
    .select()
    .from(patients)
    .where(filtro ? and(isNull(patients.archivedAt), filtro) : isNull(patients.archivedAt))
    .orderBy(asc(patients.lastName), asc(patients.firstName))

  if (listaPacientes.length === 0) return []
  const ids = listaPacientes.map((p) => p.id)

  const [listaExamenes, listaTratamientos, listaCitas, listaUso] = await Promise.all([
    db
      .select({
        id: exams.id,
        patientId: exams.patientId,
        examDate: exams.examDate,
        alOd: exams.alOd,
        alOi: exams.alOi,
        biometerId: exams.biometerId,
      })
      .from(exams)
      .where(inArray(exams.patientId, ids))
      .orderBy(asc(exams.examDate)),
    db
      .select()
      .from(treatments)
      .where(inArray(treatments.patientId, ids))
      .orderBy(asc(treatments.startDate)),
    db
      .select()
      .from(scheduledExams)
      .where(inArray(scheduledExams.patientId, ids))
      .orderBy(asc(scheduledExams.dueDate)),
    db
      .select({
        patientId: usageLogs.patientId,
        treatmentId: usageLogs.treatmentId,
        logDate: usageLogs.logDate,
        hours: usageLogs.hours,
        done: usageLogs.done,
        outdoorMinutes: usageLogs.outdoorMinutes,
        discomfort: usageLogs.discomfort,
      })
      .from(usageLogs)
      .where(
        and(
          inArray(usageLogs.patientId, ids),
          sql`${usageLogs.logDate} >= current_date - interval '90 days'`,
        ),
      ),
  ])

  const hoy = aIso(new Date())

  return listaPacientes.map((p) => {
    const examenes = listaExamenes.filter((e) => e.patientId === p.id)
    const medidas: MedidaAxial[] = examenes.map((e) => ({
      examId: e.id,
      fecha: e.examDate,
      alOd: aNumero(e.alOd),
      alOi: aNumero(e.alOi),
      biometerId: e.biometerId,
      biometerNombre: null,
    }))

    const ultimo = medidas[medidas.length - 1] ?? null
    const edad = edadEnAnos(p.birthDate, ultimo?.fecha ?? hoy)

    let color: ColorSemaforo = 'sin_color'
    let texto = 'Sin dos mediciones'
    if (ultimo) {
      const od = crecimiento12Meses(medidas, ultimo, 'od')
      const oi = crecimiento12Meses(medidas, ultimo, 'oi')
      const sOd = semaforo(od?.mmPorAno ?? null, edad)
      const sOi = semaforo(oi?.mmPorAno ?? null, edad)
      color = peorSemaforo(sOd.color, sOi.color)
      const peor = sOd.color === color ? sOd : sOi
      texto = peor.etiqueta
    }

    const activos = listaTratamientos.filter(
      (t) => t.patientId === p.id && (!t.endDate || t.endDate >= hoy),
    )

    const porcentajes = activos
      .map((t) => {
        const registros: RegistroUso[] = listaUso
          .filter((u) => u.treatmentId === t.id)
          .map((u) => ({
            logDate: u.logDate,
            hours: u.hours,
            done: u.done,
            outdoorMinutes: u.outdoorMinutes,
            discomfort: u.discomfort,
          }))
        return resumenAdherencia(
          {
            id: t.id,
            type: t.type,
            startDate: t.startDate,
            endDate: t.endDate,
            adherenceGoal: t.adherenceGoal,
          },
          registros,
          30,
          hoy,
        ).porcentaje
      })
      .filter((x): x is number => x !== null)

    const citas = listaCitas.filter((c) => c.patientId === p.id)
    const vencidos = citas.filter((c) => estadoVigente(c.status, c.dueDate, hoy) === 'vencida')
    const proxima = citas.find(
      (c) => c.status === 'pendiente' && c.dueDate >= hoy,
    )

    return {
      id: p.id,
      nombre: `${p.firstName} ${p.lastName}`.trim(),
      edad: edadEnAnos(p.birthDate, hoy),
      tratamientosActivos: activos.map((t) => ({
        tipo: t.type,
        etiqueta: t.deviceLabel ?? t.concentration ?? '',
      })),
      ultimoControl: ultimo?.fecha ?? null,
      semaforoColor: color,
      semaforoTexto: texto,
      adherencia30:
        porcentajes.length > 0
          ? Math.round(porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length)
          : null,
      proximoControl: proxima ? { fecha: proxima.dueDate, etiqueta: proxima.label } : null,
      controlesVencidos: vencidos.length,
    }
  })
}

/** Todo lo que necesita la ficha del paciente, en una sola llamada. */
export async function fichaDePaciente(patientId: string) {
  const [paciente] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1)
  if (!paciente) return null

  const [listaTratamientos, listaExamenes, listaCitas, listaUso, listaConsentimientos, equipos] =
    await Promise.all([
      db
        .select()
        .from(treatments)
        .where(eq(treatments.patientId, patientId))
        .orderBy(desc(treatments.startDate)),
      db
        .select({
          exam: exams,
          biometerNombre: biometers.name,
        })
        .from(exams)
        .leftJoin(biometers, eq(exams.biometerId, biometers.id))
        .where(eq(exams.patientId, patientId))
        .orderBy(asc(exams.examDate)),
      db
        .select()
        .from(scheduledExams)
        .where(eq(scheduledExams.patientId, patientId))
        .orderBy(asc(scheduledExams.dueDate)),
      db
        .select()
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.patientId, patientId),
            sql`${usageLogs.logDate} >= current_date - interval '120 days'`,
          ),
        )
        .orderBy(desc(usageLogs.logDate)),
      db
        .select()
        .from(consents)
        .where(eq(consents.patientId, patientId))
        .orderBy(desc(consents.grantedAt)),
      db.select().from(biometers).where(eq(biometers.active, true)).orderBy(asc(biometers.name)),
    ])

  const hoy = aIso(new Date())

  const medidas: MedidaAxial[] = listaExamenes.map((e) => ({
    examId: e.exam.id,
    fecha: e.exam.examDate,
    alOd: aNumero(e.exam.alOd),
    alOi: aNumero(e.exam.alOi),
    biometerId: e.exam.biometerId,
    biometerNombre: e.biometerNombre,
  }))

  /** Por cada control, el crecimiento contra el anterior y contra hace 12 meses. */
  const controles = listaExamenes.map((fila, i) => {
    const actual = medidas[i]
    const anterior = i > 0 ? medidas[i - 1] : null
    const edad = edadEnAnos(paciente.birthDate, fila.exam.examDate)
    const doceOd = crecimiento12Meses(medidas, actual, 'od')
    const doceOi = crecimiento12Meses(medidas, actual, 'oi')
    return {
      ...fila.exam,
      biometerNombre: fila.biometerNombre,
      edad,
      entreControlesOd: anterior ? crecimientoEntre(anterior, actual, 'od') : null,
      entreControlesOi: anterior ? crecimientoEntre(anterior, actual, 'oi') : null,
      doceMesesOd: doceOd,
      doceMesesOi: doceOi,
      semaforoOd: semaforo(doceOd?.mmPorAno ?? null, edad),
      semaforoOi: semaforo(doceOi?.mmPorAno ?? null, edad),
      avisoAxial: avisoLongitudAxial(aNumero(fila.exam.alOd), aNumero(fila.exam.alOi)),
    }
  })

  const activos = listaTratamientos.filter((t) => !t.endDate || t.endDate >= hoy)

  const adherencia = activos.map((t) => {
    const registros: RegistroUso[] = listaUso
      .filter((u) => u.treatmentId === t.id)
      .map((u) => ({
        logDate: u.logDate,
        hours: u.hours,
        done: u.done,
        outdoorMinutes: u.outdoorMinutes,
        discomfort: u.discomfort,
      }))
    const entrada = {
      id: t.id,
      type: t.type,
      startDate: t.startDate,
      endDate: t.endDate,
      adherenceGoal: t.adherenceGoal,
    }
    return {
      tratamiento: t,
      siete: resumenAdherencia(entrada, registros, 7, hoy),
      treinta: resumenAdherencia(entrada, registros, 30, hoy),
      noventa: resumenAdherencia(entrada, registros, 90, hoy),
      registroDeHoy: registros.find((r) => r.logDate === hoy) ?? null,
    }
  })

  return {
    paciente,
    tratamientos: listaTratamientos,
    tratamientosActivos: activos,
    controles,
    citas: listaCitas.map((c) => ({ ...c, estadoVigente: estadoVigente(c.status, c.dueDate, hoy) })),
    adherencia,
    registrosUso: listaUso,
    consentimientos: listaConsentimientos,
    equipos,
    hoy,
  }
}

export type Ficha = NonNullable<Awaited<ReturnType<typeof fichaDePaciente>>>
