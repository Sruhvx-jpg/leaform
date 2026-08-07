CREATE TABLE "leaf_field_validations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_type" "field_type" NOT NULL,
	"regex_pattern" text,
	"error_message" text,
	CONSTRAINT "leaf_field_validations_field_type_unique" UNIQUE("field_type")
);
