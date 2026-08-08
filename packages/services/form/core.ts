// ++++++++++++++++++++++++ CODE OF CONDUCT ++++++++++++++++++++++++++
//1. Use private function to wrap drizzle db select and insert
//2. use try catch block everywhere, in catch block throw a error mentioning which private function it originated
//3. imports should first start with pnpm package -> in house modules/packages -> current working directory files

import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

// in house modules
import db, {
  formsTable,
  textFieldTable,
  formSubmissionsTable,
  FieldValidationConfig,
  FieldStyleConfig,
  workspaceMembersTable,
} from "@repo/database";
import { apiErr } from "@repo/utils";

import {
  SaveFieldInputType,
  SaveFormInputType,
  FormAnswerInputType,
  GetPublicFormOutputType,
  saveFormInputSchema,
  formAnswerInputSchema,
  GetFormSubmissionsOutputType,
} from "./model";

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
    workspaceId: string,
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
          workspaceId,
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
    rules: FieldValidationConfig,
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

    // 2. Fallback to static default pattern for common field types
    const defaultPatterns: Record<string, { pattern: string; message: string }> = {
      email: {
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        message: "Please enter a valid email address.",
      },
      url: {
        pattern: "^(https?:\\/\\/)?([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})([\\/\\w.-]*)*\\/?$",
        message: "Please enter a valid URL.",
      },
      phone_number: {
        pattern: "^\\+?[\\d\\s\\-()]{7,20}$",
        message: "Please enter a valid phone number.",
      },
      number: {
        pattern: "^-?\\d+(\\.\\d+)?$",
        message: "Please enter a valid number.",
      },
      date: {
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        message: "Please enter a valid date in YYYY-MM-DD format.",
      },
      time: {
        pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
        message: "Please enter a valid time in HH:MM format.",
      },
      color_picker: {
        pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
        message: "Please enter a valid hex color code.",
      },
    };

    const defaultPattern = defaultPatterns[fieldType];
    if (defaultPattern) {
      try {
        const regex = new RegExp(defaultPattern.pattern);
        if (!regex.test(strVal)) {
          return defaultPattern.message;
        }
      } catch (e) {
        console.error("Invalid default regex pattern for type:", fieldType, e);
      }
    }

    return null;
  }

  private async saveFieldsRows(formId: string, fields: SaveFieldInputType[]) {
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
          label: f.label,
          description: f.description || null,
          placeholder: f.placeholder || null,
          isRequired: f.required !== undefined ? f.required : true,
          orderIndex: f.orderIndex !== undefined ? f.orderIndex : idx,
          style: f.style || null,
          validationRules: rules,
        };
      });

      const inserted = await db
        .insert(textFieldTable)
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

  public async getUserForms(ownerId: string, workspaceId: string) {
    try {
      // Validate that user is a member of the workspace
      const [membership] = await db
        .select()
        .from(workspaceMembersTable)
        .where(
          and(
            eq(workspaceMembersTable.workspaceId, workspaceId),
            eq(workspaceMembersTable.userId, ownerId),
          ),
        );

      if (!membership) {
        throw apiErr.dataNotFound("You are not a member of this workspace.");
      }

      // Fetch forms belonging to this workspace, or legacy owner forms if this is default/no workspace specified
      const forms = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.workspaceId, workspaceId));

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
    payload: SaveFormInputType,
  ) {
    try {
      const validatedPayload = await saveFormInputSchema.parseAsync(payload);
      const workspaceId = validatedPayload.workspaceId;

      // Validate member read/write permissions
      const [membership] = await db
        .select()
        .from(workspaceMembersTable)
        .where(
          and(
            eq(workspaceMembersTable.workspaceId, workspaceId),
            eq(workspaceMembersTable.userId, ownerId),
          ),
        );

      if (!membership) {
        throw apiErr.dataNotFound("You are not a member of this workspace.");
      }
      if (membership.role === "read") {
        throw apiErr.dataNotFound("You have read-only access to this workspace.");
      }

      let form: any = null;
      if (validatedPayload.id) {
        // Validate form belongs to this workspace
        const [existingForm] = await db
          .select()
          .from(formsTable)
          .where(eq(formsTable.id, validatedPayload.id));

        if (!existingForm) {
          throw apiErr.dataNotFound("Form not found.");
        }
        if (existingForm.workspaceId && existingForm.workspaceId !== workspaceId) {
          throw apiErr.dataNotFound("Form does not belong to this workspace.");
        }

        const [updated] = await db
          .update(formsTable)
          .set({
            title: validatedPayload.title,
            description: validatedPayload.description || null,
            theme: validatedPayload.theme || null,
            state: validatedPayload.state || "drafted",
            updatedAt: new Date(),
          })
          .where(eq(formsTable.id, validatedPayload.id))
          .returning();

        form = updated;
        if (form) {
          await db.delete(textFieldTable).where(eq(textFieldTable.formId, form.id));
        }
      }

      if (!form) {
        form = await this.createFormRow(
          ownerId,
          workspaceId,
          validatedPayload.title,
          validatedPayload.description,
          validatedPayload.theme,
          validatedPayload.state,
        );
      }

      if (form && validatedPayload.fields && validatedPayload.fields.length > 0) {
        await this.saveFieldsRows(form.id, validatedPayload.fields);
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

  public async deleteForm(userId: string, formId: string) {
    try {
      const [formToDelete] = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.id, formId));

      if (!formToDelete) {
        throw apiErr.dataNotFound("Form not found.");
      }

      if (formToDelete.workspaceId) {
        const [membership] = await db
          .select()
          .from(workspaceMembersTable)
          .where(
            and(
              eq(workspaceMembersTable.workspaceId, formToDelete.workspaceId),
              eq(workspaceMembersTable.userId, userId),
            ),
          );

        if (!membership || membership.role === "read") {
          throw apiErr.dataNotFound("Unauthorized to delete forms in this workspace.");
        }
      } else {
        if (formToDelete.ownerId !== userId) {
          throw apiErr.dataNotFound("You are not the owner of this form.");
        }
      }

      await db.delete(textFieldTable).where(eq(textFieldTable.formId, formId));
      const [deleted] = await db
        .delete(formsTable)
        .where(eq(formsTable.id, formId))
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
    answers: FormAnswerInputType[],
    respondentIp?: string,
  ) {
    try {
      const validatedAnswers = await z.array(formAnswerInputSchema).parseAsync(answers);
      const [form] = await db.select().from(formsTable).where(eq(formsTable.id, formId));

      if (!form) {
        throw apiErr.dataNotFound("Form not found.");
      }

      // Fetch fields to validate required questions
      const fields = await db
        .select()
        .from(textFieldTable)
        .where(eq(textFieldTable.formId, formId))
        .orderBy(textFieldTable.orderIndex);

      for (const field of fields) {
        const ans = validatedAnswers.find((a) => a.fieldId === field.id);
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
          const fType = "short_text";
          const rules = field.validationRules || {};

          // 2. Format validation (pattern check from database)
          const errorMsg = await this.validateFieldValue(fType, strVal, rules);
          if (errorMsg) {
            throw apiErr.badRequest(errorMsg);
          }

          // 3. Min/Max text length checks
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

      const [submission] = await db
        .insert(formSubmissionsTable)
        .values({
          formId,
          answers: validatedAnswers,
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
        .from(textFieldTable)
        .where(eq(textFieldTable.formId, formId));

      return {
        ...form,
        fields: fields.map((f) => ({ ...f, fieldType: "short_text" })),
      };
    } catch (error) {
      console.error("DATABASE ERROR in getFormWithFields:", error);
      if (error && typeof error === "object") {
        console.error("DATABASE ERROR CAUSE:", (error as any).cause);
        console.error("DATABASE ERROR DETAIL:", (error as any).detail);
      }
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



  public async getFormSubmissions(ownerId: string, formId: string): Promise<GetFormSubmissionsOutputType> {
    try {
      const [form] = await db
        .select()
        .from(formsTable)
        .where(and(eq(formsTable.id, formId), eq(formsTable.ownerId, ownerId)));

      if (!form) {
        throw apiErr.unauthorizedAccess("form doesnt exist");
      }

      const fields = await db
        .select()
        .from(textFieldTable)
        .where(eq(textFieldTable.formId, formId))
        .orderBy(textFieldTable.orderIndex);

      const submissions = await db
        .select()
        .from(formSubmissionsTable)
        .where(eq(formSubmissionsTable.formId, formId))
        .orderBy(sql`${formSubmissionsTable.submittedAt} DESC`);

      return {
        form: {
          id: form.id,
          title: form.title,
          description: form.description,
          state: form.state,
        },
        fields: fields.map((f) => ({ ...f, fieldType: "short_text" })),
        submissions,
      };
    } catch (error) {
      if (error instanceof apiErr) throw error;
      console.error("FormService.getFormSubmissions internal error:", error);
      throw apiErr.unknownErr("Failed to fetch form submissions.");
    }
  }
}

export default FormService;
