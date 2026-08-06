import { pgTable, uuid, integer, text } from "drizzle-orm/pg-core";
import { formFieldsTable } from "./formFields";

export const fileFieldConfigsTable = pgTable("leaf_field_file_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  fieldId: uuid("field_id")
    .notNull()
    .unique()
    .references(() => formFieldsTable.id, { onDelete: "cascade" }),

  maxSizeMb: integer("max_size_mb").default(10).notNull(),
  maxFilesAllowed: integer("max_files_allowed").default(1).notNull(),
  allowedMimeTypes: text("allowed_mime_types"),
});

export type SelectFileFieldConfig = typeof fileFieldConfigsTable.$inferSelect;
export type InsertFileFieldConfig = typeof fileFieldConfigsTable.$inferInsert;
