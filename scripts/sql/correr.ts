/**
 * Corre un archivo .sql suelto contra la base.
 *
 * Es para los arreglos de datos que no cambian el esquema y que por eso
 * drizzle-kit no genera: se escriben a mano en esta carpeta, con fecha en el
 * nombre, y quedan versionados para saber que se corrio y cuando.
 *
 *   npx tsx scripts/sql/correr.ts scripts/sql/0001-cicloplejia.sql
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function principal() {
  const ruta = process.argv[2]
  if (!ruta) throw new Error('Falta la ruta del archivo .sql')

  const texto = readFileSync(resolve(ruta), 'utf8')
  // Las sentencias se separan por punto y coma al final de una linea. Los
  // comentarios se van porque el driver http manda una sentencia por viaje.
  const sentencias = texto
    .split('\n')
    .filter((l) => !l.trimStart().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)

  const sql = neon(process.env.DATABASE_URL!)
  for (let i = 0; i < sentencias.length; i += 1) {
    await sql(sentencias[i])
    console.log(`  ${i + 1}/${sentencias.length} lista`)
  }
  console.log(`${ruta}: ${sentencias.length} sentencias`)
}

principal()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e.message ?? e)
    process.exit(1)
  })
