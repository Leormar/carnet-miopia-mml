'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { professionalCredentials, userAgreements } from '@/lib/db/schema'
import { requerirAprobadoSinCompuertas } from '@/lib/auth/sesion'
import { registrarAuditoria } from '@/lib/auditoria/registrar'
import { CASILLAS_COMPROMISO, VERSION_COMPROMISO } from '@/config/compromiso'
import { ARCHIVO_CREDENCIAL, PAISES, TIPOS_DE_CREDENCIAL } from '@/config/paises'
import type { ResultadoAccion } from '@/lib/validacion/esquemas'

/** Firma del compromiso de manejo de informacion. */
export async function firmarCompromiso(
  _previo: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const sesion = await requerirAprobadoSinCompuertas()

  const faltan = CASILLAS_COMPROMISO.filter((_, i) => formData.get(`casilla-${i}`) !== 'on')
  if (faltan.length > 0) {
    return { ok: false, error: 'Debe marcar las tres casillas para continuar.' }
  }

  const cabeceras = headers()
  await db
    .insert(userAgreements)
    .values({
      userId: sesion.user.id,
      kind: 'manejo_informacion',
      version: VERSION_COMPROMISO,
      ip: cabeceras.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: cabeceras.get('user-agent'),
    })
    .onConflictDoNothing()

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'create',
    entity: 'user_agreement',
    entityId: sesion.user.id,
    diff: { version: VERSION_COMPROMISO },
  })

  redirect('/acceso/credencial')
}

/** Carga del documento que acredita el ejercicio profesional. */
export async function subirCredencial(
  _previo: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const sesion = await requerirAprobadoSinCompuertas()

  const pais = String(formData.get('country') ?? '').trim()
  const tipo = String(formData.get('documentType') ?? '').trim()
  const nombreOficial = String(formData.get('officialName') ?? '').trim()
  const numero = String(formData.get('documentNumber') ?? '').trim()
  const entidad = String(formData.get('issuedBy') ?? '').trim()
  const archivo = formData.get('archivo')

  const campos: Record<string, string> = {}
  if (!PAISES.includes(pais as (typeof PAISES)[number])) campos.country = 'Elija el pais donde ejerce'
  if (!TIPOS_DE_CREDENCIAL.some((t) => t.valor === tipo)) {
    campos.documentType = 'Elija que documento va a subir'
  }
  if (nombreOficial.length < 3) {
    campos.officialName = 'Escriba como se llama ese documento en su pais'
  }
  if (!(archivo instanceof File) || archivo.size === 0) {
    campos.archivo = 'Adjunte el documento'
  } else if (!ARCHIVO_CREDENCIAL.tiposMime.includes(archivo.type as never)) {
    campos.archivo = `Solo se aceptan ${ARCHIVO_CREDENCIAL.extensiones}`
  } else if (archivo.size > ARCHIVO_CREDENCIAL.maximoBytes) {
    campos.archivo = `El archivo supera los ${ARCHIVO_CREDENCIAL.maximoTexto}`
  }

  if (Object.keys(campos).length > 0) {
    return { ok: false, error: 'Revise los datos del documento', campos }
  }

  const documento = archivo as File
  const contenido = Buffer.from(await documento.arrayBuffer()).toString('base64')

  const [fila] = await db
    .insert(professionalCredentials)
    .values({
      userId: sesion.user.id,
      country: pais,
      documentType: `${TIPOS_DE_CREDENCIAL.find((t) => t.valor === tipo)?.texto}: ${nombreOficial}`,
      documentNumber: numero || null,
      issuedBy: entidad || null,
      fileName: documento.name.slice(0, 200),
      mimeType: documento.type,
      sizeBytes: documento.size,
      content: contenido,
      status: 'pendiente',
    })
    .returning({ id: professionalCredentials.id })

  await registrarAuditoria({
    actorUserId: sesion.user.id,
    action: 'create',
    entity: 'professional_credential',
    entityId: fila.id,
    diff: { pais, tipo, archivo: documento.name, bytes: documento.size },
  })

  redirect('/panel')
}

/** La ultima credencial cargada por esta persona, sin el archivo. */
export async function ultimaCredencial(userId: string) {
  const [fila] = await db
    .select({
      id: professionalCredentials.id,
      country: professionalCredentials.country,
      documentType: professionalCredentials.documentType,
      fileName: professionalCredentials.fileName,
      status: professionalCredentials.status,
      uploadedAt: professionalCredentials.uploadedAt,
      rejectionReason: professionalCredentials.rejectionReason,
    })
    .from(professionalCredentials)
    .where(eq(professionalCredentials.userId, userId))
    .orderBy(desc(professionalCredentials.uploadedAt))
    .limit(1)
  return fila ?? null
}
