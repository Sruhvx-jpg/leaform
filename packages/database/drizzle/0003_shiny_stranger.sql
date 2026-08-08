CREATE TABLE "leaf_field_name_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"form_id" uuid NOT NULL,
	"theme" jsonb,
	"required" boolean DEFAULT true NOT NULL,
	CONSTRAINT "leaf_field_name_configs_field_id_unique" UNIQUE("field_id")
);
--> statement-breakpoint
ALTER TABLE "leaf_form_fields" ALTER COLUMN "field_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "leaf_field_name_configs" ADD CONSTRAINT "leaf_field_name_configs_field_id_leaf_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."leaf_form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_field_name_configs" ADD CONSTRAINT "leaf_field_name_configs_form_id_leaf_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."leaf_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."field_type";