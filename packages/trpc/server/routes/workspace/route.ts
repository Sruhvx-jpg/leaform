import { TokenBasedProcedure, router } from "../../trpc";
import { workspaceService } from "../../services";
import {
  getUserWorkspacesOutputModel,
  createWorkspaceInputModel,
  createWorkspaceOutputModel,
  joinWorkspaceInputModel,
  joinWorkspaceOutputModel,
  getWorkspaceMembersInputModel,
  getWorkspaceMembersOutputModel,
  updateMemberRoleInputModel,
  updateMemberRoleOutputModel,
} from "./model";

import { zodUndefinedModel } from "../../schema";

export const workspaceRouter = router({
  getUserWorkspaces: TokenBasedProcedure
    .output(getUserWorkspacesOutputModel)
    .query(async ({ ctx }) => {
      try {
        const workspaces = await workspaceService.getUserWorkspaces(ctx.user.sub);
        return workspaces;
      } catch (error) {
        throw error;
      }
    }),

  createWorkspace: TokenBasedProcedure
    .input(createWorkspaceInputModel)
    .output(createWorkspaceOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await workspaceService.createWorkspace(ctx.user.sub, input.name);
        return workspace;
      } catch (error) {
        throw error;
      }
    }),

  joinWorkspace: TokenBasedProcedure
    .input(joinWorkspaceInputModel)
    .output(joinWorkspaceOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        const workspace = await workspaceService.joinWorkspace(ctx.user.sub, input.inviteCode);
        return workspace;
      } catch (error) {
        throw error;
      }
    }),

  getWorkspaceMembers: TokenBasedProcedure
    .input(getWorkspaceMembersInputModel)
    .output(getWorkspaceMembersOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        const members = await workspaceService.getWorkspaceMembers(ctx.user.sub, input.workspaceId);
        return members;
      } catch (error) {
        throw error;
      }
    }),

  updateMemberRole: TokenBasedProcedure
    .input(updateMemberRoleInputModel)
    .output(updateMemberRoleOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        const res = await workspaceService.updateMemberRole(
          ctx.user.sub,
          input.workspaceId,
          input.userId,
          input.role,
        );
        return res;
      } catch (error) {
        throw error;
      }
    }),
});
