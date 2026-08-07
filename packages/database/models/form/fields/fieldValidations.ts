import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { fieldTypeEnum } from "./enums";

export const fieldValidationsTable = pgTable("leaf_field_validations", {
  id: uuid("id").primaryKey().defaultRandom(),
  fieldType: fieldTypeEnum("field_type").notNull().unique(),
  regexPattern: text("regex_pattern"),
  errorMessage: text("error_message"),
});

export type SelectFieldValidation = typeof fieldValidationsTable.$inferSelect;
export type InsertFieldValidation = typeof fieldValidationsTable.$inferInsert;
