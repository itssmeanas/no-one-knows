// app/actions/manage.ts

"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hashManageToken } from "@/lib/utils/tokens";
import { updateConfessionSchema } from "@/lib/utils/validation";
import {
  moderateConfessionText,
  normalizeModerationTextParts
} from "@/lib/utils/moderation";
import type { ConfessionUpdate } from "@/lib/types";

export type UpdateManagedConfessionInput = {
  token: string;
  category: string;
  title: string;
  body: string;
  visibility: string;
};

export type DeleteManagedConfessionInput = {
  token: string;
};

export type ManagedConfessionActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

function getTokenHashFromRawToken(token: string): string | null {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    return null;
  }

  return hashManageToken(trimmedToken);
}

async function getConfessionIdByManageTokenHash(
  manageTokenHash: string
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("confessions")
    .select("id")
    .eq("manage_token_hash", manageTokenHash)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.id;
}

export async function updateManagedConfession(
  input: UpdateManagedConfessionInput
): Promise<ManagedConfessionActionResult> {
  const manageTokenHash = getTokenHashFromRawToken(input.token);

  if (!manageTokenHash) {
    return {
      ok: false,
      error: "This manage link is invalid or expired."
    };
  }

  const parsedInput = updateConfessionSchema.safeParse({
    category: input.category,
    title: input.title,
    body: input.body,
    visibility: input.visibility
  });

  if (!parsedInput.success) {
    return {
      ok: false,
      error:
        parsedInput.error.issues[0]?.message ??
        "Check your confession and try again."
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
        "Please remove identifying or unsafe details before saving."
    };
  }

  const confessionId = await getConfessionIdByManageTokenHash(manageTokenHash);

  if (!confessionId) {
    return {
      ok: false,
      error: "This manage link is invalid or expired."
    };
  }

  const supabase = createAdminClient();

  const updatePayload: ConfessionUpdate = {
    category: parsedInput.data.category,
    title: parsedInput.data.title,
    body: parsedInput.data.body,
    visibility: parsedInput.data.visibility,
    approval_status: moderationResult.shouldFlag ? "pending" : "approved"
  };

  const { error } = await supabase
    .from("confessions")
    .update(updatePayload)
    .eq("id", confessionId)
    .eq("manage_token_hash", manageTokenHash)
    .eq("is_deleted", false);

  if (error) {
    return {
      ok: false,
      error: "Could not update this confession. Please try again."
    };
  }

  if (moderationResult.shouldFlag) {
    await supabase.from("audit_logs").insert({
      action: "confession_flagged_on_manage_update",
      entity_type: "confession",
      entity_id: confessionId,
      metadata: {
        issues: moderationResult.issues
      }
    });
  }

  return {
    ok: true
  };
}

export async function deleteManagedConfession(
  input: DeleteManagedConfessionInput
): Promise<ManagedConfessionActionResult> {
  const manageTokenHash = getTokenHashFromRawToken(input.token);

  if (!manageTokenHash) {
    return {
      ok: false,
      error: "This manage link is invalid or expired."
    };
  }

  const confessionId = await getConfessionIdByManageTokenHash(manageTokenHash);

  if (!confessionId) {
    return {
      ok: false,
      error: "This manage link is invalid or expired."
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("confessions")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString()
    })
    .eq("id", confessionId)
    .eq("manage_token_hash", manageTokenHash)
    .eq("is_deleted", false);

  if (error) {
    return {
      ok: false,
      error: "Could not delete this confession. Please try again."
    };
  }

  return {
    ok: true
  };
}