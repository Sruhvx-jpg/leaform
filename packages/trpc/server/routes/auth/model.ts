import { z } from "zod";

export const signUpUserInputModel = z.object({
  fullName: z.string().min(1, "Full name is required").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpUserOutputModel = z.object({
  fullName: z.string(),
  email: z.string(),
  emailVerified: z.boolean().optional(),
});

export const loginUserInputModel = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const loginUserOutputModel = z.object({
  fullName: z.string(),
  email: z.string(),
  emailVerified: z.boolean().optional(),
});

export const getMeOutputModel = z.object({
  fullName: z.string(),
  email: z.string(),
  emailVerified: z.boolean().optional(),
});
