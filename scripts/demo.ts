/**
 * Paciente de demostracion: una historia completa de 18 meses, para mostrar la
 * aplicacion sin usar datos de un niño real.
 *
 *   npx tsx scripts/demo.ts                      crear o actualizar
 *   npx tsx scripts/demo.ts --borrar             quitarlo
 *   npx tsx scripts/demo.ts correo@ejemplo.org   asignarselo a ese profesional
 *
 * Los numeros de aqui son inventados a proposito y no vienen de ningun
 * paciente. Son coherentes entre si para que las cuentas de la aplicacion den
 * algo creible, pero no son evidencia de nada: la aplicacion los muestra con el
 * aviso de demostracion encima. Nunca use esta historia para ilustrar un
 * resultado clinico.
 *
 * Que historia cuenta, y por que esa:
 *   - Empieza con gafas de control a los 8 años. Al año, el ojo habia crecido
 *     0,31 mm: semaforo rojo, y la adherencia reportada era baja.
 *   - Se revisa el uso antes de cambiar nada, que es lo que la aplicacion
 *     recomienda. El uso no mejora.
 *   - Entonces se pasa a orto-k. En los ultimos 6 meses el crecimiento baja.
 * Es la historia que el producto existe para hacer visible.
 */

import { config } from 'dotenv'
import { and, eq } from 'drizzle-orm'

config({ path: '.env.local' })

const MARCA_DEMO = 'demostracion'

/** Hoy, en ISO, sin horas. */
function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}

function menosDias(dias: number): string {
  const f = new Date()
  f.setUTCDate(f.getUTCDate() - dias)
  return f.toISOString().slice(0, 10)
}

async function principal() {
  const borrar = process.argv.includes('--borrar')
  const correo = process.argv.slice(2).find((a) => a.includes('@'))

  const { db } = await import('../lib/db')
  const {
    biometers,
    consents,
    exams,
    examTreatmentFindings,
    organizations,
    patientAccess,
    patients,
    scheduledExams,
    treatments,
    usageLogs,
    users,
  } = await import('../lib/db/schema')
  const { generarCalendario } = await import('../lib/clinica/calendario')

  // ---------------------------------------------------------------- limpieza
  const [existente] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(and(eq(patients.documentType, MARCA_DEMO), eq(patients.documentNumber, 'MML-DEMO')))
    .limit(1)

  if (existente) {
    // En cascada se van tratamientos, controles, citas, usos y consentimientos.
    await db.delete(patients).where(eq(patients.id, existente.id))
    console.log('Paciente de demostracion anterior: borrado')
  }
  if (borrar) {
    console.log('Listo. No queda paciente de demostracion.')
    return
  }

  // ------------------------------------------------------------ a quien va
  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, 'mml'))
    .limit(1)
  if (!org) throw new Error('No existe la organizacion mml. Corra antes: npm run db:seed')

  const profesional = correo
    ? (await db.select().from(users).where(eq(users.email, correo)).limit(1))[0]
    : (await db.select().from(users).limit(1))[0]
  if (!profesional) {
    throw new Error(
      correo
        ? `No hay ningun usuario con el correo ${correo}. Entre una vez a la aplicacion con esa cuenta.`
        : 'No hay ningun usuario todavia. Entre una vez a la aplicacion y vuelva a correr esto.',
    )
  }
  console.log(`Profesional: ${profesional.email}`)

  // ------------------------------------------------------------- biometro
  let [biometro] = await db
    .select()
    .from(biometers)
    .where(and(eq(biometers.orgId, org.id), eq(biometers.name, 'IOLMaster 700 (demostración)')))
    .limit(1)
  if (!biometro) {
    ;[biometro] = await db
      .insert(biometers)
      .values({ orgId: org.id, name: 'IOLMaster 700 (demostración)' })
      .returning()
  }

  // ------------------------------------------------------------- el niño
  // Nace hace 9 años y 7 meses: tenia 8 cuando empezo el tratamiento, y hoy
  // esta en el tramo de 7 a 10 años del semaforo.
  const nacimiento = menosDias(Math.round(9.6 * 365.25))

  const [paciente] = await db
    .insert(patients)
    .values({
      orgId: org.id,
      firstName: 'Luciana',
      lastName: 'Ejemplo',
      documentType: MARCA_DEMO,
      documentNumber: 'MML-DEMO',
      birthDate: nacimiento,
      sex: 'femenino',
      myopiaOnsetAge: '7.5',
      myopicParents: 2,
      ophthalmologistName: 'Oftalmología pediátrica (ejemplo)',
      institutionName: 'Consulta de demostración',
      caregiverName: 'Madre (ejemplo)',
      notes:
        'Paciente de demostración del Grupo Manejo Miopía Latam. Los datos son inventados y sirven solo para mostrar como se ve la aplicación.',
      createdBy: profesional.id,
    })
    .returning()

  await db.insert(patientAccess).values({
    patientId: paciente.id,
    userId: profesional.id,
    role: 'treating_professional',
    grantedBy: profesional.id,
  })

  await db.insert(consents).values({
    patientId: paciente.id,
    version: 'v1-2026-10',
    guardianName: 'Madre (ejemplo)',
    relationship: 'Madre',
    method: 'en_consulta',
    grantedByUserId: profesional.id,
    grantedAt: new Date(`${menosDias(548)}T15:00:00Z`),
  })

  // -------------------------------------------------------- tratamientos
  // Gafas de control: hace 18 meses, cerradas hace 6 por crecimiento alto.
  const inicioGafas = menosDias(548)
  const finGafas = menosDias(183)
  const [gafas] = await db
    .insert(treatments)
    .values({
      patientId: paciente.id,
      type: 'gafas',
      deviceLabel: 'Lente de control de miopía (sin marca, demostración)',
      startDate: inicioGafas,
      endDate: finGafas,
      changeReason:
        'Crecimiento de 0,31 mm en 12 meses con uso reportado por debajo de la meta. Se reviso el uso durante 3 meses sin mejora y se cambio de tratamiento.',
      prescribedBy: profesional.id,
      adherenceGoal: { horasPorDia: 12, diasPorSemana: 7 },
      notes: null,
    })
    .returning()

  // Orto-k: hace 6 meses, activo.
  const inicioOrtok = menosDias(183)
  const [ortok] = await db
    .insert(treatments)
    .values({
      patientId: paciente.id,
      type: 'ortok',
      deviceLabel: 'Lente de ortoqueratología (sin marca, demostración)',
      startDate: inicioOrtok,
      prescribedBy: profesional.id,
      adherenceGoal: { nochesPorSemana: 7 },
    })
    .returning()

  // ------------------------------------------------------------ controles
  // La longitud axial sube rapido con gafas y se frena con orto-k.
  // OD empieza en 23,90 y OI en 23,84.
  const controles: {
    diasAtras: number
    alOd: string
    alOi: string
    esfOd: string
    esfOi: string
    horas: string | null
    tratamiento: 'gafas' | 'ortok'
    etiqueta: string
    decision: string
  }[] = [
    {
      diasAtras: 548,
      alOd: '23.90',
      alOi: '23.84',
      esfOd: '-1.75',
      esfOi: '-1.50',
      horas: null,
      tratamiento: 'gafas',
      etiqueta: 'Línea de base',
      decision: 'Se inicia gafas de control de miopía. Meta de uso: 12 horas al día.',
    },
    {
      diasAtras: 518,
      alOd: '23.93',
      alOi: '23.87',
      esfOd: '-1.75',
      esfOi: '-1.50',
      horas: '9.0',
      tratamiento: 'gafas',
      etiqueta: '1 mes',
      decision: 'Adaptación buena. Se insiste en el uso durante todo el día.',
    },
    {
      diasAtras: 365,
      alOd: '24.07',
      alOi: '24.00',
      esfOd: '-2.25',
      esfOi: '-2.00',
      horas: '8.5',
      tratamiento: 'gafas',
      etiqueta: '6 meses',
      decision: 'Crecimiento por encima de lo esperado. Se revisa el uso antes de cambiar nada.',
    },
    {
      diasAtras: 183,
      alOd: '24.21',
      alOi: '24.14',
      esfOd: '-2.75',
      esfOi: '-2.50',
      horas: '8.0',
      tratamiento: 'gafas',
      etiqueta: '1 año',
      decision:
        'Crecimiento de 0,31 mm en 12 meses con uso por debajo de la meta durante todo el año. Se cambia a ortoqueratología.',
    },
    {
      diasAtras: 176,
      alOd: '24.21',
      alOi: '24.14',
      esfOd: '-2.75',
      esfOi: '-2.50',
      horas: null,
      tratamiento: 'ortok',
      etiqueta: 'Primera noche',
      decision: 'Primera noche con los lentes puestos. Control a la mañana siguiente.',
    },
    {
      diasAtras: 168,
      alOd: '24.22',
      alOi: '24.15',
      esfOd: '-0.50',
      esfOi: '-0.25',
      horas: null,
      tratamiento: 'ortok',
      etiqueta: '1 semana',
      decision: 'Centrado correcto. Córnea sin alteraciones.',
    },
    {
      diasAtras: 152,
      alOd: '24.23',
      alOi: '24.16',
      esfOd: '-0.25',
      esfOi: '0.00',
      horas: null,
      tratamiento: 'ortok',
      etiqueta: '1 mes',
      decision: 'Visión estable durante el día. Se continua igual.',
    },
    {
      diasAtras: 92,
      alOd: '24.25',
      alOi: '24.18',
      esfOd: '-0.25',
      esfOi: '0.00',
      horas: null,
      tratamiento: 'ortok',
      etiqueta: '3 meses',
      decision: 'Crecimiento más lento que con el tratamiento anterior. Se continua.',
    },
    {
      diasAtras: 7,
      alOd: '24.27',
      alOi: '24.20',
      esfOd: '-0.25',
      esfOi: '0.00',
      horas: null,
      tratamiento: 'ortok',
      etiqueta: '6 meses',
      decision:
        'Crecimiento de 0,12 mm en los últimos 12 meses, dentro de lo esperado para la edad. Se continua y se revisa en 6 meses.',
    },
  ]

  for (const c of controles) {
    const fecha = menosDias(c.diasAtras)
    const [control] = await db
      .insert(exams)
      .values({
        patientId: paciente.id,
        examDate: fecha,
        performedBy: profesional.id,
        examType: 'rutina',
        vaOd: '20/20',
        vaOi: '20/20',
        vaNotation: 'snellen_20',
        cycloplegic: true,
        sphereOd: c.esfOd,
        cylOd: '-0.50',
        axisOd: 180,
        sphereOi: c.esfOi,
        cylOi: '-0.25',
        axisOi: 175,
        alOd: c.alOd,
        alOi: c.alOi,
        biometerId: biometro.id,
        reportedHoursPerDay: c.horas,
        outdoorHoursPerDay: '1.0',
        screenHoursPerDay: '3.0',
        decision: c.decision,
        fundusDone: c.etiqueta === '1 año',
        nextExamDate: null,
      })
      .returning()

    const esGafas = c.tratamiento === 'gafas'
    await db.insert(examTreatmentFindings).values({
      examId: control.id,
      treatmentId: esGafas ? gafas.id : ortok.id,
      data: esGafas
        ? {
            ajuste_montura: 'Correcto',
            centrado: 'Centrado',
            estado_lentes: 'Sin rayones',
          }
        : {
            topografia: 'Patrón en diana, centrado',
            centrado: 'Centrado',
            cornea: 'Sin tinción',
            vision_al_levantarse: 'Estable todo el día',
            estado_lente: 'Limpio, sin depósitos',
          },
    })
  }

  console.log(`Controles: ${controles.length}`)

  // -------------------------------------------------------------- citas
  // El calendario del tratamiento activo. Las ya pasadas quedan cumplidas.
  const citas = generarCalendario('ortok', inicioOrtok, { horizonteMeses: 24 })
  const limite = hoy()
  await db.insert(scheduledExams).values(
    citas.map((cita) => ({
      patientId: paciente.id,
      treatmentId: ortok.id,
      dueDate: cita.dueDate,
      label: cita.label,
      status: (cita.dueDate <= limite ? 'cumplida' : 'pendiente') as 'cumplida' | 'pendiente',
      requires: cita.requires,
    })),
  )
  console.log(`Citas: ${citas.length}`)

  // --------------------------------------------------------- uso diario
  // Con gafas: por debajo de la meta, que es el punto de la historia.
  // Con orto-k: casi todas las noches, con tres saltadas.
  const usos: {
    patientId: string
    treatmentId: string
    logDate: string
    hours?: string | null
    done?: boolean | null
    outdoorMinutes?: number | null
    source: 'familia'
  }[] = []

  for (let d = 548; d > 183; d -= 1) {
    const fecha = menosDias(d)
    // Entre 6 y 10 horas, con algun dia suelto sin registro.
    if (d % 11 === 0) continue
    const horas = 6 + ((d * 7) % 5)
    usos.push({
      patientId: paciente.id,
      treatmentId: gafas.id,
      logDate: fecha,
      hours: `${horas}.0`,
      outdoorMinutes: 40 + ((d * 3) % 40),
      source: 'familia',
    })
  }

  for (let d = 183; d >= 0; d -= 1) {
    const fecha = menosDias(d)
    // Tres noches saltadas en seis meses.
    const saltada = d === 141 || d === 73 || d === 19
    usos.push({
      patientId: paciente.id,
      treatmentId: ortok.id,
      logDate: fecha,
      done: !saltada,
      outdoorMinutes: 45 + ((d * 5) % 35),
      source: 'familia',
    })
  }

  // En lotes, que son mas de 600 filas.
  for (let i = 0; i < usos.length; i += 200) {
    await db.insert(usageLogs).values(usos.slice(i, i + 200))
  }
  console.log(`Registros de uso: ${usos.length}`)

  console.log('')
  console.log('Listo. Paciente de demostracion: Luciana Ejemplo')
  console.log(`  /pacientes/${paciente.id}`)
  console.log('  Para quitarlo: npx tsx scripts/demo.ts --borrar')
}

principal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
