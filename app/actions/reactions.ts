// app/actions/reactions.ts

"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getRequestIpHash } from "@/lib/utils/security";
import type { ReactionInsert } from "@/lib/types";

export type CreateReactionActionInput = {
  publicId: string;
  anonymousSessionId: string;
};

export type CreateReactionActionResult =
  | {
      ok: true;
      feltCount: number;
      alreadyReacted: boolean;
    }
  | {
      ok: false;
      error: string;
    };

function isValidAnonymousSessionId(value: string): boolean {
  return /^[a-f0-9]{48}$/.test(value);
}

function isUniqueViolation(errorCode: string | undefined): boolean {
  return errorCode === "23505";
}

async function getReactionsEnabled(): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "reactions_enabled")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to read reactions setting.");
  }

  return data?.value !== "false";
}

export async function createReaction(
  input: CreateReactionActionInput
): Promise<CreateReactionActionResult> {
  const publicId = input.publicId.trim();
  const anonymousSessionId = input.anonymousSessionId.trim();

  if (!publicId) {
    return {
      ok: false,
      error: "Invalid confession."
    };
  }

  if (!isValidAnonymousSessionId(anonymousSessionId)) {
    return {
      ok: false,
      error: "Anonymous session is invalid. Refresh and try again."
    };
  }

  const reactionsEnabled = await getReactionsEnabled();

  if (!reactionsEnabled) {
    return {
      ok: false,
      error: "Reactions are not available right now."
    };
  }

  const supabase = createAdminClient();

  const { data: confession, error: confessionError } = await supabase
    .from("confessions")
    .select("id, felt_count")
    .eq("public_id", publicId)
    .eq("visibility", "public")
    .eq("approval_status", "approved")
    .eq("is_hidden", false)
    .eq("is_deleted", false)
    .maybeSingle();

  if (confessionError || !confession) {
    return {
      ok: false,
      error: "This confession is not available."
    };
  }

  const ipHash = await getRequestIpHash();

  const reactionInsert: ReactionInsert = {
    confession_id: confession.id,
    reaction_type: "felt_this",
    anonymous_session_id: anonymousSessionId,
    ip_hash: ipHash
  };

  const { error: insertError } = await supabase
    .from("reactions")
    .insert(reactionInsert);

  if (insertError) {
    if (isUniqueViolation(insertError.code)) {
      return {
        ok: true,
        feltCount: confession.felt_count,
        alreadyReacted: true
      };
    }

    return {
      ok: false,
      error: "Could not save your reaction. Please try again."
    };
  }

  const { error: incrementError } = await supabase.rpc(
    "increment_confession_felt_count",
    {
      target_confession_id: confession.id
    }
  );

  if (incrementError) {
    return {
      ok: false,
      error: "Your reaction was saved, but the count could not update."
    };
  }

  const { data: updatedConfession, error: updatedError } = await supabase
    .from("confessions")
    .select("felt_count")
    .eq("id", confession.id)
    .single();

  if (updatedError || !updatedConfession) {
    return {
      ok: true,
      feltCount: confession.felt_count + 1,
      alreadyReacted: false
    };
  }

  return {
    ok: true,
    feltCount: updatedConfession.felt_count,
    alreadyReacted: false
  };
}