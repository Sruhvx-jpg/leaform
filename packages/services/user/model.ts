import { z } from "zod";

export const getAuthenticationMethodOutputSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH"]),
  displayName: z.string().optional(),
  displayText: z.string().optional(),
  authUrl: z.string(),
});

export type GetAuthenticationMethodOutputSchema = z.infer<
  typeof getAuthenticationMethodOutputSchema
>;

export const SignupUserInput = z.object({
  fullName: z.string().min(1, "Full name is required").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupUserInputType = z.infer<typeof SignupUserInput>;

export const LoginUserInput = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginUserInputType = z.infer<typeof LoginUserInput>;

export interface SignupOutput {
  fullName: string;
  email: string;
  accessToken: string;
}

export interface UserProfileOutput {
  fullName: string;
  email: string;
}
