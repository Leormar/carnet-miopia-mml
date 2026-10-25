/**
 * Carga inicial: la organizacion y las plantillas de calendario de control.
 * Es idempotente: se puede correr varias veces sin duplicar nada.
 *
 *   npm run db:seed
 */

import { config } from 'dotenv'
import { eq } from 'drizzle-orm'

// El entorno se carga antes de importar el cliente de base de datos: los
// `import` de arriba se ejecutan primero, asi que el de `lib/db` va adentro.
config({ path: '.env.local' })

async function principal() {
  const { db } = await import('../lib/db')
  const { followupTemplateItems, followupTemplates, organizations } = await import(
    '../lib/db/schema'
  )
  const { PLANTILLAS_BASE } = await import('../config/calendarios-control')
  const { SITIO } = await import('../config/sitio')

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
