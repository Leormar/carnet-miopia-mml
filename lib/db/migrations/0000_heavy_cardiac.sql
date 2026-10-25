CREATE TYPE "public"."accion_auditoria" AS ENUM('create', 'update', 'delete', 'read', 'export', 'share', 'revoke', 'login', 'approve');--> statement-breakpoint
CREATE TYPE "public"."estado_cita" AS ENUM('pendiente', 'cumplida', 'vencida', 'omitida');--> statement-breakpoint
CREATE TYPE "public"."estado_cuenta" AS ENUM('pendiente', 'aprobado', 'rechazado', 'suspendido');--> statement-breakpoint
CREATE TYPE "public"."metodo_consentimiento" AS ENUM('en_consulta', 'digital');--> statement-breakpoint
CREATE TYPE "public"."notacion_av" AS ENUM('snellen_20', 'snellen_6', 'logmar', 'decimal');--> statement-breakpoint
CREATE TYPE "public"."origen_registro" AS ENUM('familia', 'profesional');--> statement-breakpoint
CREATE TYPE "public"."profesion" AS ENUM('optometra', 'oftalmologo', 'otro');--> statement-breakpoint
CREATE TYPE "public"."rol_acceso" AS ENUM('treating_professional', 'guest_professional', 'caregiver');--> statement-breakpoint
CREATE TYPE "public"."rol_membresia" AS ENUM('owner', 'professional', 'staff');--> statement-breakpoint
CREATE TYPE "public"."sexo" AS ENUM('femenino', 'masculino', 'otro', 'no_declara');--> statement-breakpoint
CREATE TYPE "public"."tipo_examen" AS ENUM('inicio', 'rutina', 'urgencia');--> statement-breakpoint
CREATE TYPE "public"."tipo_tratamiento" AS ENUM('ortok', 'gafas', 'lentes_blandos', 'atropina');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" "accion_auditoria" NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"patient_id" uuid,
	"diff" jsonb,
	"ip" text,
	"user_agent" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biometer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"name" text NOT NULL,
	"serial" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"version" text NOT NULL,
	"guardian_name" text NOT NULL,
	"guardian_document" text,
	"relationship" text,
	"method" "metodo_consentimiento" DEFAULT 'en_consulta' NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"granted_by_user_id" uuid,
	"ip" text,
	"user_agent" text,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "exam_treatment_finding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"treatment_id" uuid NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"exam_date" date NOT NULL,
	"performed_by" uuid,
	"exam_type" "tipo_examen" DEFAULT 'rutina' NOT NULL,
	"va_od" text,
	"va_oi" text,
	"va_notation" "notacion_av" DEFAULT 'snellen_20' NOT NULL,
	"cycloplegic" boolean DEFAULT true NOT NULL,
	"sphere_od" numeric(5, 2),
	"cyl_od" numeric(5, 2),
	"axis_od" smallint,
	"sphere_oi" numeric(5, 2),
	"cyl_oi" numeric(5, 2),
	"axis_oi" smallint,
	"se_od" numeric(6, 3) GENERATED ALWAYS AS (sphere_od + coalesce(cyl_od, 0) / 2) STORED,
	"se_oi" numeric(6, 3) GENERATED ALWAYS AS (sphere_oi + coalesce(cyl_oi, 0) / 2) STORED,
	"al_od" numeric(4, 2),
	"al_oi" numeric(4, 2),
	"biometer_id" uuid,
	"reported_hours_per_day" numeric(4, 1),
	"outdoor_hours_per_day" numeric(4, 1),
	"screen_hours_per_day" numeric(4, 1),
	"adverse_events" text,
	"decision" text,
	"fundus_done" boolean DEFAULT false NOT NULL,
	"next_exam_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exam_patient_date_unico" UNIQUE("patient_id","exam_date")
);
--> statement-breakpoint
CREATE TABLE "followup_template_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"offset_days" integer NOT NULL,
	"label" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"requires" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "followup_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"treatment_type" "tipo_tratamiento" NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"source_note" text,
	"every_days_after" integer DEFAULT 182 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "followup_template_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "membership" (
	"user_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"role" "rol_membresia" DEFAULT 'professional' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_user_id_org_id_pk" PRIMARY KEY("user_id","org_id")
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "patient_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "rol_acceso" NOT NULL,
	"relationship" text,
	"granted_by" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "patient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"document_type" text,
	"document_number" text,
	"birth_date" date NOT NULL,
	"sex" "sexo" DEFAULT 'no_declara' NOT NULL,
	"myopia_onset_age" numeric(4, 1),
	"myopic_parents" smallint,
	"ophthalmologist_name" text,
	"institution_name" text,
	"caregiver_name" text,
	"caregiver_email" text,
	"caregiver_phone" text,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "professional" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"org_id" uuid,
	"profession" "profesion" DEFAULT 'optometra' NOT NULL,
	"license" text,
	"display_name" text,
	"institution" text,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "scheduled_exam" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"treatment_id" uuid,
	"due_date" date NOT NULL,
	"label" text NOT NULL,
	"status" "estado_cita" DEFAULT 'pendiente' NOT NULL,
	"requires" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"exam_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "share_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"label" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"use_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "share_link_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "treatment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"type" "tipo_tratamiento" NOT NULL,
	"device_label" text,
	"concentration" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"change_reason" text,
	"prescribed_by" uuid,
	"adherence_goal" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"calendar_template_key" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"treatment_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"hours" numeric(4, 1),
	"done" boolean,
	"outdoor_minutes" integer,
	"discomfort" boolean DEFAULT false NOT NULL,
	"discomfort_note" text,
	"logged_by" uuid,
	"source" "origen_registro" DEFAULT 'familia' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usage_log_unico" UNIQUE("treatment_id","log_date")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"status" "estado_cuenta" DEFAULT 'pendiente' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"rejection_reason" text,
	"request_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometer" ADD CONSTRAINT "biometer_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent" ADD CONSTRAINT "consent_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent" ADD CONSTRAINT "consent_granted_by_user_id_user_id_fk" FOREIGN KEY ("granted_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_treatment_finding" ADD CONSTRAINT "exam_treatment_finding_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_treatment_finding" ADD CONSTRAINT "exam_treatment_finding_treatment_id_treatment_id_fk" FOREIGN KEY ("treatment_id") REFERENCES "public"."treatment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam" ADD CONSTRAINT "exam_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam" ADD CONSTRAINT "exam_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam" ADD CONSTRAINT "exam_biometer_id_biometer_id_fk" FOREIGN KEY ("biometer_id") REFERENCES "public"."biometer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followup_template_item" ADD CONSTRAINT "followup_template_item_template_id_followup_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."followup_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followup_template" ADD CONSTRAINT "followup_template_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access" ADD CONSTRAINT "patient_access_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access" ADD CONSTRAINT "patient_access_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_access" ADD CONSTRAINT "patient_access_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional" ADD CONSTRAINT "professional_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional" ADD CONSTRAINT "professional_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_exam" ADD CONSTRAINT "scheduled_exam_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_exam" ADD CONSTRAINT "scheduled_exam_treatment_id_treatment_id_fk" FOREIGN KEY ("treatment_id") REFERENCES "public"."treatment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_exam" ADD CONSTRAINT "scheduled_exam_exam_id_exam_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exam"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_link" ADD CONSTRAINT "share_link_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_link" ADD CONSTRAINT "share_link_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment" ADD CONSTRAINT "treatment_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment" ADD CONSTRAINT "treatment_prescribed_by_user_id_fk" FOREIGN KEY ("prescribed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_log" ADD CONSTRAINT "usage_log_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_log" ADD CONSTRAINT "usage_log_treatment_id_treatment_id_fk" FOREIGN KEY ("treatment_id") REFERENCES "public"."treatment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_log" ADD CONSTRAINT "usage_log_logged_by_user_id_fk" FOREIGN KEY ("logged_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_patient_idx" ON "audit_log" USING btree ("patient_id","at");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_log" USING btree ("actor_user_id","at");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_treatment_unico" ON "exam_treatment_finding" USING btree ("exam_id","treatment_id");--> statement-breakpoint
CREATE INDEX "exam_patient_date_idx" ON "exam" USING btree ("patient_id","exam_date");--> statement-breakpoint
CREATE UNIQUE INDEX "patient_access_unico" ON "patient_access" USING btree ("patient_id","user_id","role");--> statement-breakpoint
CREATE INDEX "patient_access_user_idx" ON "patient_access" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "patient_org_idx" ON "patient" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "patient_name_idx" ON "patient" USING btree ("last_name","first_name");--> statement-breakpoint
CREATE INDEX "scheduled_exam_patient_idx" ON "scheduled_exam" USING btree ("patient_id","due_date");--> statement-breakpoint
CREATE INDEX "share_link_patient_idx" ON "share_link" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "treatment_patient_idx" ON "treatment" USING btree ("patient_id","start_date");--> statement-breakpoint
CREATE INDEX "usage_log_patient_idx" ON "usage_log" USING btree ("patient_id","log_date");