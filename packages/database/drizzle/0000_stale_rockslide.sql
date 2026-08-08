CREATE TYPE "public"."form_state" AS ENUM('drafted', 'published', 'closed');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('short_text', 'long_text', 'email', 'number', 'phone_number', 'multiple_choice', 'checkboxes', 'dropdown', 'date', 'time', 'rating', 'opinion_scale', 'review', 'url', 'statement', 'yes_no', 'matrix', 'ranking', 'signature', 'payment', 'nps', 'slider', 'address', 'color_picker', 'terms_consent', 'rich_text', 'picture_choice', 'captcha');--> statement-breakpoint
CREATE TABLE "leaf_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(80) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text,
	"email_verified" boolean DEFAULT false,
	"profile_image_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "leaf_account_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "app_refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaf_forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"state" "form_state" DEFAULT 'drafted' NOT NULL,
	"theme" jsonb,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "leaf_form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"field_type" "field_type" NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"placeholder" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"font" text DEFAULT 'Inter',
	"style" jsonb,
	"options" jsonb,
	"validation_rules" jsonb,
	"default_value" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "leaf_field_text_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"min_length" integer,
	"max_length" integer,
	"regex_pattern" text,
	"error_message" text,
	CONSTRAINT "leaf_field_text_configs_field_id_unique" UNIQUE("field_id")
);
--> statement-breakpoint
CREATE TABLE "leaf_field_choice_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_other_option" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaf_field_rating_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"min_scale" integer DEFAULT 1 NOT NULL,
	"max_scale" integer DEFAULT 5 NOT NULL,
	"min_label" text,
	"max_label" text,
	"shape" varchar(50) DEFAULT 'star' NOT NULL,
	CONSTRAINT "leaf_field_rating_configs_field_id_unique" UNIQUE("field_id")
);
--> statement-breakpoint
CREATE TABLE "leaf_field_file_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"max_size_mb" integer DEFAULT 10 NOT NULL,
	"max_files_allowed" integer DEFAULT 1 NOT NULL,
	"allowed_mime_types" text,
	CONSTRAINT "leaf_field_file_configs_field_id_unique" UNIQUE("field_id")
);
--> statement-breakpoint
CREATE TABLE "leaf_field_payment_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"qr_image_url" text,
	"upi_id" text,
	"amount_in_cents" integer,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"provider" varchar(50) DEFAULT 'qr_code' NOT NULL,
	"product_name" text,
	"note" text,
	CONSTRAINT "leaf_field_payment_configs_field_id_unique" UNIQUE("field_id")
);
--> statement-breakpoint
CREATE TABLE "leaf_field_validations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_type" "field_type" NOT NULL,
	"regex_pattern" text,
	"error_message" text,
	CONSTRAINT "leaf_field_validations_field_type_unique" UNIQUE("field_type")
);
--> statement-breakpoint
CREATE TABLE "leaf_form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"answers" jsonb NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"respondent_ip" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "app_refresh_tokens" ADD CONSTRAINT "app_refresh_tokens_user_id_leaf_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."leaf_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_forms" ADD CONSTRAINT "leaf_forms_owner_id_leaf_account_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."leaf_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_form_fields" ADD CONSTRAINT "leaf_form_fields_form_id_leaf_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."leaf_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_field_text_configs" ADD CONSTRAINT "leaf_field_text_configs_field_id_leaf_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."leaf_form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_field_choice_options" ADD CONSTRAINT "leaf_field_choice_options_field_id_leaf_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."leaf_form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_field_rating_configs" ADD CONSTRAINT "leaf_field_rating_configs_field_id_leaf_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."leaf_form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_field_file_configs" ADD CONSTRAINT "leaf_field_file_configs_field_id_leaf_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."leaf_form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_field_payment_configs" ADD CONSTRAINT "leaf_field_payment_configs_field_id_leaf_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."leaf_form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_form_submissions" ADD CONSTRAINT "leaf_form_submissions_form_id_leaf_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."leaf_forms"("id") ON DELETE cascade ON UPDATE no action;