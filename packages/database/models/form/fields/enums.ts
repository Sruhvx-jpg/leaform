import { pgEnum } from "drizzle-orm/pg-core";

export const fieldTypeEnum = pgEnum("field_type", [
  "short_text",
  "long_text",
  "email",
  "number",
  "phone_number",
  "multiple_choice",
  "checkboxes",
  "dropdown",
  "date",
  "time",
  "rating",
  "opinion_scale",
  "review",
  "url",
  "statement",
  "yes_no",
  "matrix",
  "ranking",
  "signature",
  "payment",
  "nps",
  "slider",
  "address",
  "color_picker",
  "terms_consent",
  "rich_text",
  "picture_choice",
  "captcha",
]);

export type FieldType = (typeof fieldTypeEnum.enumValues)[number];
