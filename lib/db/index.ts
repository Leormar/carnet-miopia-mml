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

const sql = neon(url ?? 'postgresql://sin-configurar:sin-configurar@localhost/sin-configurar')

export const db = drizzle(sql, { schema })
export * from './schema'
