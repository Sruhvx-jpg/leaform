import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";

import { redis, verifyAccTok } from "@repo/utils";
import { getAuthToken } from "./utils/cookie";
import { createAnalyticsMiddleware } from "@repo/innjest/server";

//++++++++++++ This file has middle integrateed for procedures +++++++++++++++
// you can add the middleware to procedure using the ".use()" 

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createContext>()
  .create({});


// router
export const router = tRPCContext.router;


// middlewares
const analyticsMiddleware = tRPCContext.middleware(createAnalyticsMiddleware());

const fixedWindowRateLimiter = tRPCContext.middleware(async ({ ctx, next }) => {
  try {
    const ip = ctx.req?.ip || "127.0.0.1";
    const key = `FWRL:${ip}`;
    const curr = await redis.incr(key);

    if (curr === 1) {
      await redis.expire(key, 60);
    }

    if (curr > 100) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests. Try again later.",
      });
    }
  } catch (err) {
    if (err instanceof TRPCError) throw err;
    // Suppress Redis connection failures when Redis server is offline
  }

  return next();
});

const verifyToken = tRPCContext.middleware(async ({ ctx, next }) => {
  const token = getAuthToken(ctx);

  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Access token missing",
    });
  }

  try {
    const payload = verifyAccTok(token);

    return next({
      ctx: {
        ...ctx,
        user: payload,
      },
    });
  } catch (err: any) {
    console.error("[AUTH VERIFY ERROR]:", err?.name, err?.message);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: err?.name === "TokenExpiredError"
        ? "Access token expired. Please log in again."
        : "Invalid access token",
    });
  }
});

// procedures
export const TokenBasedProcedure = tRPCContext.procedure.use(verifyToken).use(analyticsMiddleware);
export const publicProcedure = tRPCContext.procedure.use(analyticsMiddleware);

