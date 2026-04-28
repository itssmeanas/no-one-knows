// app/admin/settings/AdminSettingsForm.tsx

"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { updateAdminSettings } from "@/app/actions/admin-settings";
import type { AdminSettingsInput } from "@/lib/utils/validation";

export type AdminSettingsFormProps = {
  initialSettings: AdminSettingsInput;
};

type BooleanSettingKey =
  | "submissions_enabled"
  | "reactions_enabled"
  | "approval_mode_enabled"
  | "private_confessions_enabled";

const booleanSettings: ReadonlyArray<{
  key: BooleanSettingKey;
  label: string;
  description: string;
}> = [
  {
    key: "submissions_enabled",
    label: "Submissions enabled",
    description: "Allow public users to create new anonymous confessions."
  },
  {
    key: "reactions_enabled",
    label: "Reactions enabled",
    description: "Allow public users to react with “I felt this.”"
  },
  {
    key: "approval_mode_enabled",
    label: "Approval mode enabled",
    description: "Send new confessions to pending approval instead of publishing immediately."
  },
  {
    key: "private_confessions_enabled",
    label: "Private confessions enabled",
    description: "Allow users to choose private link only visibility."
  }
];

export function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  const [settings, setSettings] = useState<AdminSettingsInput>(initialSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateBooleanSetting(key: BooleanSettingKey, value: boolean) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value
    }));
  }

  function updateNumberSetting(
    key: "minimum_confession_length" | "maximum_confession_length",
    value: string
  ) {
    const parsedValue = Number.parseInt(value, 10);

    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: Number.isNaN(parsedValue) ? 0 : parsedValue
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateAdminSettings(settings);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("Settings saved.");
    });
  }

  return (
    <Card variant="glass">
      <form className="space-y-7" onSubmit={handleSubmit}>
        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-white">
            App settings
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Changes affect public submission, reaction, approval, and visibility
            behavior immediately.
          </p>
        </div>

        <section className="space-y-3" aria-label="Feature toggles">
          {booleanSettings.map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-veil-300/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                <span className="block text-sm font-semibold text-white">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm leading-6 text-zinc-500">
                  {item.description}
                </span>
              </span>

              <span className="relative inline-flex shrink-0 items-center">
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  disabled={isPending}
                  onChange={(event) =>
                    updateBooleanSetting(item.key, event.target.checked)
                  }
                  className="peer sr-only"
                />
                <span className="h-7 w-12 rounded-full border border-white/10 bg-white/10 transition peer-checked:border-confession-pink/45 peer-checked:bg-confession-pink/40 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-veil-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
                <span className="absolute left-1 h-5 w-5 rounded-full bg-zinc-300 transition peer-checked:translate-x-5 peer-checked:bg-white peer-disabled:opacity-70" />
              </span>
            </label>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-2" aria-label="Length limits">
          <Input
            id="minimum-confession-length"
            label="Minimum confession length"
            type="number"
            min={20}
            max={1000}
            value={settings.minimum_confession_length}
            onChange={(event) =>
              updateNumberSetting("minimum_confession_length", event.target.value)
            }
            disabled={isPending}
            helperText="Minimum allowed body length. Must be at least 20."
          />

          <Input
            id="maximum-confession-length"
            label="Maximum confession length"
            type="number"
            min={20}
            max={1000}
            value={settings.maximum_confession_length}
            onChange={(event) =>
              updateNumberSetting("maximum_confession_length", event.target.value)
            }
            disabled={isPending}
            helperText="Maximum allowed body length. Must be 1000 or fewer."
          />
        </section>

        {error ? (
          <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-100">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-2xl border border-veil-300/20 bg-veil-500/10 px-4 py-3 text-sm leading-6 text-veil-300">
            {message}
          </p>
        ) : null}

        <div className="flex justify-end border-t border-white/10 pt-6">
          <Button type="submit" disabled={isPending}>
            <Save className="h-4 w-4" aria-hidden="true" />
            {isPending ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </form>
    </Card>
  );
}