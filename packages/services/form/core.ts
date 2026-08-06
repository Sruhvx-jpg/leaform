// ++++++++++++++++++++++++ CODE OF CONDUCT ++++++++++++++++++++++++++
//1. Use private function to wrap drizzle db select and insert
//2. use try catch block everywhere, in catch block throw a error mentioning which private function it originated
//3. imports should first start with pnpm package -> in house modules/packages -> current working directory files

import { eq, and } from "drizzle-orm";

// in house modules
import db, { formsTable, formFieldsTable, formSubmissionsTable } from "@repo/database";
import { apiErr } from "@repo/utils";

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

  private async saveFieldsRows(formId: string, fields: any[]) {
    try {
      if (!fields || fields.length === 0) return [];
      const fieldRows = fields.map((f, idx) => ({
        formId,
        fieldType: f.type || "short_text",
        label: f.label,
        description: f.description || null,
        placeholder: f.placeholder || null,
        isRequired: !!f.required,
        orderIndex: idx,
        font: f.font || "Inter",
        style: f.style || null,
        options: f.options || null,
      }));

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
      fields: any[];
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
    answers: Array<{ fieldId?: string; label: string; value: any }>,
    respondentIp?: string,
  ) {
    try {
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, formId));

      if (!form) {
        throw apiErr.dataNotFound("Form not found.");
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
      return [
        { type: "short_text", name: "Short Text", category: "Text", icon: "FileText" },
        { type: "long_text", name: "Long Text", category: "Text", icon: "AlignLeft" },
        { type: "rich_text", name: "Rich Text Editor", category: "Text", icon: "Edit3" },
        { type: "email", name: "Email Address", category: "Contact", icon: "Mail" },
        { type: "phone_number", name: "Phone Number", category: "Contact", icon: "Phone" },
        { type: "address", name: "Street Address", category: "Contact", icon: "MapPin" },
        { type: "url", name: "Website URL", category: "Contact", icon: "Globe" },
        { type: "number", name: "Number Input", category: "Choice", icon: "Hash" },
        { type: "slider", name: "Range Slider", category: "Choice", icon: "Sliders" },
        {
          type: "multiple_choice",
          name: "Multiple Choice",
          category: "Choice",
          icon: "CheckSquare",
        },
        { type: "checkboxes", name: "Checkboxes", category: "Choice", icon: "CheckSquare" },
        { type: "dropdown", name: "Dropdown Select", category: "Choice", icon: "ChevronDown" },
        { type: "picture_choice", name: "Picture Choice", category: "Choice", icon: "Image" },
        { type: "date", name: "Date Picker", category: "Date & Time", icon: "Calendar" },
        { type: "time", name: "Time Picker", category: "Date & Time", icon: "Clock" },
        { type: "rating", name: "Star Rating", category: "Feedback", icon: "Star" },
        { type: "review", name: "Customer Review", category: "Feedback", icon: "MessageSquare" },
        { type: "nps", name: "Net Promoter Score (NPS)", category: "Feedback", icon: "BarChart3" },
        {
          type: "opinion_scale",
          name: "Opinion Scale",
          category: "Feedback",
          icon: "SlidersHorizontal",
        },
        { type: "yes_no", name: "Yes / No Toggle", category: "Choice", icon: "ToggleLeft" },
        { type: "statement", name: "Statement Block", category: "Layout", icon: "Info" },
        { type: "matrix", name: "Matrix Grid", category: "Advanced", icon: "Grid" },
        { type: "ranking", name: "Drag & Drop Ranking", category: "Advanced", icon: "ListOrdered" },
        { type: "signature", name: "E-Signature", category: "Advanced", icon: "PenTool" },
        { type: "payment", name: "Payment Integration", category: "Advanced", icon: "CreditCard" },
        { type: "color_picker", name: "Color Picker", category: "Advanced", icon: "Palette" },
        { type: "terms_consent", name: "Terms & Consent", category: "Legal", icon: "ShieldCheck" },
        { type: "captcha", name: "CAPTCHA Verification", category: "Security", icon: "Lock" },
      ];
    } catch (error) {
      console.error("FormService.getAvailableFieldTypes internal error:", error);
      throw apiErr.unknownErr("Failed to fetch available field types.");
    }
  }
}

export default FormService;
