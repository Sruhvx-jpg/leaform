import { pgTable, uuid, text, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { formsTable } from "../form";
import { FieldStyleConfig, FieldValidationConfig } from "./config/fieldConfig";

export const textFieldTable = pgTable("leaf_form_text_fields", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),

  label: text("label").notNull(),
  description: text("description"),
  placeholder: text("placeholder"),
  isRequired: boolean("is_required").default(true).notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  style: jsonb("style").$type<FieldStyleConfig>(),
  validationRules: jsonb("validation_rules").$type<FieldValidationConfig>(),
  defaultValue: text("default_value"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectTextField = typeof textFieldTable.$inferSelect;
export type InsertTextField = typeof textFieldTable.$inferInsert;
