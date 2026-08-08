import { z } from "zod";

export const workspaceRoleModel = z.enum(["owner", "read", "write"]);

export const workspaceItemModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  ownerId: z.string().uuid(),
  inviteCode: z.string(),
  role: workspaceRoleModel,
});

export const getUserWorkspacesOutputModel = z.array(workspaceItemModel);

export const createWorkspaceInputModel = z.object({
  name: z.string().min(1).max(100),
});

export const createWorkspaceOutputModel = workspaceItemModel;

export const joinWorkspaceInputModel = z.object({
  inviteCode: z.string(),
});

export const joinWorkspaceOutputModel = workspaceItemModel;

export const getWorkspaceMembersInputModel = z.object({
  workspaceId: z.string().uuid(),
});

export const workspaceMemberModel = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  email: z.string(),
  role: workspaceRoleModel,
});

export const getWorkspaceMembersOutputModel = z.array(workspaceMemberModel);

export const updateMemberRoleInputModel = z.object({
  workspaceId: z.string().uuid(),
  userId: z.string().uuid(),
  role: workspaceRoleModel,
});

export const updateMemberRoleOutputModel = z.object({
  success: z.boolean(),
});
