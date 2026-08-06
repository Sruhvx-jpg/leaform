CREATE TABLE "leaf_form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"answers" jsonb NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"respondent_ip" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "leaf_form_submissions" ADD CONSTRAINT "leaf_form_submissions_form_id_leaf_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."leaf_forms"("id") ON DELETE cascade ON UPDATE no action;