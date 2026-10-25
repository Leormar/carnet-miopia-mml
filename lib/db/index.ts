import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

/**
 * Durante `next build` puede no haber DATABASE_URL (por ejemplo al compilar sin
 * acceso a la base). Se usa una cadena marcador para que el build no falle: la
 * primera consulta real si falla, con un mensaje claro.
 */
const url = process.env.DATABASE_URL

if (!url && process.env.NODE_ENV === 'development') {
  console.warn(
    '[carnet-mml] Falta DATABASE_URL. Copie .env.example a .env.local y pegue la cadena de Neon.',
  )
}

/**
 * `cache: 'no-store'` es obligatorio. El cliente de Neon consulta por HTTP con
 * `fetch`, y Next.js guarda en su cache las respuestas de `fetch`: sin esto,
 * una pagina puede servir datos viejos. Se noto con un enlace compartido que
 * seguia abriendo despues de haber sido revocado. Nada clinico se cachea.
 */
const sql = neon(url ?? 'postgresql://sin-configurar:sin-configurar@localhost/sin-configurar', {
  fetchOptions: { cache: 'no-store' },
})

export const db = drizzle(sql, { schema })
export * from './schema'
