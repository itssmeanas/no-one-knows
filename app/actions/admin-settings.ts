// app/actions/admin-settings.ts

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminSettingsSchema } from "@/lib/utils/validation";
import type { AppSettingKey, AuditLogInsert } from "@/lib/types";
import type { AdminSettingsInput } from "@/lib/utils/validation";

export type AdminSettingsActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

const settingKeys = [
  "submissions_enabled",
  "reactions_enabled",
  "approval_mode_enabled",
  "private_confessions_enabled",
  "minimum_confession_length",
  "maximum_confession_length"
] as const satisfies ReadonlyArray<AppSettingKey>;

function serializeSettingValue(value: boolean | number): string {
  return String(value);
}

async function writeAuditLog(input: AuditLogInsert): Promise<void> {
  const supabase = createAdminClient();

  await supabase.from("audit_logs").insert(input);
}

export async function updateAdminSettings(
  input: AdminSettingsInput
): Promise<AdminSettingsActionResult> {
  const admin = await requireAdmin();

  const parsedInput = adminSettingsSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error:
        parsedInput.error.issues[0]?.message ??
        "Check the settings and try again."
    };
  }

  const supabase = createAdminClient();

  const updates = settingKeys.map((key) => ({
    key,
    value: serializeSettingValue(parsedInput.data[key])
  }));

  const { error } = await supabase
    .from("app_settings")
    .upsert(updates, {
      onConflict: "key"
    });

  if (error) {
    return {
      ok: false,
      error: "Could not save settings. Please try again."
    };
  }

  await writeAuditLog({
    admin_user_id: admin.user.id,
    action: "admin_updated_app_settings",
    entity_type: "app_settings",
    entity_id: "global",
    metadata: {
      settings: parsedInput.data
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/confess");
  revalidatePath("/archive");
  revalidatePath("/random");

  return {
    ok: true
  };
}