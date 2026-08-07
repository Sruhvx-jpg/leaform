import db from "./index";
import { fieldValidationsTable } from "./schema";

const defaultValidations = [
  {
    fieldType: "email" as const,
    regexPattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    errorMessage: "Please enter a valid email address.",
  },
  {
    fieldType: "url" as const,
    regexPattern: "^(https?:\\/\\/)?([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})([\\/\\w.-]*)*\\/?$",
    errorMessage: "Please enter a valid URL.",
  },
  {
    fieldType: "phone_number" as const,
    regexPattern: "^\\+?[\\d\\s\\-()]{7,20}$",
    errorMessage: "Please enter a valid phone number.",
  },
  {
    fieldType: "number" as const,
    regexPattern: "^-?\\d+(\\.\\d+)?$",
    errorMessage: "Please enter a valid number.",
  },
  {
    fieldType: "date" as const,
    regexPattern: "^\\d{4}-\\d{2}-\\d{2}$",
    errorMessage: "Please enter a valid date in YYYY-MM-DD format.",
  },
  {
    fieldType: "time" as const,
    regexPattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
    errorMessage: "Please enter a valid time in HH:MM format.",
  },
  {
    fieldType: "color_picker" as const,
    regexPattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
    errorMessage: "Please enter a valid hex color code.",
  },
];

async function seed() {
  console.log("Seeding default field validations...");
  try {
    for (const validation of defaultValidations) {
      await db
        .insert(fieldValidationsTable)
        .values(validation)
        .onConflictDoUpdate({
          target: fieldValidationsTable.fieldType,
          set: {
            regexPattern: validation.regexPattern,
            errorMessage: validation.errorMessage,
          },
        });
      console.log(`- Seeded/updated validation for type: ${validation.fieldType}`);
    }
    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
