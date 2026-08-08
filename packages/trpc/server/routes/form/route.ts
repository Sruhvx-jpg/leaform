import { z } from "zod";
import { zodUndefinedModel } from "../../schema";
import { formService } from "../../services";
import { TokenBasedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  getUserFormsOutputModel,
  saveFormInputModel,
  saveFormOutputModel,
  deleteFormInputModel,
  deleteFormOutputModel,
  getPublicFormInputModel,
  getPublicFormOutputModel,
  submitFormResponseInputModel,
  submitFormResponseOutputModel,
  getFormSubmissionsInputModel,
} from "./model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formRouter = router({
  getUserForms: TokenBasedProcedure.meta({
    openapi: { method: "GET", path: getPath("/user-forms"), tags: TAGS },
  })
    .input(z.object({ workspaceId: z.string().uuid() }))
    .output(getUserFormsOutputModel)
    .query(async ({ ctx, input }) => {
      try {
        const result = await formService.getUserForms(ctx.user.sub, input.workspaceId);
        return result;
      } catch (error) {
        throw error;
      }
    }),

  saveForm: TokenBasedProcedure.meta({
    openapi: { method: "POST", path: getPath("/save"), tags: TAGS },
  })
    .input(saveFormInputModel)
    .output(saveFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await formService.saveForm(ctx.user.sub, input);
        if (!result) {
          throw new Error("Failed to save form.");
        }
        return { id: result.id, title: result.title };
      } catch (error) {
        throw error;
      }
    }),


  deleteForm: TokenBasedProcedure.meta({
    openapi: { method: "POST", path: getPath("/delete"), tags: TAGS },
  })
    .input(deleteFormInputModel)
    .output(deleteFormOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        await formService.deleteForm(ctx.user.sub, input.id);
        return { success: true };
      } catch (error) {
        throw error;
      }
    }),

  getPublicForm: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("/public"), tags: TAGS } })
    .input(getPublicFormInputModel)
    .output(getPublicFormOutputModel)
    .query(async ({ input }) => {
      try {
        const result = await formService.getPublicForm(input.id);
        return result;
      } catch (error) {
        throw error;
      }
    }),

  submitFormResponse: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/submit-response"), tags: TAGS } })
    .input(submitFormResponseInputModel)
    .output(submitFormResponseOutputModel)
    .mutation(async ({ ctx, input }) => {
      try {
        const res = await formService.submitFormResponse(input.formId, input.answers, ctx.req.ip);
        return { success: true, id: res?.id ?? undefined };
      } catch (error) {
        throw error;
      }
    }),

  getFormSubmissions: TokenBasedProcedure.meta({
    openapi: { method: "GET", path: getPath("/submissions"), tags: TAGS },
  })
    .input(getFormSubmissionsInputModel)
    .output(z.any())
    .query(async ({ ctx, input }) => {
      try {
        const result = await formService.getFormSubmissions(ctx.user.sub, input.formId);
        return result;
      } catch (error) {
        throw error;
      }
    }),
});
