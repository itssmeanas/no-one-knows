// app/actions/admin-reports.ts

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditLogInsert, ReportUpdate } from "@/lib/types";

export type AdminReportActionInput = {
  reportId: string;
};

export type AdminReportActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function writeAuditLog(input: AuditLogInsert): Promise<void> {
  const supabase = createAdminClient();

  await supabase.from("audit_logs").insert(input);
}

async function getReportContext(reportId: string): Promise<{
  reportId: string;
  confessionId: string;
} | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reports")
    .select("id, confession_id")
    .eq("id", reportId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    reportId: data.id,
    confessionId: data.confession_id
  };
}

async function updateReportAsAdmin({
  reportId,
  update,
  action
}: {
  reportId: string;
  update: ReportUpdate;
  action: string;
}): Promise<AdminReportActionResult> {
  const admin = await requireAdmin();

  if (!isValidUuid(reportId)) {
    return {
      ok: false,
      error: "Invalid report ID."
    };
  }

  const reportContext = await getReportContext(reportId);

  if (!reportContext) {
    return {
      ok: false,
      error: "Report could not be found."
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("reports")
    .update(update)
    .eq("id", reportId);

  if (error) {
    return {
      ok: false,
      error: "Could not update this report."
    };
  }

  await writeAuditLog({
    admin_user_id: admin.user.id,
    action,
    entity_type: "report",
    entity_id: reportId,
    metadata: {
      confessionId: reportContext.confessionId,
      update
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/confessions");

  return {
    ok: true
  };
}

export async function markReportReviewed(
  input: AdminReportActionInput
): Promise<AdminReportActionResult> {
  const admin = await requireAdmin();

  return updateReportAsAdmin({
    reportId: input.reportId,
    action: "admin_marked_report_reviewed",
    update: {
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.user.id
    }
  });
}

export async function dismissReport(
  input: AdminReportActionInput
): Promise<AdminReportActionResult> {
  const admin = await requireAdmin();

  return updateReportAsAdmin({
    reportId: input.reportId,
    action: "admin_dismissed_report",
    update: {
      status: "dismissed",
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.user.id
    }
  });
}

export async function hideReportedConfession(
  input: AdminReportActionInput
): Promise<AdminReportActionResult> {
  const admin = await requireAdmin();

  if (!isValidUuid(input.reportId)) {
    return {
      ok: false,
      error: "Invalid report ID."
    };
  }

  const reportContext = await getReportContext(input.reportId);

  if (!reportContext) {
    return {
      ok: false,
      error: "Report could not be found."
    };
  }

  const supabase = createAdminClient();

  const { error: confessionError } = await supabase
    .from("confessions")
    .update({
      is_hidden: true,
      hidden_at: new Date().toISOString()
    })
    .eq("id", reportContext.confessionId)
    .eq("is_deleted", false);

  if (confessionError) {
    return {
      ok: false,
      error: "Could not hide the reported confession."
    };
  }

  const { error: reportError } = await supabase
    .from("reports")
    .update({
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.user.id
    })
    .eq("id", reportContext.reportId);

  if (reportError) {
    return {
      ok: false,
      error: "The confession was hidden, but the report could not be updated."
    };
  }

  await writeAuditLog({
    admin_user_id: admin.user.id,
    action: "admin_hid_reported_confession",
    entity_type: "confession",
    entity_id: reportContext.confessionId,
    metadata: {
      reportId: reportContext.reportId
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/confessions");
  revalidatePath("/archive");

  return {
    ok: true
  };
}

export async function deleteReportedConfession(
  input: AdminReportActionInput
): Promise<AdminReportActionResult> {
  const admin = await requireAdmin();

  if (!isValidUuid(input.reportId)) {
    return {
      ok: false,
      error: "Invalid report ID."
    };
  }

  const reportContext = await getReportContext(input.reportId);

  if (!reportContext) {
    return {
      ok: false,
      error: "Report could not be found."
    };
  }

  const supabase = createAdminClient();

  const { error: confessionError } = await supabase
    .from("confessions")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString()
    })
    .eq("id", reportContext.confessionId)
    .eq("is_deleted", false);

  if (confessionError) {
    return {
      ok: false,
      error: "Could not delete the reported confession."
    };
  }

  const { error: reportError } = await supabase
    .from("reports")
    .update({
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.user.id
    })
    .eq("id", reportContext.reportId);

  if (reportError) {
    return {
      ok: false,
      error: "The confession was deleted, but the report could not be updated."
    };
  }

  await writeAuditLog({
    admin_user_id: admin.user.id,
    action: "admin_deleted_reported_confession",
    entity_type: "confession",
    entity_id: reportContext.confessionId,
    metadata: {
      reportId: reportContext.reportId
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/confessions");
  revalidatePath("/archive");

  return {
    ok: true
  };
}