import { pgTable, uuid, text, integer, boolean } from "drizzle-orm/pg-core";
import { formFieldsTable } from "./formFields";

export const choiceOptionsTable = pgTable("leaf_field_choice_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  fieldId: uuid("field_id")
    .notNull()
    .references(() => formFieldsTable.id, { onDelete: "cascade" }),

  label: text("label").notNull(),
  value: text("value").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  isOtherOption: boolean("is_other_option").default(false).notNull(),
});

export type SelectChoiceOption = typeof choiceOptionsTable.$inferSelect;
export type InsertChoiceOption = typeof choiceOptionsTable.$inferInsert;
