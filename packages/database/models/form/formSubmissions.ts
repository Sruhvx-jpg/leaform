import { pgTable, uuid, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export interface FormSubmissionAnswer {
  fieldId?: string;
  label: string;
  value: any;
}

export const formSubmissionsTable = pgTable("leaf_form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),
  answers: jsonb("answers").$type<FormSubmissionAnswer[]>().notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  respondentIp: varchar("respondent_ip", { length: 255 }),
});

export type SelectFormSubmission = typeof formSubmissionsTable.$inferSelect;
export type InsertFormSubmission = typeof formSubmissionsTable.$inferInsert;
