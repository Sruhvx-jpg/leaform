CREATE TYPE "public"."workspace_role" AS ENUM('owner', 'read', 'write');--> statement-breakpoint
CREATE TABLE "leaf_workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "workspace_role" DEFAULT 'read' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaf_workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" uuid NOT NULL,
	"invite_code" varchar(12) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "leaf_workspaces_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
ALTER TABLE "leaf_forms" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "leaf_workspace_members" ADD CONSTRAINT "leaf_workspace_members_workspace_id_leaf_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."leaf_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_workspace_members" ADD CONSTRAINT "leaf_workspace_members_user_id_leaf_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."leaf_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_workspaces" ADD CONSTRAINT "leaf_workspaces_owner_id_leaf_account_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."leaf_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaf_forms" ADD CONSTRAINT "leaf_forms_workspace_id_leaf_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."leaf_workspaces"("id") ON DELETE cascade ON UPDATE no action;