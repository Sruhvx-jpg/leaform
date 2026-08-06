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

export const fieldTypeMetadataSchema = z.object({
  type: z.string(),
  name: z.string(),
  category: z.string(),
  icon: z.string(),
});

export const getAvailableFieldTypesOutput = z.array(fieldTypeMetadataSchema);

export type FieldTypeMetadataType = z.infer<typeof fieldTypeMetadataSchema>;
