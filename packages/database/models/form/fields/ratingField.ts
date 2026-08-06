import { pgTable, uuid, integer, text, varchar } from "drizzle-orm/pg-core";
import { formFieldsTable } from "./formFields";

export const ratingFieldConfigsTable = pgTable("leaf_field_rating_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  fieldId: uuid("field_id")
    .notNull()
    .unique()
    .references(() => formFieldsTable.id, { onDelete: "cascade" }),

  minScale: integer("min_scale").default(1).notNull(),
  maxScale: integer("max_scale").default(5).notNull(),
  minLabel: text("min_label"),
  maxLabel: text("max_label"),
  shape: varchar("shape", { length: 50 }).default("star").notNull(),
});

export type SelectRatingFieldConfig = typeof ratingFieldConfigsTable.$inferSelect;
export type InsertRatingFieldConfig = typeof ratingFieldConfigsTable.$inferInsert;
