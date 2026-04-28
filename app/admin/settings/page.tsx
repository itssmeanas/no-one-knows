// app/admin/settings/page.tsx

import type { Metadata } from "next";
import { AdminSettingsForm } from "@/app/admin/settings/AdminSettingsForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/PageShell";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminSettingsInput } from "@/lib/utils/validation";

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Edit No One Knows app settings."
};

const defaultSettings: AdminSettingsInput = {
  submissions_enabled: true,
  reactions_enabled: true,
  approval_mode_enabled: false,
  private_confessions_enabled: true,
  minimum_confession_length: 20,
  maximum_confession_length: 1000
};

function parseBooleanSetting(value: string | null | undefined, fallback: boolean): boolean {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

function parseNumberSetting(value: string | null | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue)) {
    return fallback;
  }

  return parsedValue;
}

async function getAdminSettings(): Promise<{
  settings: AdminSettingsInput;
  error: string | null;
}> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value");

  if (error) {
    return {
      settings: defaultSettings,
      error: "Could not load settings. Showing safe defaults."
    };
  }

  const settingMap = new Map(data.map((setting) => [setting.key, setting.value]));

  return {
    settings: {
      submissions_enabled: parseBooleanSetting(
        settingMap.get("submissions_enabled"),
        defaultSettings.submissions_enabled
      ),
      reactions_enabled: parseBooleanSetting(
        settingMap.get("reactions_enabled"),
        defaultSettings.reactions_enabled
      ),
      approval_mode_enabled: parseBooleanSetting(
        settingMap.get("approval_mode_enabled"),
        defaultSettings.approval_mode_enabled
      ),
      private_confessions_enabled: parseBooleanSetting(
        settingMap.get("private_confessions_enabled"),
        defaultSettings.private_confessions_enabled
      ),
      minimum_confession_length: parseNumberSetting(
        settingMap.get("minimum_confession_length"),
        defaultSettings.minimum_confession_length
      ),
      maximum_confession_length: parseNumberSetting(
        settingMap.get("maximum_confession_length"),
        defaultSettings.maximum_confession_length
      )
    },
    error: null
  };
}

export default async function AdminSettingsPage() {
  await requireAdmin();

  const { settings, error } = await getAdminSettings();

  return (
    <PageShell
      width="narrow"
      eyebrow="Admin"
      title="Settings"
      description="Control submissions, reactions, approval mode, private confessions, and confession length limits."
      actions={
        <>
          <Button href="/admin">Dashboard</Button>
          <Button href="/admin/confessions" variant="secondary">
            Confessions
          </Button>
          <Button href="/admin/reports" variant="ghost">
            Reports
          </Button>
        </>
      }
    >
      {error ? (
        <Card variant="danger" className="mb-6">
          <h2 className="font-serif text-2xl font-semibold text-white">
            Settings warning
          </h2>
          <p className="mt-3 text-sm leading-7 text-rose-100/80">
            {error}
          </p>
        </Card>
      ) : null}

      <AdminSettingsForm initialSettings={settings} />
    </PageShell>
  );
}