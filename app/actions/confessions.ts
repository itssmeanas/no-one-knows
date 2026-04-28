// app/actions/confessions.ts

"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { generatePublicId } from "@/lib/utils/ids";
import { buildManageUrl, generateManageToken, hashManageToken } from "@/lib/utils/tokens";
import { getRequestIpHash } from "@/lib/utils/security";
import { createConfessionSchema } from "@/lib/utils/validation";
import {
  hasHoneypotValue,
  moderateConfessionText,
  normalizeModerationTextParts
} from "@/lib/utils/moderation";
import type { ConfessionInsert } from "@/lib/types";

export type CreateConfessionActionInput = {
  category: string;
  title: string;
  body: string;
  visibility: string;
  honeypot?: string;
};

export type CreateConfessionActionResult =
  | {
      ok: true;
      publicId: string;
      manageUrl: string;
    }
  | {
      ok: false;
      error: string;
    };

function getAppUrl(): string {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("Missing APP_URL environment variable.");
  }

  return appUrl;
}

async function generateUniquePublicId(): Promise<string> {
  const supabase = createAdminClient();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const publicId = generatePublicId();

    const { data, error } = await supabase
      .from("confessions")
      .select("id")
      .eq("public_id", publicId)
      .maybeSingle();

    if (error) {
      throw new Error("Unable to check public ID uniqueness.");
    }

    if (!data) {
      return publicId;
    }
  }

  throw new Error("Unable to generate a unique public ID.");
}

async function getApprovalStatus(): Promise<"pending" | "approved"> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "approval_mode_enabled")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to read approval setting.");
  }

  return data?.value === "true" ? "pending" : "approved";
}

async function getSubmissionsEnabled(): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "submissions_enabled")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to read submissions setting.");
  }

  return data?.value !== "false";
}

async function getPrivateConfessionsEnabled(): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "private_confessions_enabled")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to read private confession setting.");
  }

  return data?.value !== "false";
}

export async function createConfession(
  input: CreateConfessionActionInput
): Promise<CreateConfessionActionResult> {
  if (hasHoneypotValue(input.honeypot)) {
    return {
      ok: false,
      error: "Something went wrong. Please try again."
    };
  }

  const submissionsEnabled = await getSubmissionsEnabled();

  if (!submissionsEnabled) {
    return {
      ok: false,
      error: "The room is closed for new confessions right now."
    };
  }

  const parsedInput = createConfessionSchema.safeParse({
    category: input.category,
    title: input.title,
    body: input.body,
    visibility: input.visibility
  });

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Check your confession and try again."
    };
  }

  const privateConfessionsEnabled = await getPrivateConfessionsEnabled();

  if (parsedInput.data.visibility === "private" && !privateConfessionsEnabled) {
    return {
      ok: false,
      error: "Private confessions are not available right now."
    };
  }

  const moderationText = normalizeModerationTextParts([
    parsedInput.data.title,
    parsedInput.data.body
  ]);
  const moderationResult = moderateConfessionText(moderationText);

  if (!moderationResult.allowed) {
    return {
      ok: false,
      error:
        moderationResult.issues[0]?.message ??
        "Please remove identifying or unsafe details before submitting."
    };
  }

  const supabase = createAdminClient();
  const publicId = await generateUniquePublicId();
  const manageToken = generateManageToken();
  const manageTokenHash = hashManageToken(manageToken);
  const approvalStatus = moderationResult.shouldFlag
    ? "pending"
    : await getApprovalStatus();
  const ipHash = await getRequestIpHash();

  const confessionInsert: ConfessionInsert = {
    public_id: publicId,
    title: parsedInput.data.title,
    category: parsedInput.data.category,
    body: parsedInput.data.body,
    visibility: parsedInput.data.visibility,
    approval_status: approvalStatus,
    manage_token_hash: manageTokenHash
  };

  const { data, error } = await supabase
    .from("confessions")
    .insert(confessionInsert)
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "Could not place this confession in the archive. Please try again."
    };
  }

  if (moderationResult.shouldFlag) {
    await supabase.from("audit_logs").insert({
      action: "confession_flagged_on_create",
      entity_type: "confession",
      entity_id: data.id,
      metadata: {
        publicId,
        issues: moderationResult.issues,
        ipHash
      }
    });
  }

  return {
    ok: true,
    publicId,
    manageUrl: buildManageUrl({
      appUrl: getAppUrl(),
      token: manageToken
    })
  };
}