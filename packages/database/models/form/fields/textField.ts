import { pgTable, uuid, integer, text } from "drizzle-orm/pg-core";
import { formFieldsTable } from "./formFields";

export const textFieldConfigsTable = pgTable("leaf_field_text_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  fieldId: uuid("field_id")
    .notNull()
    .unique()
    .references(() => formFieldsTable.id, { onDelete: "cascade" }),

  minLength: integer("min_length"),
  maxLength: integer("max_length"),
  regexPattern: text("regex_pattern"),
  errorMessage: text("error_message"),
});

export type SelectTextFieldConfig = typeof textFieldConfigsTable.$inferSelect;
export type InsertTextFieldConfig = typeof textFieldConfigsTable.$inferInsert;
