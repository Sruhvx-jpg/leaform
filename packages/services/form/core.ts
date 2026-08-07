// ++++++++++++++++++++++++ CODE OF CONDUCT ++++++++++++++++++++++++++
//1. Use private function to wrap drizzle db select and insert
//2. use try catch block everywhere, in catch block throw a error mentioning which private function it originated
//3. imports should first start with pnpm package -> in house modules/packages -> current working directory files

import { eq, and, sql } from "drizzle-orm";

// in house modules
import db, {
  formsTable,
  formFieldsTable,
  formSubmissionsTable,
  fieldValidationsTable,
  ValidationRules,
  FieldStyleConfig,
} from "@repo/database";
import { apiErr } from "@repo/utils";

export interface SaveFieldInput {
  type?: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  font?: string;
  style?: FieldStyleConfig;
  options?: string[];
  validationRules?: ValidationRules;
}

export interface FormAnswerInput {
  fieldId?: string;
  label: string;
  value: string | number | boolean | string[];
}

class FormService {
  // ========================================== private methods ====================================================

  private async getFormsByOwnerId(ownerId: string) {
    try {
      const forms = await db.select().from(formsTable).where(eq(formsTable.ownerId, ownerId));

      return forms;
    } catch (error) {
      throw new Error(
        `getFormsByOwnerId failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async createFormRow(
    ownerId: string,
    title: string,
    description?: string,
    theme?: any,
    state?: "drafted" | "published" | "closed",
  ) {
    try {
      const [newForm] = await db
        .insert(formsTable)
        .values({
          ownerId,
          title,
          description: description || null,
          theme: theme || null,
          state: state || "drafted",
        })
        .returning();

      if (!newForm) {
        throw new Error("Failed to insert form row.");
      }

      return newForm;
    } catch (error) {
      throw new Error(
        `createFormRow failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async validateFieldValue(
    fieldType: string,
    strVal: string,
    rules: ValidationRules,
  ): Promise<string | null> {
    // 1. Fetch custom pattern from rules first
    const customPattern = rules.pattern || rules.customRegex;
    if (customPattern) {
      try {
        const regex = new RegExp(customPattern);
        if (!regex.test(strVal)) {
          return rules.customErrorMessage || "Invalid format.";
        }
        return null;
      } catch (e) {
        console.error("Invalid custom regex pattern:", customPattern, e);
      }
    }

    // 2. Fetch default pattern from leaf_field_validations table
    try {
      const [validation] = await db
        .select()
        .from(fieldValidationsTable)
        .where(eq(fieldValidationsTable.fieldType, fieldType as any))
        .limit(1);

      if (validation && validation.regexPattern) {
        const regex = new RegExp(validation.regexPattern);
        if (!regex.test(strVal)) {
          return validation.errorMessage || "Invalid format.";
        }
      }
    } catch (e) {
      console.error("Error executing database field validation:", e);
    }

    return null;
  }

  private async saveFieldsRows(formId: string, fields: SaveFieldInput[]) {
    try {
      if (!fields || fields.length === 0) return [];
      const fieldRows = fields.map((f, idx) => {
        const rules = f.validationRules || {};
        const fType = f.type || "short_text";

        // Assign default validation patterns if they aren't already set
        if (!rules.pattern) {
          if (fType === "email") {
            rules.pattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
            rules.customErrorMessage = "Please enter a valid email address.";
          } else if (fType === "url") {
            rules.pattern = "^(https?:\\/\\/)?([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})([\\/\\w.-]*)*\\/?$";
            rules.customErrorMessage = "Please enter a valid URL.";
          } else if (fType === "phone_number") {
            rules.pattern = "^\\+?[\\d\\s\\-()]{7,20}$";
            rules.customErrorMessage = "Please enter a valid phone number.";
          }
        }

        return {
          formId,
          fieldType: fType,
          label: f.label,
          description: f.description || null,
          placeholder: f.placeholder || null,
          isRequired: !!f.required,
          orderIndex: idx,
          font: f.font || "Inter",
          style: f.style || null,
          options: f.options || null,
          validationRules: rules,
        };
      });

      const inserted = await db
        .insert(formFieldsTable)
        .values(fieldRows as any)
        .returning();
      return inserted;
    } catch (error) {
      throw new Error(
        `saveFieldsRows failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // ========================================= public methods ======================================================

  public async getUserForms(ownerId: string) {
    try {
      const forms = await this.getFormsByOwnerId(ownerId);
      if (!forms || forms.length === 0) {
        return 0 as const;
      }
      return forms;
    } catch (error) {
      if (error instanceof apiErr) {
        throw error;
      }
      console.error("FormService.getUserForms internal error:", error);
      throw apiErr.unknownErr("An unexpected error occurred while fetching forms.");
    }
  }

  public async saveForm(
    ownerId: string,
    payload: {
      id?: string;
      title: string;
      description?: string;
      theme?: any;
      state?: "drafted" | "published" | "closed";
      fields: SaveFieldInput[];
    },
  ) {
    try {
      let form: any = null;
      if (payload.id) {
        const [updated] = await db
          .update(formsTable)
          .set({
            title: payload.title,
            description: payload.description || null,
            theme: payload.theme || null,
            state: payload.state || "drafted",
            updatedAt: new Date(),
          })
          .where(eq(formsTable.id, payload.id))
          .returning();

        form = updated;
        if (form) {
          await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, form.id));
        }
      }

      if (!form) {
        form = await this.createFormRow(
          ownerId,
          payload.title,
          payload.description,
          payload.theme,
          payload.state,
        );
      }

      if (form && payload.fields && payload.fields.length > 0) {
        await this.saveFieldsRows(form.id, payload.fields);
      }
      return form;
    } catch (error) {
      if (error instanceof apiErr) {
        throw error;
      }
      console.error("FormService.saveForm internal error:", error);
      throw apiErr.unknownErr("Failed to save form.");
    }
  }

  public async deleteForm(ownerId: string, formId: string) {
    try {
      await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, formId));
      const [deleted] = await db
        .delete(formsTable)
        .where(and(eq(formsTable.id, formId), eq(formsTable.ownerId, ownerId)))
        .returning();
      return deleted;
    } catch (error) {
      if (error instanceof apiErr) {
        throw error;
      }
      console.error("FormService.deleteForm internal error:", error);
      throw apiErr.unknownErr("Failed to delete form.");
    }
  }

  public async getPublicForm(formId: string) {
    try {
      const result = await this.getFormWithFields(formId);
      if (!result) {
        throw apiErr.dataNotFound("Form not found.");
      }
      return {
        form: {
          id: result.id,
          title: result.title,
          description: result.description,
          state: result.state,
          theme: result.theme,
          createdAt: result.createdAt,
        },
        fields: result.fields,
      };
    } catch (error) {
      if (error instanceof apiErr) throw error;
      console.error("FormService.getPublicForm internal error:", error);
      throw apiErr.unknownErr("Failed to fetch public form.");
    }
  }

  public async submitFormResponse(
    formId: string,
    answers: FormAnswerInput[],
    respondentIp?: string,
  ) {
    try {
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, formId));

      if (!form) {
        throw apiErr.dataNotFound("Form not found.");
      }

      // Fetch fields to validate required questions
      const fields = await db
        .select()
        .from(formFieldsTable)
        .where(eq(formFieldsTable.formId, formId))
        .orderBy(formFieldsTable.orderIndex);

      for (const field of fields) {
        const ans = answers.find((a) => a.fieldId === field.id);
        const val = ans?.value;
        const hasVal =
          val !== undefined && val !== null && (typeof val !== "string" || val.trim() !== "");
        const strVal = hasVal ? String(val).trim() : "";

        // 1. Required check
        if (field.isRequired && !hasVal) {
          throw apiErr.badRequest(`Field "${field.label}" is required and cannot be empty.`);
        }

        // If not empty, check types and rules
        if (hasVal) {
          const fType = field.fieldType || "short_text";
          const rules = field.validationRules || {};

          // 2. Format validation (pattern check from database)
          const errorMsg = await this.validateFieldValue(fType, strVal, rules);
          if (errorMsg) {
            throw apiErr.badRequest(errorMsg);
          }

          // 3. Number-specific validation
          if (fType === "number") {
            const num = Number(strVal);
            if (isNaN(num)) {
              throw apiErr.badRequest(`Field "${field.label}" must be a number.`);
            }
            if (rules.min !== undefined && num < Number(rules.min)) {
              throw apiErr.badRequest(
                `Field "${field.label}" value must be at least ${rules.min}.`,
              );
            }
            if (rules.max !== undefined && num > Number(rules.max)) {
              throw apiErr.badRequest(`Field "${field.label}" value cannot exceed ${rules.max}.`);
            }
          }

          // 4. Min/Max text length checks
          if (["short_text", "long_text", "rich_text"].includes(fType)) {
            if (rules.minLength !== undefined && strVal.length < Number(rules.minLength)) {
              throw apiErr.badRequest(
                `Field "${field.label}" must be at least ${rules.minLength} characters.`,
              );
            }
            if (rules.maxLength !== undefined && strVal.length > Number(rules.maxLength)) {
              throw apiErr.badRequest(
                `Field "${field.label}" cannot exceed ${rules.maxLength} characters.`,
              );
            }
          }
        }
      }

      const [submission] = await db
        .insert(formSubmissionsTable)
        .values({
          formId,
          answers,
          respondentIp: respondentIp || null,
        })
        .returning();

      return submission;
    } catch (error) {
      if (error instanceof apiErr) throw error;
      console.error("FormService.submitFormResponse internal error:", error);
      throw apiErr.unknownErr("Failed to record form submission.");
    }
  }

  private async getFormWithFields(formId: string) {
    try {
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, formId));

      if (!form) return null;

      const fields = await db
        .select()
        .from(formFieldsTable)
        .where(eq(formFieldsTable.formId, formId));

      return {
        ...form,
        fields,
      };
    } catch (error) {
      throw new Error(
        `getFormWithFields failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async getFormById(formId: string) {
    try {
      const form = await this.getFormWithFields(formId);
      if (!form) {
        throw apiErr.dataNotFound("Form not found.");
      }
      return form;
    } catch (error) {
      if (error instanceof apiErr) {
        throw error;
      }
      console.error("FormService.getFormById internal error:", error);
      throw apiErr.unknownErr("Failed to fetch form details.");
    }
  }

  public async getAvailableFieldTypes() {
    try {
      const result = await db.execute(sql`
        SELECT enumlabel 
        FROM pg_enum 
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
        WHERE pg_type.typname = 'field_type'
        ORDER BY pg_enum.enumsortorder
      `);

      const dbEnumValues = result.rows.map((row: any) => row.enumlabel as string);

      const metadataMap: Record<string, { name: string; category: string; icon: string }> = {
        short_text: { name: "Short Text", category: "Text", icon: "FileText" },
        long_text: { name: "Long Text", category: "Text", icon: "AlignLeft" },
        rich_text: { name: "Rich Text Editor", category: "Text", icon: "Edit3" },
        email: { name: "Email Address", category: "Contact", icon: "Mail" },
        phone_number: { name: "Phone Number", category: "Contact", icon: "Phone" },
        address: { name: "Street Address", category: "Contact", icon: "MapPin" },
        url: { name: "Website URL", category: "Contact", icon: "Globe" },
        number: { name: "Number Input", category: "Choice", icon: "Hash" },
        slider: { name: "Range Slider", category: "Choice", icon: "Sliders" },
        multiple_choice: { name: "Multiple Choice", category: "Choice", icon: "CheckSquare" },
        checkboxes: { name: "Checkboxes", category: "Choice", icon: "CheckSquare" },
        dropdown: { name: "Dropdown Select", category: "Choice", icon: "ChevronDown" },
        picture_choice: { name: "Picture Choice", category: "Choice", icon: "Image" },
        date: { name: "Date Picker", category: "Date & Time", icon: "Calendar" },
        time: { name: "Time Picker", category: "Date & Time", icon: "Clock" },
        rating: { name: "Star Rating", category: "Feedback", icon: "Star" },
        review: { name: "Customer Review", category: "Feedback", icon: "MessageSquare" },
        nps: { name: "Net Promoter Score (NPS)", category: "Feedback", icon: "BarChart3" },
        opinion_scale: { name: "Opinion Scale", category: "Feedback", icon: "SlidersHorizontal" },
        yes_no: { name: "Yes / No Toggle", category: "Choice", icon: "ToggleLeft" },
        statement: { name: "Statement Block", category: "Layout", icon: "Info" },
        matrix: { name: "Matrix Grid", category: "Advanced", icon: "Grid" },
        ranking: { name: "Drag & Drop Ranking", category: "Advanced", icon: "ListOrdered" },
        signature: { name: "E-Signature", category: "Advanced", icon: "PenTool" },
        payment: { name: "Payment Integration", category: "Advanced", icon: "CreditCard" },
        color_picker: { name: "Color Picker", category: "Advanced", icon: "Palette" },
        terms_consent: { name: "Terms & Consent", category: "Legal", icon: "ShieldCheck" },
        captcha: { name: "CAPTCHA Verification", category: "Security", icon: "Lock" },
      };

      return dbEnumValues.map((type) => {
        const meta = metadataMap[type] || {
          name: type
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          category: "Advanced",
          icon: "HelpCircle",
        };
        return {
          type,
          ...meta,
        };
      });
    } catch (error) {
      console.error("FormService.getAvailableFieldTypes internal error:", error);
      throw apiErr.unknownErr("Failed to fetch available field types.");
    }
  }
}

export default FormService;
