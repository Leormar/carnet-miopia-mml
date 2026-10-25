/**
 * Carga inicial: la organizacion y las plantillas de calendario de control.
 * Es idempotente: se puede correr varias veces sin duplicar nada.
 *
 *   npm run db:seed
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { followupTemplateItems, followupTemplates, organizations } from '../lib/db/schema'
import { PLANTILLAS_BASE } from '../config/calendarios-control'
import { SITIO } from '../config/sitio'

async function principal() {
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

  console.log(`Organizacion: ${orgId}`)

  for (const plantilla of PLANTILLAS_BASE) {
    const [ya] = await db
      .select({ id: followupTemplates.id })
      .from(followupTemplates)
      .where(eq(followupTemplates.key, plantilla.clave))
      .limit(1)

    if (ya) {
      console.log(`  ya existe: ${plantilla.clave}`)
      continue
    }

    const [fila] = await db
      .insert(followupTemplates)
      .values({
        // Las plantillas del Consejo Mundial de Optometria son base (sin org).
        orgId: plantilla.clave.startsWith('prolens-') ? orgId : null,
        key: plantilla.clave,
        name: plantilla.nombre,
        treatmentType: plantilla.tipo,
        isDefault: plantilla.clave === 'prolens-ortok',
        sourceNote: plantilla.fuente,
        everyDaysAfter: plantilla.cadaDiasDespues,
      })
      .returning({ id: followupTemplates.id })

    await db.insert(followupTemplateItems).values(
      plantilla.items.map((item, i) => ({
        templateId: fila.id,
        offsetDays: item.offsetDias,
        label: item.etiqueta,
        position: i,
        requires: item.requiere,
      })),
    )

    console.log(`  creada: ${plantilla.clave} (${plantilla.items.length} controles)`)
  }

  console.log('Listo.')
}

principal().catch((error) => {
  console.error(error)
  process.exit(1)
})
