import { pgEnum, pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "../user/user";

export const workspaceRoleEnum = pgEnum("workspace_role", ["owner", "read", "write"]);

export const workspacesTable = pgTable("leaf_workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  inviteCode: varchar("invite_code", { length: 12 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const workspaceMembersTable = pgTable("leaf_workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspacesTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  role: workspaceRoleEnum("role").default("read").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectWorkspace = typeof workspacesTable.$inferSelect;
export type InsertWorkspace = typeof workspacesTable.$inferInsert;
export type SelectWorkspaceMember = typeof workspaceMembersTable.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembersTable.$inferInsert;
export type WorkspaceRole = (typeof workspaceRoleEnum.enumValues)[number];
