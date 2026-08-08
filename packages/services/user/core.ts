// ++++++++++++++++++++++++ CODE OF CONDUCT ++++++++++++++++++++++++++
//1. Use private function to wrap drizzle db select and insert
//2. use try catch block everywhere, in catch block throw a error mentioning which private function it originated
//3. imports should first start with pnpm package -> in house modules/packages -> current working directory files

import { eq } from "drizzle-orm";

// in house modules
import db, {
  usersTable,
  refreshTokensTable,
  InsertUser,
  InsertRefreshToken,
  workspacesTable,
  workspaceMembersTable,
} from "@repo/database";
import { apiErr, hashIT, comparePass, generateAccTok, generateRefTok } from "@repo/utils";

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

// current working directory files
import { SignupUserInput, SignupUserInputType, LoginUserInput, LoginUserInputType } from "./model";

class UserService {
  // ========================================== private methods ====================================================

  private async getUserByEmail(email: string) {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

      return user;
    } catch (error) {
      throw new Error(
        `getUserByEmail failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async findUserById(id: string) {
    try {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);

      return user || null;
    } catch (error) {
      console.error("DATABASE ERROR in findUserById:", error);
      if (error && typeof error === "object") {
        console.error("DATABASE ERROR CAUSE:", (error as any).cause);
        console.error("DATABASE ERROR DETAIL:", (error as any).detail);
      }
      throw new Error(
        `findUserById failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async createUserInDB(data: InsertUser) {
    try {
      const [user] = await db.insert(usersTable).values(data).returning();
      if (!user) {
        throw new Error("Failed to insert user record");
      }
      return user;
    } catch (error) {
      throw new Error(
        `createUserInDB failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async storeRefreshTokenInDB(userId: string, token: string) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const tokenData: InsertRefreshToken = {
        userId,
        token,
        expiresAt,
      };

      await db.insert(refreshTokensTable).values(tokenData);
    } catch (error) {
      throw new Error(
        `storeRefreshTokenInDB failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // ========================================= public methods ======================================================

  public async getAuthenticationMethods() {
    try {
      return [
        {
          provider: "GOOGLE_OAUTH" as const,
          displayName: "Google",
          displayText: "Sign in with Google",
          authUrl: "/api/auth/google",
        },
      ];
    } catch (error) {
      throw new Error(
        `UserService.getAuthenticationMethods error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async signup(payload: SignupUserInputType) {
    try {
      const validatedData = await SignupUserInput.parseAsync(payload);

      const existingUser = await this.getUserByEmail(validatedData.email);

      if (existingUser) {
        throw apiErr.dataAlreadyExist("user with email already registered");
      }

      const hashedPassword = await hashIT(validatedData.password);

      const newUser = await this.createUserInDB({
        fullName: validatedData.fullName,
        email: validatedData.email,
        password: hashedPassword,
      });

      const accessToken = generateAccTok({ sub: newUser.id });
      const refreshToken = generateRefTok({ sub: newUser.id });

      // Auto-provision default workspace on signup
      const code = generateInviteCode();
      const [newWorkspace] = await db
        .insert(workspacesTable)
        .values({
          name: "My Workspace",
          ownerId: newUser.id,
          inviteCode: code,
        })
        .returning();

      if (newWorkspace) {
        await db.insert(workspaceMembersTable).values({
          workspaceId: newWorkspace.id,
          userId: newUser.id,
          role: "owner",
        });
      }

      await this.storeRefreshTokenInDB(newUser.id, refreshToken);

      return {
        fullName: newUser.fullName,
        email: newUser.email,
        accessToken,
      };
    } catch (error) {
      if (error instanceof apiErr) {
        throw error;
      }
      console.error("UserService.signup internal error:", error);
      throw apiErr.unknownErr("An unexpected error occurred. Please try again later.");
    }
  }

  public async login(payload: LoginUserInputType) {
    try {
      const validatedData = await LoginUserInput.parseAsync(payload);

      const user = await this.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        throw apiErr.unauthorizedAccess("Invalid email or password");
      }

      const isValidPassword = await comparePass(validatedData.password, user.password);
      if (!isValidPassword) {
        throw apiErr.unauthorizedAccess("Invalid email or password");
      }

      const accessToken = generateAccTok({ sub: user.id });
      const refreshToken = generateRefTok({ sub: user.id });

      await this.storeRefreshTokenInDB(user.id, refreshToken);

      return {
        fullName: user.fullName,
        email: user.email,
        accessToken,
      };
    } catch (error) {
      if (error instanceof apiErr) {
        throw error;
      }
      console.error("UserService.login internal error:", error);
      throw apiErr.unknownErr("An unexpected error occurred. Please try again later.");
    }
  }

  public async getUserById(id: string) {
    try {
      const user = await this.findUserById(id);
      if (!user) {
        throw apiErr.dataNotFound("User not found");
      }

      return {
        fullName: user.fullName,
        email: user.email,
        emailVerified: user.emailVerified ?? false,
      };
    } catch (error) {
      if (error instanceof apiErr) {
        throw error;
      }
      console.error("UserService.getUserById internal error:", error);
      throw apiErr.unknownErr("An unexpected error occurred. Please try again later.");
    }
  }
}

export default UserService;
