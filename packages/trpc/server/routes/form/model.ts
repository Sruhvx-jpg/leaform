import { z } from "zod";

export const formItemModel = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  state: z.string(),
  theme: z.any().optional(),
  ownerId: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const getUserFormsOutputModel = z.union([z.array(formItemModel), z.literal(0)]);

export const fieldTypeMetadataModel = z.object({
  type: z.string(),
  name: z.string(),
  category: z.string(),
  icon: z.string(),
});

export const getAvailableFieldTypesOutputModel = z.array(fieldTypeMetadataModel);

export const saveFormInputModel = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  state: z.enum(["drafted", "published", "closed"]).optional(),
  theme: z
    .object({
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      accentColor: z.string().optional(),
      cardBackgroundColor: z.string().optional(),
      language: z.string().optional(),
      pages: z.array(z.any()).optional(),
    })
    .optional(),
  fields: z.array(
    z.object({
      type: z.string(),
      label: z.string(),
      description: z.string().optional(),
      placeholder: z.string().optional(),
      required: z.boolean().optional(),
      font: z.string().optional(),
      style: z
        .object({
          backgroundColor: z.string().optional(),
          textColor: z.string().optional(),
          accentColor: z.string().optional(),
          fontWeight: z.string().optional(),
          fontStyle: z.string().optional(),
          textDecoration: z.string().optional(),
        })
        .optional(),
      options: z.array(z.string()).optional(),
    }),
  ),
});

export const saveFormOutputModel = z.object({
  id: z.string(),
  title: z.string(),
});

export const deleteFormInputModel = z.object({
  id: z.string(),
});

export const deleteFormOutputModel = z.object({
  success: z.boolean(),
});

export const getPublicFormInputModel = z.object({
  id: z.string(),
});

export const getPublicFormOutputModel = z.object({
  form: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    state: z.string(),
    theme: z.any().optional(),
    createdAt: z.date().nullable().optional(),
  }),
  fields: z.array(z.any()),
});

export const submitFormResponseInputModel = z.object({
  formId: z.string(),
  answers: z.array(
    z.object({
      fieldId: z.string().optional(),
      label: z.string(),
      value: z.any(),
    }),
  ),
});

export const submitFormResponseOutputModel = z.object({
  success: z.boolean(),
  id: z.string().optional(),
});
