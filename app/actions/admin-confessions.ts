// app/actions/admin-confessions.ts

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditLogInsert, ConfessionUpdate } from "@/lib/types";

export type AdminConfessionActionInput = {
  id: string;
};

export type AdminConfessionActionResult =
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

async function updateConfessionAsAdmin({
  id,
  update,
  action
}: {
  id: string;
  update: ConfessionUpdate;
  action: string;
}): Promise<AdminConfessionActionResult> {
  const admin = await requireAdmin();

  if (!isValidUuid(id)) {
    return {
      ok: false,
      error: "Invalid confession ID."
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("confessions")
    .update(update)
    .eq("id", id);

  if (error) {
    return {
      ok: false,
      error: "Could not update this confession."
    };
  }

  await writeAuditLog({
    admin_user_id: admin.user.id,
    action,
    entity_type: "confession",
    entity_id: id,
    metadata: {
      update
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/confessions");
  revalidatePath("/archive");

  return {
    ok: true
  };
}

export async function approveConfession(
  input: AdminConfessionActionInput
): Promise<AdminConfessionActionResult> {
  return updateConfessionAsAdmin({
    id: input.id,
    action: "admin_approved_confession",
    update: {
      approval_status: "approved"
    }
  });
}

export async function rejectConfession(
  input: AdminConfessionActionInput
): Promise<AdminConfessionActionResult> {
  return updateConfessionAsAdmin({
    id: input.id,
    action: "admin_rejected_confession",
    update: {
      approval_status: "rejected"
    }
  });
}

export async function hideConfession(
  input: AdminConfessionActionInput
): Promise<AdminConfessionActionResult> {
  return updateConfessionAsAdmin({
    id: input.id,
    action: "admin_hid_confession",
    update: {
      is_hidden: true,
      hidden_at: new Date().toISOString()
    }
  });
}

export async function unhideConfession(
  input: AdminConfessionActionInput
): Promise<AdminConfessionActionResult> {
  return updateConfessionAsAdmin({
    id: input.id,
    action: "admin_unhid_confession",
    update: {
      is_hidden: false,
      hidden_at: null
    }
  });
}

export async function deleteConfessionAsAdmin(
  input: AdminConfessionActionInput
): Promise<AdminConfessionActionResult> {
  return updateConfessionAsAdmin({
    id: input.id,
    action: "admin_deleted_confession",
    update: {
      is_deleted: true,
      deleted_at: new Date().toISOString()
    }
  });
}

export async function restoreConfessionAsAdmin(
  input: AdminConfessionActionInput
): Promise<AdminConfessionActionResult> {
  return updateConfessionAsAdmin({
    id: input.id,
    action: "admin_restored_confession",
    update: {
      is_deleted: false,
      deleted_at: null
    }
  });
}