// app/actions/reports.ts

"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getRequestIpHash } from "@/lib/utils/security";
import { createReportSchema } from "@/lib/utils/validation";
import type { ReportInsert } from "@/lib/types";

export type CreateReportActionInput = {
  publicId: string;
  reason: string;
  details: string;
  anonymousSessionId?: string;
};

export type CreateReportActionResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      error: string;
    };

function isValidAnonymousSessionId(value: string): boolean {
  return /^[a-f0-9]{48}$/.test(value);
}

export async function createReport(
  input: CreateReportActionInput
): Promise<CreateReportActionResult> {
  const parsedInput = createReportSchema.safeParse({
    publicId: input.publicId,
    reason: input.reason,
    details: input.details
  });

  if (!parsedInput.success) {
    return {
      ok: false,
      error:
        parsedInput.error.issues[0]?.message ??
        "Check your report and try again."
    };
  }

  const anonymousSessionId = input.anonymousSessionId?.trim() ?? null;

  if (anonymousSessionId && !isValidAnonymousSessionId(anonymousSessionId)) {
    return {
      ok: false,
      error: "Anonymous session is invalid. Refresh and try again."
    };
  }

  const supabase = createAdminClient();

  const { data: confession, error: confessionError } = await supabase
    .from("confessions")
    .select("id")
    .eq("public_id", parsedInput.data.publicId)
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

  const reportInsert: ReportInsert = {
    confession_id: confession.id,
    reason: parsedInput.data.reason,
    details: parsedInput.data.details,
    anonymous_session_id: anonymousSessionId,
    ip_hash: ipHash,
    status: "pending"
  };

  const { error: reportError } = await supabase
    .from("reports")
    .insert(reportInsert);

  if (reportError) {
    return {
      ok: false,
      error: "Could not send this report. Please try again."
    };
  }

  const { error: incrementError } = await supabase.rpc(
    "increment_confession_report_count",
    {
      target_confession_id: confession.id
    }
  );

  if (incrementError) {
    return {
      ok: false,
      error: "Your report was received, but the report count could not update."
    };
  }

  return {
    ok: true,
    message: "Thanks. This has been sent for review."
  };
}