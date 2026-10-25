/**
 * Esquema de la base de datos del carnet MML.
 *
 * Nombres de tablas y columnas en ingles para que el ORM y un mapeo posterior a
 * FHIR (Resolucion 866 de 2021) queden limpios. La interfaz es en espanol.
 */

import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import type { AdapterAccountType } from 'next-auth/adapters'

// ---------------------------------------------------------------------------
// Enumeraciones
// ---------------------------------------------------------------------------

export const estadoCuentaEnum = pgEnum('estado_cuenta', [
  'pendiente',
  'aprobado',
  'rechazado',
  'suspendido',
])

export const rolMembresiaEnum = pgEnum('rol_membresia', ['owner', 'professional', 'staff'])

export const profesionEnum = pgEnum('profesion', [
  'optometra',
  'oftalmologo',
  'otro',
])

export const rolAccesoEnum = pgEnum('rol_acceso', [
  'treating_professional',
  'guest_professional',
  'caregiver',
])

export const sexoEnum = pgEnum('sexo', ['femenino', 'masculino', 'otro', 'no_declara'])

export const tipoTratamientoEnum = pgEnum('tipo_tratamiento', [
  'ortok',
  'gafas',
  'lentes_blandos',
  'atropina',
])

export const notacionAvEnum = pgEnum('notacion_av', ['snellen_20', 'snellen_6', 'logmar', 'decimal'])

export const tipoExamenEnum = pgEnum('tipo_examen', ['inicio', 'rutina', 'urgencia'])

export const estadoCitaEnum = pgEnum('estado_cita', [
  'pendiente',
  'cumplida',
  'vencida',
  'omitida',
])

export const origenRegistroEnum = pgEnum('origen_registro', ['familia', 'profesional'])

export const estadoCredencialEnum = pgEnum('estado_credencial', [
  'pendiente',
  'verificada',
  'rechazada',
])

export const metodoConsentimientoEnum = pgEnum('metodo_consentimiento', [
  'en_consulta',
  'digital',
])

export const accionAuditoriaEnum = pgEnum('accion_auditoria', [
  'create',
  'update',
  'delete',
  'read',
  'export',
  'share',
  'revoke',
  'login',
  'approve',
])

// ---------------------------------------------------------------------------
// Identidad. Tablas del adaptador de NextAuth mas el estado de aprobacion.
// ---------------------------------------------------------------------------

export const users = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  /** El acceso es cerrado: toda cuenta nueva nace pendiente de aprobacion. */
  status: estadoCuentaEnum('status').notNull().default('pendiente'),
  isAdmin: boolean('is_admin').notNull().default(false),
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  /** Que dijo la persona al pedir acceso. Se muestra al aprobar. */
  requestNote: text('request_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const accounts = pgTable(
  'account',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => ({ pk: primaryKey({ columns: [t.provider, t.providerAccountId] }) }),
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.identifier, t.token] }) }),
)

// ---------------------------------------------------------------------------
// Organizaciones y profesionales
// ---------------------------------------------------------------------------

export const organizations = pgTable('organization', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  settings: jsonb('settings').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const memberships = pgTable(
  'membership',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: rolMembresiaEnum('role').notNull().default('professional'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.orgId] }) }),
)

export const professionals = pgTable('professional', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
  profession: profesionEnum('profession').notNull().default('optometra'),
  /** Registro profesional. */
  license: text('license'),
  displayName: text('display_name'),
  institution: text('institution'),
  phone: text('phone'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Compromiso de manejo de informacion que firma cada miembro de la red antes
 * de usar la aplicacion. Se guarda la version aceptada, no solo un "si":
 * cuando el texto cambie, se vuelve a pedir.
 */
export const userAgreements = pgTable(
  'user_agreement',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull().default('manejo_informacion'),
    version: text('version').notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }).notNull().defaultNow(),
    ip: text('ip'),
    userAgent: text('user_agent'),
  },
  (t) => ({ unico: uniqueIndex('user_agreement_unico').on(t.userId, t.kind, t.version) }),
)

/**
 * Documento que acredita a la persona como profesional en su pais.
 *
 * El archivo se guarda en la misma base, codificado en base64, y no en un
 * almacenamiento aparte: asi se borra junto con la cuenta y queda bajo el
 * mismo control de acceso y la misma bitacora que el resto. Son pocos
 * archivos y pequenos; si la red crece, se mueve a almacenamiento de objetos.
 */
export const professionalCredentials = pgTable(
  'professional_credential',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Pais donde ejerce. Define cual es la autoridad que lo habilita. */
    country: text('country').notNull(),
    /** Nombre oficial del registro o tarjeta, tal como se llama en ese pais. */
    documentType: text('document_type').notNull(),
    documentNumber: text('document_number'),
    /** Entidad que lo expide, si la persona la conoce. */
    issuedBy: text('issued_by'),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    /** El archivo en base64. */
    content: text('content').notNull(),
    status: estadoCredencialEnum('status').notNull().default('pendiente'),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
    reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),
  },
  (t) => ({ porUsuario: index('credential_user_idx').on(t.userId, t.uploadedAt) }),
)

// ---------------------------------------------------------------------------
// Pacientes
// ---------------------------------------------------------------------------

export const patients = pgTable(
  'patient',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    documentType: text('document_type'),
    documentNumber: text('document_number'),
    birthDate: date('birth_date').notNull(),
    sex: sexoEnum('sex').notNull().default('no_declara'),
    /** Edad en anos a la que se detecto la miopia. */
    myopiaOnsetAge: numeric('myopia_onset_age', { precision: 4, scale: 1 }),
    /** 0, 1 o 2 padres miopes. */
    myopicParents: smallint('myopic_parents'),
    ophthalmologistName: text('ophthalmologist_name'),
    institutionName: text('institution_name'),
    /** Contacto de la familia, para invitarla a la vista de registro diario. */
    caregiverName: text('caregiver_name'),
    caregiverEmail: text('caregiver_email'),
    caregiverPhone: text('caregiver_phone'),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (t) => ({
    orgIdx: index('patient_org_idx').on(t.orgId),
    nameIdx: index('patient_name_idx').on(t.lastName, t.firstName),
    /**
     * Un mismo documento no puede existir dos veces en la misma organizacion.
     * Es parcial porque el documento es opcional: hay ninos sin documento
     * propio al momento de la primera consulta.
     */
    documentoUnico: uniqueIndex('patient_documento_unico')
      .on(t.orgId, t.documentNumber)
      .where(sql`document_number is not null`),
  }),
)

/**
 * Consentimiento informado del padre, madre o representante.
 * Ley 1581 de 2012 y Decreto 1377 de 2013.
 */
export const consents = pgTable('consent', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  version: text('version').notNull(),
  guardianName: text('guardian_name').notNull(),
  guardianDocument: text('guardian_document'),
  relationship: text('relationship'),
  method: metodoConsentimientoEnum('method').notNull().default('en_consulta'),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  grantedByUserId: uuid('granted_by_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  ip: text('ip'),
  userAgent: text('user_agent'),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
})

/**
 * Quien puede ver o editar a cada paciente. Resuelve los tres roles: mas de un
 * profesional tratante, la familia y el invitado de oftalmopediatria con
 * vencimiento.
 */
export const patientAccess = pgTable(
  'patient_access',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: rolAccesoEnum('role').notNull(),
    relationship: text('relationship'),
    grantedBy: uuid('granted_by').references(() => users.id, { onDelete: 'set null' }),
    grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (t) => ({
    unico: uniqueIndex('patient_access_unico').on(t.patientId, t.userId, t.role),
    porUsuario: index('patient_access_user_idx').on(t.userId),
  }),
)

/** Enlace o QR de solo lectura, con vencimiento y revocable. */
export const shareLinks = pgTable(
  'share_link',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    /** Solo el hash del token. El token en claro nunca se guarda. */
    tokenHash: text('token_hash').notNull().unique(),
    label: text('label'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    useCount: integer('use_count').notNull().default(0),
  },
  (t) => ({ porPaciente: index('share_link_patient_idx').on(t.patientId) }),
)

// ---------------------------------------------------------------------------
// Tratamientos
// ---------------------------------------------------------------------------

export const treatments = pgTable(
  'treatment',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    type: tipoTratamientoEnum('type').notNull(),
    /** Texto libre. Sin catalogo de marcas obligatorio. */
    deviceLabel: text('device_label'),
    /** Para atropina. Texto libre, con sugerencias en la interfaz. */
    concentration: text('concentration'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    changeReason: text('change_reason'),
    prescribedBy: uuid('prescribed_by').references(() => users.id, { onDelete: 'set null' }),
    /** { horasPorDia?, diasPorSemana?, nochesPorSemana? } */
    adherenceGoal: jsonb('adherence_goal')
      .$type<{ horasPorDia?: number; diasPorSemana?: number; nochesPorSemana?: number }>()
      .notNull()
      .default({}),
    /** Plantilla de calendario usada al generar las citas. */
    calendarTemplateKey: text('calendar_template_key'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ porPaciente: index('treatment_patient_idx').on(t.patientId, t.startDate) }),
)

// ---------------------------------------------------------------------------
// Equipos de biometria y controles
// ---------------------------------------------------------------------------

export const biometers = pgTable('biometer', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  serial: text('serial'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const exams = pgTable(
  'exam',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    examDate: date('exam_date').notNull(),
    performedBy: uuid('performed_by').references(() => users.id, { onDelete: 'set null' }),
    examType: tipoExamenEnum('exam_type').notNull().default('rutina'),

    // Agudeza visual
    vaOd: text('va_od'),
    vaOi: text('va_oi'),
    vaNotation: notacionAvEnum('va_notation').notNull().default('snellen_20'),

    // Refraccion
    cycloplegic: boolean('cycloplegic').notNull().default(true),
    sphereOd: numeric('sphere_od', { precision: 5, scale: 2 }),
    cylOd: numeric('cyl_od', { precision: 5, scale: 2 }),
    axisOd: smallint('axis_od'),
    sphereOi: numeric('sphere_oi', { precision: 5, scale: 2 }),
    cylOi: numeric('cyl_oi', { precision: 5, scale: 2 }),
    axisOi: smallint('axis_oi'),
    /** Equivalente esferico. Columna generada por Postgres: esfera + cilindro/2. */
    seOd: numeric('se_od', { precision: 6, scale: 3 }).generatedAlwaysAs(
      sql`sphere_od + coalesce(cyl_od, 0) / 2`,
    ),
    seOi: numeric('se_oi', { precision: 6, scale: 3 }).generatedAlwaysAs(
      sql`sphere_oi + coalesce(cyl_oi, 0) / 2`,
    ),

    // Longitud axial. Obligatorio registrar con que equipo se midio.
    alOd: numeric('al_od', { precision: 4, scale: 2 }),
    alOi: numeric('al_oi', { precision: 4, scale: 2 }),
    biometerId: uuid('biometer_id').references(() => biometers.id, { onDelete: 'set null' }),

    // Uso y habitos reportados en consulta
    reportedHoursPerDay: numeric('reported_hours_per_day', { precision: 4, scale: 1 }),
    outdoorHoursPerDay: numeric('outdoor_hours_per_day', { precision: 4, scale: 1 }),
    screenHoursPerDay: numeric('screen_hours_per_day', { precision: 4, scale: 1 }),

    adverseEvents: text('adverse_events'),
    decision: text('decision'),
    fundusDone: boolean('fundus_done').notNull().default(false),
    nextExamDate: date('next_exam_date'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    porPaciente: index('exam_patient_date_idx').on(t.patientId, t.examDate),
    unicoPorDia: unique('exam_patient_date_unico').on(t.patientId, t.examDate),
  }),
)

/** Hallazgos especificos del tratamiento, validados por tipo con Zod. */
export const examTreatmentFindings = pgTable(
  'exam_treatment_finding',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    examId: uuid('exam_id')
      .notNull()
      .references(() => exams.id, { onDelete: 'cascade' }),
    treatmentId: uuid('treatment_id')
      .notNull()
      .references(() => treatments.id, { onDelete: 'cascade' }),
    data: jsonb('data').$type<Record<string, string | number | null>>().notNull().default({}),
  },
  (t) => ({ unico: uniqueIndex('exam_treatment_unico').on(t.examId, t.treatmentId) }),
)

// ---------------------------------------------------------------------------
// Registro diario de uso
// ---------------------------------------------------------------------------

export const usageLogs = pgTable(
  'usage_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    treatmentId: uuid('treatment_id')
      .notNull()
      .references(() => treatments.id, { onDelete: 'cascade' }),
    logDate: date('log_date').notNull(),
    /** Gafas y lentes blandos. */
    hours: numeric('hours', { precision: 4, scale: 1 }),
    /** Noche de orto-k o gota de atropina. */
    done: boolean('done'),
    outdoorMinutes: integer('outdoor_minutes'),
    discomfort: boolean('discomfort').notNull().default(false),
    discomfortNote: text('discomfort_note'),
    loggedBy: uuid('logged_by').references(() => users.id, { onDelete: 'set null' }),
    source: origenRegistroEnum('source').notNull().default('familia'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    unico: unique('usage_log_unico').on(t.treatmentId, t.logDate),
    porPaciente: index('usage_log_patient_idx').on(t.patientId, t.logDate),
  }),
)

// ---------------------------------------------------------------------------
// Calendario de controles
// ---------------------------------------------------------------------------

export const followupTemplates = pgTable('followup_template', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** null significa plantilla base, compartida y de solo lectura. */
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  treatmentType: tipoTratamientoEnum('treatment_type').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  sourceNote: text('source_note'),
  everyDaysAfter: integer('every_days_after').notNull().default(182),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const followupTemplateItems = pgTable('followup_template_item', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: uuid('template_id')
    .notNull()
    .references(() => followupTemplates.id, { onDelete: 'cascade' }),
  offsetDays: integer('offset_days').notNull(),
  label: text('label').notNull(),
  position: integer('position').notNull().default(0),
  requires: jsonb('requires')
    .$type<{
      biometria?: boolean
      topografia?: boolean
      ciclopejia?: boolean
      fondoDeOjo?: boolean
    }>()
    .notNull()
    .default({}),
})

export const scheduledExams = pgTable(
  'scheduled_exam',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    treatmentId: uuid('treatment_id').references(() => treatments.id, { onDelete: 'cascade' }),
    dueDate: date('due_date').notNull(),
    label: text('label').notNull(),
    status: estadoCitaEnum('status').notNull().default('pendiente'),
    requires: jsonb('requires')
      .$type<{
        biometria?: boolean
        topografia?: boolean
        ciclopejia?: boolean
        fondoDeOjo?: boolean
      }>()
      .notNull()
      .default({}),
    examId: uuid('exam_id').references(() => exams.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ porPaciente: index('scheduled_exam_patient_idx').on(t.patientId, t.dueDate) }),
)

// ---------------------------------------------------------------------------
// Auditoria. Solo se inserta, nunca se actualiza ni se borra.
// ---------------------------------------------------------------------------

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: accionAuditoriaEnum('action').notNull(),
    entity: text('entity').notNull(),
    entityId: uuid('entity_id'),
    patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'set null' }),
    diff: jsonb('diff').$type<Record<string, unknown>>(),
    ip: text('ip'),
    userAgent: text('user_agent'),
    at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    porPaciente: index('audit_patient_idx').on(t.patientId, t.at),
    porActor: index('audit_actor_idx').on(t.actorUserId, t.at),
  }),
)
