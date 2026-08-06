import { zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { publicProcedure, TokenBasedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { setAuthToken } from "../../utils/cookie";
import {
  signUpUserInputModel,
  signUpUserOutputModel,
  loginUserInputModel,
  loginUserOutputModel,
  getMeOutputModel,
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  signUpUser: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/signup"), tags: TAGS } })
    .input(signUpUserInputModel)
    .output(signUpUserOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await userService.signup(input);
        setAuthToken(ctx, result.accessToken);
        return {
          fullName: result.fullName,
          email: result.email,
        };
      } catch (error) {
        throw error;
      }
    }),

  loginUser: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/login"), tags: TAGS } })
    .input(loginUserInputModel)
    .output(loginUserOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await userService.login(input);
        setAuthToken(ctx, result.accessToken);
        return {
          fullName: result.fullName,
          email: result.email,
        };
      } catch (error) {
        throw error;
      }
    }),

  getMe: TokenBasedProcedure.meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(getMeOutputModel)
    .query(async ({ ctx }) => {
      try {
        const user = await userService.getUserById(ctx.user.sub);
        return {
          fullName: user.fullName,
          email: user.email,
          emailVerified: user.emailVerified ?? false,
        };
      } catch (error) {
        throw error;
      }
    }),
});
