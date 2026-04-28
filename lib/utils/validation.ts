// lib/utils/validation.ts

import { z } from "zod";
import {
  confessionCategories,
  defaultConfessionCategory
} from "@/lib/categories";
import type {
  ConfessionCategory,
  ConfessionVisibility,
  ReportReason
} from "@/lib/types";

export const confessionTitleMaxLength = 80;
export const confessionBodyMinLength = 20;
export const confessionBodyMaxLength = 1000;
export const reportDetailsMaxLength = 500;

const visibilityValues = ["public", "private"] as const satisfies ReadonlyArray<ConfessionVisibility>;

const reportReasonValues = [
  "Names or personal information",
  "Harassment or revenge posting",
  "Threats or violence",
  "Hate or discrimination",
  "Self-harm concern",
  "Sexual content",
  "Spam",
  "Other"
] as const satisfies ReadonlyArray<ReportReason>;

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

export const confessionCategorySchema = z
  .enum(confessionCategories)
  .catch(defaultConfessionCategory);

export const confessionVisibilitySchema = z.enum(visibilityValues);

export const confessionTitleSchema = z
  .string()
  .max(confessionTitleMaxLength, "Title must be 80 characters or fewer.")
  .transform(normalizeOptionalText);

export const confessionBodySchema = z
  .string()
  .trim()
  .min(
    confessionBodyMinLength,
    "Confession must be at least 20 characters."
  )
  .max(
    confessionBodyMaxLength,
    "Confession must be 1000 characters or fewer."
  );

export const createConfessionSchema = z.object({
  category: confessionCategorySchema,
  title: confessionTitleSchema,
  body: confessionBodySchema,
  visibility: confessionVisibilitySchema
});

export const updateConfessionSchema = z.object({
  category: confessionCategorySchema,
  title: confessionTitleSchema,
  body: confessionBodySchema,
  visibility: confessionVisibilitySchema
});

export const reportReasonSchema = z.enum(reportReasonValues);

export const createReportSchema = z.object({
  publicId: z
    .string()
    .trim()
    .min(8, "Invalid confession.")
    .max(32, "Invalid confession."),
  reason: reportReasonSchema,
  details: z
    .string()
    .max(reportDetailsMaxLength, "Report details must be 500 characters or fewer.")
    .transform(normalizeOptionalText)
});

export const adminSettingsSchema = z.object({
  submissions_enabled: z.boolean(),
  reactions_enabled: z.boolean(),
  approval_mode_enabled: z.boolean(),
  private_confessions_enabled: z.boolean(),
  minimum_confession_length: z
    .number()
    .int()
    .min(20)
    .max(1000),
  maximum_confession_length: z
    .number()
    .int()
    .min(20)
    .max(1000)
}).refine(
  (settings) =>
    settings.minimum_confession_length <= settings.maximum_confession_length,
  {
    message: "Minimum confession length cannot exceed maximum confession length.",
    path: ["minimum_confession_length"]
  }
);

export type CreateConfessionInput = z.infer<typeof createConfessionSchema>;

export type UpdateConfessionInput = z.infer<typeof updateConfessionSchema>;

export type CreateReportInput = z.infer<typeof createReportSchema>;

export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>;

export function parseConfessionCategoryForForm(value: string): ConfessionCategory {
  const result = confessionCategorySchema.safeParse(value);

  if (result.success) {
    return result.data;
  }

  return defaultConfessionCategory;
}