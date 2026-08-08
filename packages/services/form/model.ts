import { z } from "zod";

export const getUserFormsOutput = z.union([
  z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      state: z.enum(["drafted", "published", "closed"]),
      ownerId: z.string(),
      createdAt: z.date().nullable(),
      updatedAt: z.date().nullable(),
    }),
  ),
  z.literal(0),
]);

export type GetUserFormsOutputType = z.infer<typeof getUserFormsOutput>;



// Save Field Input Schema & Type
export const saveFieldInputSchema = z.object({
  type: z.string().optional(),
  label: z.string(),
  description: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  required: z.boolean().optional(),
  font: z.string().optional(),
  style: z.any().optional(),
  options: z.array(z.string()).optional().nullable(),
  validationRules: z.any().optional(),
  orderIndex: z.number().optional(),
});

export type SaveFieldInputType = z.infer<typeof saveFieldInputSchema>;

// Save Form Input Schema & Type
export const saveFormInputSchema = z.object({
  id: z.string().optional(),
  workspaceId: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  theme: z.any().optional(),
  state: z.enum(["drafted", "published", "closed"]).optional(),
  fields: z.array(saveFieldInputSchema),
});

export type SaveFormInputType = z.infer<typeof saveFormInputSchema>;

// Form Answer Input Schema & Type
export const formAnswerInputSchema = z.object({
  fieldId: z.string().optional(),
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

export type FormAnswerInputType = z.infer<typeof formAnswerInputSchema>;

// Get Public Form Output Schema & Type
export const getPublicFormOutputSchema = z.object({
  form: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    state: z.enum(["drafted", "published", "closed"]),
    theme: z.any().nullable().optional(),
    createdAt: z.date().nullable().optional(),
  }),
  fields: z.array(z.any()),
});

export type GetPublicFormOutputType = z.infer<typeof getPublicFormOutputSchema>;

// Get Form Submissions Schema & Type
export const getFormSubmissionsOutputSchema = z.object({
  form: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    state: z.string(),
  }),
  fields: z.array(z.any()),
  submissions: z.array(
    z.object({
      id: z.string(),
      answers: z.array(
        z.object({
          fieldId: z.string().optional(),
          label: z.string(),
          value: z.any(),
        })
      ),
      submittedAt: z.date(),
      respondentIp: z.string().nullable().optional(),
    })
  ),
});

export type GetFormSubmissionsOutputType = z.infer<typeof getFormSubmissionsOutputSchema>;
