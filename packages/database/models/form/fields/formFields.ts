import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { formsTable } from "../form";
import { fieldTypeEnum } from "./enums";

export interface FieldStyleConfig {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
}

export const formFieldsTable = pgTable("leaf_form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),

  fieldType: fieldTypeEnum("field_type").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  placeholder: text("placeholder"),
  isRequired: boolean("is_required").default(false).notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  font: text("font").default("Inter"),
  style: jsonb("style").$type<FieldStyleConfig>(),

  options: jsonb("options"),
  validationRules: jsonb("validation_rules"),
  defaultValue: text("default_value"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
