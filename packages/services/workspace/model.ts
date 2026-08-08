import { z } from "zod";

export const createWorkspaceInputSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceInputSchema>;

export const joinWorkspaceInputSchema = z.object({
  inviteCode: z.string().length(12, "Invite code must be 12 characters"),
});

export type JoinWorkspaceInput = z.infer<typeof joinWorkspaceInputSchema>;

export const updateMemberRoleInputSchema = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["owner", "read", "write"]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleInputSchema>;
