CREATE TYPE "public"."estado_credencial" AS ENUM('pendiente', 'verificada', 'rechazada');--> statement-breakpoint
CREATE TABLE "professional_credential" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"country" text NOT NULL,
	"document_type" text NOT NULL,
	"document_number" text,
	"issued_by" text,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"content" text NOT NULL,
	"status" "estado_credencial" DEFAULT 'pendiente' NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text
);
--> statement-breakpoint
CREATE TABLE "user_agreement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" text DEFAULT 'manejo_informacion' NOT NULL,
	"version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" text,
	"user_agent" text
);
--> statement-breakpoint
ALTER TABLE "professional_credential" ADD CONSTRAINT "professional_credential_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_credential" ADD CONSTRAINT "professional_credential_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_agreement" ADD CONSTRAINT "user_agreement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credential_user_idx" ON "professional_credential" USING btree ("user_id","uploaded_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_agreement_unico" ON "user_agreement" USING btree ("user_id","kind","version");--> statement-breakpoint
CREATE UNIQUE INDEX "patient_documento_unico" ON "patient" USING btree ("org_id","document_number") WHERE document_number is not null;