// lib/categories.ts

import type { ConfessionCategory } from "@/lib/types";

export const confessionCategories = [
  "I still love them",
  "I lied",
  "I miss someone",
  "I regret it",
  "I am scared",
  "I feel alone",
  "I am pretending",
  "I never told anyone",
  "I wish I could go back",
  "I cannot forgive myself",
  "Other"
] as const satisfies ReadonlyArray<ConfessionCategory>;

export const defaultConfessionCategory: ConfessionCategory = "Other";

export function isConfessionCategory(value: string): value is ConfessionCategory {
  return confessionCategories.some((category) => category === value);
}

export function parseConfessionCategory(value: string): ConfessionCategory | null {
  if (isConfessionCategory(value)) {
    return value;
  }

  return null;
}