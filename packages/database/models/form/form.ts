import { pgEnum, pgTable, uuid, varchar, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "../user/user";

export const formStateEnum = pgEnum("form_state", ["drafted", "published", "closed"]);

export interface FormThemeConfig {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  cardBackgroundColor?: string;
  borderRadius?: string;
  language?: string;
  pages?: any[];
}

export const formsTable = pgTable("leaf_forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  state: formStateEnum("state").default("drafted").notNull(),

  theme: jsonb("theme").$type<FormThemeConfig>(),

  ownerId: uuid("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type FormState = (typeof formStateEnum.enumValues)[number];
export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
