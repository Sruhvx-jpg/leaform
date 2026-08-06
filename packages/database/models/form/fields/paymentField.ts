import { pgTable, uuid, integer, varchar, text } from "drizzle-orm/pg-core";
import { formFieldsTable } from "./formFields";

export const paymentFieldConfigsTable = pgTable("leaf_field_payment_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  fieldId: uuid("field_id")
    .notNull()
    .unique()
    .references(() => formFieldsTable.id, { onDelete: "cascade" }),

  // Dedicated QR Code payment configuration
  qrImageUrl: text("qr_image_url"),
  upiId: text("upi_id"),
  amountInCents: integer("amount_in_cents"),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  provider: varchar("provider", { length: 50 }).default("qr_code").notNull(),
  productName: text("product_name"),
  note: text("note"),
});

export type SelectPaymentFieldConfig = typeof paymentFieldConfigsTable.$inferSelect;
export type InsertPaymentFieldConfig = typeof paymentFieldConfigsTable.$inferInsert;
