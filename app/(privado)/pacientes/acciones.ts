'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import {
  biometers,
  consents,
  examTreatmentFindings,
  exams,
  memberships,
  organizations,
  patientAccess,
  patients,
  scheduledExams,
  shareLinks,
  treatments,
  usageLogs,
} from '@/lib/db/schema'
import { requerirAccesoAPaciente, requerirAdmin, requerirAprobado } from '@/lib/auth/sesion'
import { registrarAuditoria } from '@/lib/auditoria/registrar'
import {
  desdeFormData,
  erroresDeZod,
  esquemaControl,
  esquemaEnlace,
  esquemaEquipo,
  esquemaPaciente,
  esquemaTratamiento,
  esquemaUso,
  type ResultadoAccion,
} from '@/lib/validacion/esquemas'
import { generarCalendario } from '@/lib/clinica/calendario'
import {
  huellaDeToken,
  nuevoToken,
  svgDelQr,
  urlDelEnlace,
} from '@/lib/compartir/enlaces'
import { TRATAMIENTOS, type TipoTratamiento } from '@/config/tratamientos'
import { SITIO } from '@/config/sitio'

const VERSION_CONSENTIMIENTO = 'v1-2026-10'

/** Organizacion por defecto. En el MVP hay una sola. */
async function organizacionDe(userId: string): Promise<string> {
  const [membresia] = await db
    .select({ orgId: memberships.orgId })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .limit(1)
  if (membresia) return membresia.orgId

  const [existente] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, 'mml'))
    .limit(1)

  const orgId =
    existente?.id ??
    (
      await db
        .insert(organizations)
        .values({ name: SITIO.organizacion, slug: 'mml' })
        .returning({ id: organizations.id })
    )[0].id

  await db.insert(memberships).values({ userId, orgId, role: 'professional' }).onConflictDoNothing()
  return orgId
}

// ---------------------------------------------------------------------------
// Pacientes
// ---------------------------------------------------------------------------


/**
 * Avisa si el nino ya esta registrado en esta organizacion. Busca primero por
 * documento, que es exacto, y luego por nombre y fecha de nacimiento, que es
 * la forma en que se duplica un paciente que todavia no tiene documento.
 */
async function pacienteYaExiste(
  orgId: string,
  d: { firstName: string; lastName: string; birthDate: string; documentNumber: string | null },
): Promise<ResultadoAccion | null> {
  if (d.documentNumber) {
    const [porDocumento] = await db
      .select({ id: patients.id, firstName: patients.firstName, lastName: patients.lastName })
      .from(patients)
      .where(
        and(eq(patients.orgId, orgId), eq(patients.documentNumber, d.documentNumber)),
      )
      .limit(1)

    if (porDocumento) {
      return {
        ok: false,
        error:
          `Ese documento ya esta registrado, a nombre de ${porDocumento.firstName} ` +
          `${porDocumento.lastName}. Abra esa historia en lugar de crear una nueva.`,
        campos: { documentNumber: 'Documento ya registrado' },
      }
    }
  }

  const [porNombre] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.orgId, orgId),
        sql`lower(${patients.firstName}) = lower(${d.firstName})`,
        sql`lower(${patients.lastName}) = lower(${d.lastName})`,
        eq(patients.birthDate, d.birthDate),
      ),
    )
    .limit(1)

  if (porNombre) {
    return {
      ok: false,
      error:
        'Ya hay un paciente con ese nombre y esa fecha de nacimiento. Si de verdad son dos ' +
        'ninos distintos, agregue el documento de identidad para diferenciarlos.',
      campos: { firstName: 'Puede estar repetido' },
    }
  }

  return null
}

export async function crearPaciente(
  _previo: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const sesion = await requerirAprobado()

  const crudo = desdeFormData(formData)
  if (crudo.consentAccepted !== 'on') {
    return {
      ok: false,
      error: 'Falta registrar el consentimiento',
      campos: {
        consentAccepted:
          'Debe confirmar que el padre, madre o representante autorizo el tratamiento de los datos',
      },
    }
  }

  const resultado = esquemaPaciente.safeParse(crudo)
  if (!resultado.success) {
    return { ok: false, error: 'Revise los campos marcados', campos: erroresDeZod(resultado.error) }
  }
  const d = resultado.data

  const orgId = await organizacionDe(sesion.user.id)

  // Un nino con dos historias es el error que este carnet existe para evitar:
  // la historia partida en dos pierde el crecimiento de los 12 meses.
  const duplicado = await pacienteYaExiste(orgId, d)
  if (duplicado) return duplicado

  const [paciente] = await db
    .insert(patients)
    .values({
      orgId,
      firstName: d.firstName,
      lastName: d.lastName,
      birthDate: d.birthDate,
      sex: d.sex,
      documentType: d.documentType,
      documentNumber: d.documentNumber,
      myopiaOnsetAge: d.myopiaOnsetAge === null ? null : String(d.myopiaOnsetAge),
      myopicParents: d.myopicParents,
      ophthalmologistName: d.ophthalmologistName,
      institutionName: d.institutionName,
      caregiverName: d.caregiverName,
      caregiverEmail: d.caregiverEmail,
      caregiverPhone: d.caregiverPhone,
      notes: d.notes,
      createdBy: sesion.user.id,
    })
    .returning({ id: patients.id })

  await db.insert(consents).values({
    patientId: paciente.id,
    version: VERSION_CONSENTIMIENTO,
    guardianName: d.consentGuardianName,
    guardianDocument: d.consentGuardianDocument,
    relationship: d.consentRelationship,
    method: d.consentMethod,
    grantedByUserId: sesion.user.id,
  })

  await db.insert(patientAccess).values({
    patientId: paciente.id,
    userId: sesion.user.id,
    role: 'treating_professional',
    grantedBy: sesion.user.id,
  })

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'create',
    entity: 'patient',
    entityId: paciente.id,
    patientId: paciente.id,
    diff: { firstName: d.firstName, lastName: d.lastName },
  })

  revalidatePath('/panel')
  redirect(`/pacientes/${paciente.id}/tratamientos/nuevo?primero=1`)
}

// ---------------------------------------------------------------------------
// Tratamientos
// ---------------------------------------------------------------------------

export async function crearTratamiento(
  patientId: string,
  _previo: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const { sesion } = await requerirAccesoAPaciente(patientId, ['profesional_tratante'])

  const resultado = esquemaTratamiento.safeParse(desdeFormData(formData))
  if (!resultado.success) {
    return { ok: false, error: 'Revise los campos marcados', campos: erroresDeZod(resultado.error) }
  }
  const d = resultado.data
  const tipo = d.type as TipoTratamiento

  const metaPorDefecto = TRATAMIENTOS[tipo].metaPorDefecto
  const meta: Record<string, number> = {}
  if (d.metaHorasPorDia !== null) meta.horasPorDia = d.metaHorasPorDia
  else if (metaPorDefecto.horasPorDia !== undefined) meta.horasPorDia = metaPorDefecto.horasPorDia
  if (d.metaDiasPorSemana !== null) meta.diasPorSemana = d.metaDiasPorSemana
  else if (metaPorDefecto.diasPorSemana !== undefined)
    meta.diasPorSemana = metaPorDefecto.diasPorSemana
  if (d.metaNochesPorSemana !== null) meta.nochesPorSemana = d.metaNochesPorSemana
  else if (metaPorDefecto.nochesPorSemana !== undefined)
    meta.nochesPorSemana = metaPorDefecto.nochesPorSemana

  const [tratamiento] = await db
    .insert(treatments)
    .values({
      patientId,
      type: tipo,
      deviceLabel: d.deviceLabel,
      concentration: d.concentration,
      startDate: d.startDate,
      endDate: d.endDate,
      changeReason: d.changeReason,
      prescribedBy: sesion.user.id,
      adherenceGoal: meta,
      calendarTemplateKey: d.calendarTemplateKey,
      notes: d.notes,
    })
    .returning({ id: treatments.id })

  if (d.generarCalendario) {
    const citas = generarCalendario(tipo, d.startDate, {
      claveePlantilla: d.calendarTemplateKey,
      horizonteMeses: 24,
    })
    if (citas.length > 0) {
      await db.insert(scheduledExams).values(
        citas.map((c) => ({
          patientId,
          treatmentId: tratamiento.id,
          dueDate: c.dueDate,
          label: `${TRATAMIENTOS[tipo].nombreCorto}: ${c.label}`,
          requires: c.requires,
        })),
      )
    }
  }

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'create',
    entity: 'treatment',
    entityId: tratamiento.id,
    patientId,
    diff: { tipo, startDate: d.startDate },
  })

  revalidatePath(`/pacientes/${patientId}`)
  revalidatePath('/panel')
  redirect(`/pacientes/${patientId}`)
}

export async function terminarTratamiento(patientId: string, formData: FormData) {
  const { sesion } = await requerirAccesoAPaciente(patientId, ['profesional_tratante'])
  const treatmentId = String(formData.get('treatmentId') ?? '')
  const endDate = String(formData.get('endDate') ?? '')
  const changeReason = String(formData.get('changeReason') ?? '').trim() || null
  if (!treatmentId || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return

  await db
    .update(treatments)
    .set({ endDate, changeReason, updatedAt: new Date() })
    .where(and(eq(treatments.id, treatmentId), eq(treatments.patientId, patientId)))

  // Las citas futuras de ese tratamiento dejan de estar pendientes.
  await db
    .update(scheduledExams)
    .set({ status: 'omitida' })
    .where(
      and(
        eq(scheduledExams.treatmentId, treatmentId),
        eq(scheduledExams.status, 'pendiente'),
        sql`${scheduledExams.dueDate} > ${endDate}`,
      ),
    )

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'update',
    entity: 'treatment',
    entityId: treatmentId,
    patientId,
    diff: { endDate, changeReason },
  })

  revalidatePath(`/pacientes/${patientId}`)
}

// ---------------------------------------------------------------------------
// Controles
// ---------------------------------------------------------------------------

export async function crearControl(
  patientId: string,
  _previo: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const { sesion } = await requerirAccesoAPaciente(patientId, ['profesional_tratante'])

  const resultado = esquemaControl.safeParse(desdeFormData(formData))
  if (!resultado.success) {
    return { ok: false, error: 'Revise los campos marcados', campos: erroresDeZod(resultado.error) }
  }
  const d = resultado.data
  const comoTexto = (n: number | null) => (n === null ? null : String(n))

  let examId: string
  try {
    const [examen] = await db
      .insert(exams)
      .values({
        patientId,
        examDate: d.examDate,
        performedBy: sesion.user.id,
        examType: d.examType,
        vaOd: d.vaOd,
        vaOi: d.vaOi,
        vaNotation: d.vaNotation,
        cycloplegic: d.cycloplegic,
        sphereOd: comoTexto(d.sphereOd),
        cylOd: comoTexto(d.cylOd),
        axisOd: d.axisOd,
        sphereOi: comoTexto(d.sphereOi),
        cylOi: comoTexto(d.cylOi),
        axisOi: d.axisOi,
        alOd: comoTexto(d.alOd),
        alOi: comoTexto(d.alOi),
        biometerId: d.biometerId,
        reportedHoursPerDay: comoTexto(d.reportedHoursPerDay),
        outdoorHoursPerDay: comoTexto(d.outdoorHoursPerDay),
        screenHoursPerDay: comoTexto(d.screenHoursPerDay),
        adverseEvents: d.adverseEvents,
        decision: d.decision,
        fundusDone: d.fundusDone,
        nextExamDate: d.nextExamDate,
      })
      .returning({ id: exams.id })
    examId = examen.id
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : ''
    if (mensaje.includes('exam_patient_date_unico')) {
      return {
        ok: false,
        error: 'Ya hay un control registrado en esa fecha',
        campos: { examDate: 'Ya existe un control de este paciente en esta fecha' },
      }
    }
    throw error
  }

  // Hallazgos especificos de cada tratamiento activo, segun su tipo.
  const activos = await db.select().from(treatments).where(eq(treatments.patientId, patientId))
  for (const t of activos) {
    if (t.endDate && t.endDate < d.examDate) continue
    const campos = TRATAMIENTOS[t.type].hallazgos
    const data: Record<string, string | number | null> = {}
    let hayAlgo = false
    for (const campo of campos) {
      const valor = formData.get(`hallazgo_${t.id}_${campo.clave}`)
      if (typeof valor === 'string' && valor.trim() !== '') {
        data[campo.clave] =
          campo.tipo === 'numero' ? Number(valor.replace(',', '.')) : valor.trim()
        hayAlgo = true
      }
    }
    if (hayAlgo) {
      await db
        .insert(examTreatmentFindings)
        .values({ examId, treatmentId: t.id, data })
        .onConflictDoNothing()
    }
  }

  // La cita pendiente mas cercana a esta fecha queda cumplida.
  const pendientes = await db
    .select()
    .from(scheduledExams)
    .where(and(eq(scheduledExams.patientId, patientId), eq(scheduledExams.status, 'pendiente')))
  if (pendientes.length > 0) {
    const cercana = pendientes
      .map((c) => ({
        c,
        distancia: Math.abs(new Date(c.dueDate).getTime() - new Date(d.examDate).getTime()),
      }))
      .sort((a, b) => a.distancia - b.distancia)[0]
    // Solo si la cita cae dentro de 45 dias del control registrado.
    if (cercana.distancia <= 45 * 86_400_000) {
      await db
        .update(scheduledExams)
        .set({ status: 'cumplida', examId })
        .where(eq(scheduledExams.id, cercana.c.id))
    }
  }

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'create',
    entity: 'exam',
    entityId: examId,
    patientId,
    diff: { examDate: d.examDate, alOd: d.alOd, alOi: d.alOi },
  })

  revalidatePath(`/pacientes/${patientId}`)
  revalidatePath('/panel')
  redirect(`/pacientes/${patientId}`)
}

// ---------------------------------------------------------------------------
// Registro diario de uso
// ---------------------------------------------------------------------------

export async function registrarUso(
  patientId: string,
  formData: FormData,
): Promise<ResultadoAccion> {
  const { sesion, nivel } = await requerirAccesoAPaciente(patientId, [
    'profesional_tratante',
    'familia',
  ])

  const resultado = esquemaUso.safeParse(desdeFormData(formData))
  if (!resultado.success) {
    return { ok: false, error: 'Revise los campos', campos: erroresDeZod(resultado.error) }
  }
  const d = resultado.data

  await db
    .insert(usageLogs)
    .values({
      patientId,
      treatmentId: d.treatmentId,
      logDate: d.logDate,
      hours: d.hours === null ? null : String(d.hours),
      done: d.done,
      outdoorMinutes: d.outdoorMinutes,
      discomfort: d.discomfort,
      discomfortNote: d.discomfortNote,
      loggedBy: sesion.user.id,
      source: nivel === 'familia' ? 'familia' : 'profesional',
    })
    .onConflictDoUpdate({
      target: [usageLogs.treatmentId, usageLogs.logDate],
      set: {
        hours: d.hours === null ? null : String(d.hours),
        done: d.done,
        outdoorMinutes: d.outdoorMinutes,
        discomfort: d.discomfort,
        discomfortNote: d.discomfortNote,
        loggedBy: sesion.user.id,
        updatedAt: new Date(),
      },
    })

  revalidatePath(`/pacientes/${patientId}`)
  revalidatePath(`/mi-carnet/${patientId}`)
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Equipos de biometria
// ---------------------------------------------------------------------------

export async function crearEquipo(
  _previo: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const sesion = await requerirAprobado()
  const resultado = esquemaEquipo.safeParse(desdeFormData(formData))
  if (!resultado.success) {
    return { ok: false, error: 'Revise los campos', campos: erroresDeZod(resultado.error) }
  }
  const orgId = await organizacionDe(sesion.user.id)
  const [equipo] = await db
    .insert(biometers)
    .values({ orgId, name: resultado.data.name, serial: resultado.data.serial })
    .returning({ id: biometers.id })

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'create',
    entity: 'biometer',
    entityId: equipo.id,
  })

  revalidatePath('/ajustes/equipos')
  return { ok: true, id: equipo.id }
}

export async function desactivarEquipo(formData: FormData) {
  const sesion = await requerirAprobado()
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await db.update(biometers).set({ active: false }).where(eq(biometers.id, id))
  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'update',
    entity: 'biometer',
    entityId: id,
    diff: { active: false },
  })
  revalidatePath('/ajustes/equipos')
}

// ---------------------------------------------------------------------------
// Enlaces de solo lectura para oftalmopediatria
// ---------------------------------------------------------------------------

export type ResultadoEnlace =
  | { ok: true; url: string; svg: string; etiqueta: string | null; vence: string }
  | { ok: false; error: string; campos?: Record<string, string> }

/**
 * Crea el enlace y devuelve el token una sola vez, dentro del resultado de la
 * accion. No viaja por la URL ni queda en el historial del navegador: de la
 * base de datos solo se puede recuperar su huella.
 *
 * Lo puede generar el profesional tratante o la familia, como dice el carnet.
 */
export async function crearEnlaceCompartido(
  patientId: string,
  _previo: ResultadoEnlace | null,
  formData: FormData,
): Promise<ResultadoEnlace> {
  const { sesion } = await requerirAccesoAPaciente(patientId, [
    'profesional_tratante',
    'familia',
  ])

  const resultado = esquemaEnlace.safeParse(desdeFormData(formData))
  if (!resultado.success) {
    return {
      ok: false,
      error: 'Revise los datos del enlace',
      campos: erroresDeZod(resultado.error),
    }
  }

  const { label, dias } = resultado.data
  const token = nuevoToken()
  const vence = new Date(Date.now() + dias * 24 * 60 * 60 * 1000)

  const [fila] = await db
    .insert(shareLinks)
    .values({
      patientId,
      tokenHash: huellaDeToken(token),
      label,
      createdBy: sesion.user.id,
      expiresAt: vence,
    })
    .returning({ id: shareLinks.id })

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'share',
    entity: 'share_link',
    entityId: fila.id,
    patientId,
    diff: { dias, etiqueta: label },
  })

  revalidatePath(`/pacientes/${patientId}/compartir`)

  const url = urlDelEnlace(token)
  return { ok: true, url, svg: svgDelQr(url), etiqueta: label, vence: vence.toISOString() }
}

/** Corta el acceso de inmediato. Un enlace revocado no vuelve a servir. */
export async function revocarEnlaceCompartido(patientId: string, formData: FormData) {
  const { sesion } = await requerirAccesoAPaciente(patientId, [
    'profesional_tratante',
    'familia',
  ])

  const id = String(formData.get('shareLinkId') ?? '')
  if (!id) return

  const revocados = await db
    .update(shareLinks)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(shareLinks.id, id),
        eq(shareLinks.patientId, patientId),
        isNull(shareLinks.revokedAt),
      ),
    )
    .returning({ id: shareLinks.id })

  if (revocados.length > 0) {
    await registrarAuditoria({
      actorUserId: sesion.user.id,
      action: 'revoke',
      entity: 'share_link',
      entityId: id,
      patientId,
    })
  }

  revalidatePath(`/pacientes/${patientId}/compartir`)
}

// ---------------------------------------------------------------------------
// Derechos del titular: copia, correccion, revocacion y supresion
// ---------------------------------------------------------------------------

/**
 * Revoca el consentimiento del representante legal.
 *
 * No borra nada: deja constancia de que la autorizacion ya no esta vigente y
 * archiva al paciente, para que nadie siga registrando datos sobre un nino
 * cuya familia retiro el permiso. La supresion es un paso aparte y la hace un
 * administrador.
 */
export async function revocarConsentimiento(patientId: string, formData: FormData) {
  const { sesion } = await requerirAccesoAPaciente(patientId, ['profesional_tratante'])
  const motivo = String(formData.get('motivo') ?? '').trim() || null

  const [vigente] = await db
    .select({ id: consents.id })
    .from(consents)
    .where(and(eq(consents.patientId, patientId), isNull(consents.revokedAt)))
    .orderBy(desc(consents.grantedAt))
    .limit(1)

  if (vigente) {
    await db.update(consents).set({ revokedAt: new Date() }).where(eq(consents.id, vigente.id))
  }

  await db
    .update(patients)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(patients.id, patientId))

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'revoke',
    entity: 'consent',
    entityId: vigente?.id ?? null,
    patientId,
    diff: { motivo, archivado: true },
  })

  revalidatePath(`/pacientes/${patientId}/privacidad`)
  revalidatePath('/panel')
}

/** Saca al paciente del panel sin borrar nada. Se puede deshacer. */
export async function archivarPaciente(patientId: string, formData: FormData) {
  const { sesion } = await requerirAccesoAPaciente(patientId, ['profesional_tratante'])
  const motivo = String(formData.get('motivo') ?? '').trim() || null

  await db
    .update(patients)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(patients.id, patientId))

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'update',
    entity: 'patient',
    entityId: patientId,
    patientId,
    diff: { archivado: true, motivo },
  })

  revalidatePath(`/pacientes/${patientId}/privacidad`)
  revalidatePath('/panel')
}

export async function restaurarPaciente(patientId: string) {
  const { sesion } = await requerirAccesoAPaciente(patientId, ['profesional_tratante'])

  await db
    .update(patients)
    .set({ archivedAt: null, updatedAt: new Date() })
    .where(eq(patients.id, patientId))

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'update',
    entity: 'patient',
    entityId: patientId,
    patientId,
    diff: { archivado: false },
  })

  revalidatePath(`/pacientes/${patientId}/privacidad`)
  revalidatePath('/panel')
}

/**
 * Supresion definitiva. Borra el paciente y, en cascada, sus controles,
 * tratamientos, registros de uso, citas, accesos y enlaces compartidos.
 *
 * Solo un administrador, y solo escribiendo el nombre completo del paciente.
 * La anotacion en la bitacora se escribe antes de borrar, con el nombre
 * dentro, porque despues ya no habria a quien referirse.
 */
export async function suprimirPaciente(patientId: string, formData: FormData) {
  const sesion = await requerirAdmin()
  const confirmacion = String(formData.get('confirmacion') ?? '').trim()
  const motivo = String(formData.get('motivo') ?? '').trim() || null

  const [paciente] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1)
  if (!paciente) redirect('/panel')

  const nombre = `${paciente.firstName} ${paciente.lastName}`.trim()
  if (confirmacion.toLowerCase() !== nombre.toLowerCase()) {
    redirect(`/pacientes/${patientId}/privacidad?error=confirmacion`)
  }

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'delete',
    entity: 'patient',
    entityId: patientId,
    patientId: null,
    diff: {
      nombre,
      fechaNacimiento: paciente.birthDate,
      documento: paciente.documentNumber,
      motivo,
      suprimidoEl: new Date().toISOString(),
    },
  })

  await db.delete(patients).where(eq(patients.id, patientId))

  revalidatePath('/panel')
  redirect('/panel?suprimido=1')
}
