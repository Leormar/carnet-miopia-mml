/**
 * Enlaces y codigos QR de solo lectura, para oftalmopediatria.
 *
 * El token viaja en la URL y dentro del QR. En la base de datos queda solo su
 * huella SHA-256: un enlace extraviado no se puede recuperar, se revoca y se
 * genera otro. Todo enlace vence y es revocable, y cada apertura queda en la
 * bitacora de auditoria (Ley 1581 de 2012 y Decreto 1377 de 2013).
 */

import { createHash, randomBytes } from 'crypto'
import qrcode from 'qrcode-generator'
import { desc, eq, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { shareLinks } from '@/lib/db/schema'
import { SITIO } from '@/config/sitio'

export { DIAS_MAXIMO, DIAS_POR_DEFECTO, DURACIONES } from '@/config/compartir'

/** 24 bytes son 192 bits de azar y dejan el QR pequeno de imprimir. */
export function nuevoToken(): string {
  return randomBytes(24).toString('base64url')
}

export function huellaDeToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function urlDelEnlace(token: string): string {
  return `${SITIO.url}/c/${token}`
}

/**
 * El QR como SVG, dibujado modulo a modulo para controlar el color y que
 * quede nitido al imprimirlo a cualquier tamano.
 */
export function svgDelQr(texto: string, margen = 4): string {
  const qr = qrcode(0, 'M')
  qr.addData(texto)
  qr.make()

  const modulos = qr.getModuleCount()
  const lado = modulos + margen * 2

  let trazo = ''
  for (let fila = 0; fila < modulos; fila += 1) {
    for (let columna = 0; columna < modulos; columna += 1) {
      if (qr.isDark(fila, columna)) {
        trazo += `M${columna + margen} ${fila + margen}h1v1h-1z`
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}"`,
    ' width="100%" height="100%" shape-rendering="crispEdges" role="img"',
    ' aria-label="Codigo QR del enlace de solo lectura">',
    `<rect width="${lado}" height="${lado}" fill="#ffffff"/>`,
    `<path d="${trazo}" fill="#111c26"/>`,
    '</svg>',
  ].join('')
}

/** Forma del token, para no consultar la base de datos con basura. */
const FORMA_TOKEN = /^[A-Za-z0-9_-]{16,128}$/

/**
 * El enlace, solo si existe, no fue revocado y no ha vencido.
 * La busqueda es por huella, nunca por el token en claro.
 */
export async function enlaceVigente(token: string) {
  if (!FORMA_TOKEN.test(token)) return null

  const [fila] = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.tokenHash, huellaDeToken(token)))
    .limit(1)

  if (!fila) return null
  if (fila.revokedAt) return null
  if (fila.expiresAt.getTime() <= Date.now()) return null
  return fila
}

/** Deja constancia de la apertura en el propio enlace. */
export async function registrarApertura(id: string) {
  await db
    .update(shareLinks)
    .set({ lastUsedAt: new Date(), useCount: sql`${shareLinks.useCount} + 1` })
    .where(eq(shareLinks.id, id))
}

export type EstadoEnlace = 'vigente' | 'revocado' | 'vencido'

export function estadoDelEnlace(fila: {
  revokedAt: Date | null
  expiresAt: Date
}): EstadoEnlace {
  if (fila.revokedAt) return 'revocado'
  if (fila.expiresAt.getTime() <= Date.now()) return 'vencido'
  return 'vigente'
}

/** Todos los enlaces de un paciente, el mas nuevo primero. */
export async function enlacesDePaciente(patientId: string) {
  const filas = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.patientId, patientId))
    .orderBy(desc(shareLinks.createdAt))

  return filas.map((f) => ({ ...f, estado: estadoDelEnlace(f) }))
}
