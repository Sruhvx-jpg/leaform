import { eq, and } from "drizzle-orm";
import db, {
  workspacesTable,
  workspaceMembersTable,
  usersTable,
  SelectWorkspace,
} from "@repo/database";

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "LF-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += "-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

class WorkspaceService {
  private async provisionDefaultWorkspace(userId: string): Promise<SelectWorkspace[]> {
    try {
      const code = generateInviteCode();
      const [newWorkspace] = await db
        .insert(workspacesTable)
        .values({
          name: "My Workspace",
          ownerId: userId,
          inviteCode: code,
        })
        .returning();

      if (!newWorkspace) {
        throw new Error("Failed to insert default workspace row.");
      }

      await db.insert(workspaceMembersTable).values({
        workspaceId: newWorkspace.id,
        userId: userId,
        role: "owner",
      });

      return [newWorkspace];
    } catch (error) {
      throw new Error(
        `provisionDefaultWorkspace failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async getUserWorkspaces(userId: string) {
    try {
      // Find all workspaces where user is a member
      const memberRows = await db
        .select({
          workspace: workspacesTable,
          role: workspaceMembersTable.role,
        })
        .from(workspaceMembersTable)
        .innerJoin(workspacesTable, eq(workspaceMembersTable.workspaceId, workspacesTable.id))
        .where(eq(workspaceMembersTable.userId, userId));

      if (memberRows.length === 0) {
        // Auto-provision default workspace
        const provisioned = await this.provisionDefaultWorkspace(userId);
        return provisioned.map((ws) => ({
          id: ws.id,
          name: ws.name,
          ownerId: ws.ownerId,
          inviteCode: ws.inviteCode,
          role: "owner" as const,
        }));
      }

      return memberRows.map((row) => ({
        id: row.workspace.id,
        name: row.workspace.name,
        ownerId: row.workspace.ownerId,
        inviteCode: row.workspace.inviteCode,
        role: row.role,
      }));
    } catch (error) {
      throw new Error(
        `getUserWorkspaces failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async createWorkspace(userId: string, name: string) {
    try {
      const code = generateInviteCode();
      // Cap workspaces owned by user at 5
      const ownedWorkspaces = await db
        .select()
        .from(workspacesTable)
        .where(eq(workspacesTable.ownerId, userId));

      if (ownedWorkspaces.length >= 5) {
        throw new Error("You have reached the limit of 5 workspaces.");
      }

      const [newWorkspace] = await db
        .insert(workspacesTable)
        .values({
          name,
          ownerId: userId,
          inviteCode: code,
        })
        .returning();

      if (!newWorkspace) {
        throw new Error("Failed to create workspace.");
      }

      await db.insert(workspaceMembersTable).values({
        workspaceId: newWorkspace.id,
        userId: userId,
        role: "owner",
      });

      return {
        id: newWorkspace.id,
        name: newWorkspace.name,
        ownerId: newWorkspace.ownerId,
        inviteCode: newWorkspace.inviteCode,
        role: "owner" as const,
      };
    } catch (error) {
      throw new Error(
        `createWorkspace failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async joinWorkspace(userId: string, inviteCode: string) {
    try {
      const formattedCode = inviteCode.trim().toUpperCase();
      const [workspace] = await db
        .select()
        .from(workspacesTable)
        .where(eq(workspacesTable.inviteCode, formattedCode));

      if (!workspace) {
        throw new Error("Workspace not found with the provided invite code.");
      }

      if (workspace.ownerId === userId) {
        throw new Error("You are the owner of this workspace.");
      }

      // Check if user is already a member
      const [existingMember] = await db
        .select()
        .from(workspaceMembersTable)
        .where(
          and(
            eq(workspaceMembersTable.workspaceId, workspace.id),
            eq(workspaceMembersTable.userId, userId),
          ),
        );

      if (existingMember) {
        throw new Error("You are already a member of this workspace.");
      }

      // Join as default "read" access level
      await db.insert(workspaceMembersTable).values({
        workspaceId: workspace.id,
        userId,
        role: "read",
      });

      return {
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.ownerId,
        inviteCode: workspace.inviteCode,
        role: "read" as const,
      };
    } catch (error) {
      throw new Error(
        `joinWorkspace failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async getWorkspaceMembers(userId: string, workspaceId: string) {
    try {
      // Validate that caller is a member of the workspace
      const [callerMembership] = await db
        .select()
        .from(workspaceMembersTable)
        .where(
          and(
            eq(workspaceMembersTable.workspaceId, workspaceId),
            eq(workspaceMembersTable.userId, userId),
          ),
        );

      if (!callerMembership) {
        throw new Error("Unauthorized access to workspace members.");
      }

      const members = await db
        .select({
          id: usersTable.id,
          fullName: usersTable.fullName,
          email: usersTable.email,
          role: workspaceMembersTable.role,
        })
        .from(workspaceMembersTable)
        .innerJoin(usersTable, eq(workspaceMembersTable.userId, usersTable.id))
        .where(eq(workspaceMembersTable.workspaceId, workspaceId));

      return members;
    } catch (error) {
      throw new Error(
        `getWorkspaceMembers failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async updateMemberRole(
    userId: string,
    workspaceId: string,
    targetUserId: string,
    role: "owner" | "read" | "write",
  ) {
    try {
      // Verify active user is the owner of the workspace
      const [callerMembership] = await db
        .select()
        .from(workspaceMembersTable)
        .where(
          and(
            eq(workspaceMembersTable.workspaceId, workspaceId),
            eq(workspaceMembersTable.userId, userId),
          ),
        );

      if (!callerMembership || callerMembership.role !== "owner") {
        throw new Error("Only workspace owners can update roles.");
      }

      await db
        .update(workspaceMembersTable)
        .set({ role })
        .where(
          and(
            eq(workspaceMembersTable.workspaceId, workspaceId),
            eq(workspaceMembersTable.userId, targetUserId),
          ),
        );

      return { success: true };
    } catch (error) {
      throw new Error(
        `updateMemberRole failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

export default WorkspaceService;
