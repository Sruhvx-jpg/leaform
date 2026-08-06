// ++++++++++++++++++++++++ CODE OF CONDUCT ++++++++++++++++++++++++++
//1. Use private function to wrap drizzle db select and insert
//2. use try catch block everywhere, in catch block throw a error mentioning which private function it originated
//3. imports should first start with pnpm package -> in house modules/packages -> current working directory files


// in house modules

// current working directory files
import { GetAuthenticationMethodOutputSchema } from "./model";


class UserService {
  // ========================================== private methods ====================================================

  // ========================================= public methods ======================================================
  async getAuthenticationMethods(): Promise<GetAuthenticationMethodOutputSchema[]> {
    try {
      return [
        {
          provider: "GOOGLE_OAUTH",
          displayName: "Google",
          displayText: "Sign in with Google",
          authUrl: "/api/auth/google",
        },
      ];
    } catch (error) {
      throw new Error(
        `UserService.getAuthenticationMethods error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export default UserService;
