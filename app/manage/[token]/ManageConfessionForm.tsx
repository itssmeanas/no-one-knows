// app/manage/[token]/ManageConfessionForm.tsx

"use client";

import { useState, useTransition } from "react";
import { Check, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CategoryChip } from "@/components/CategoryChip";
import { confessionCategories } from "@/lib/categories";
import type {
  ConfessionCategory,
  ConfessionVisibility,
  ManageableConfession
} from "@/lib/types";
import {
  confessionBodyMaxLength,
  confessionBodyMinLength,
  confessionTitleMaxLength
} from "@/lib/utils/validation";
import { moderateConfessionText } from "@/lib/utils/moderation";
import {
  deleteManagedConfession,
  updateManagedConfession
} from "@/app/actions/manage";

export type ManageConfessionFormProps = {
  token: string;
  confession: ManageableConfession;
};

function getBodyError(body: string): string | null {
  const trimmedBody = body.trim();

  if (trimmedBody.length < confessionBodyMinLength) {
    return `Confession must be at least ${confessionBodyMinLength} characters.`;
  }

  if (trimmedBody.length > confessionBodyMaxLength) {
    return `Confession must be ${confessionBodyMaxLength} characters or fewer.`;
  }

  return null;
}

function getTitleError(title: string): string | null {
  if (title.length > confessionTitleMaxLength) {
    return `Title must be ${confessionTitleMaxLength} characters or fewer.`;
  }

  return null;
}

export function ManageConfessionForm({
  token,
  confession
}: ManageConfessionFormProps) {
  const [category, setCategory] = useState<ConfessionCategory>(confession.category);
  const [title, setTitle] = useState(confession.title ?? "");
  const [body, setBody] = useState(confession.body);
  const [visibility, setVisibility] = useState<ConfessionVisibility>(
    confession.visibility
  );
  const [message, setMessage] = useState<string | null>(
    confession.isDeleted ? "This confession has been deleted." : null
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const titleError = getTitleError(title);
  const bodyError = getBodyError(body);
  const moderationResult = moderateConfessionText([title, body].join("\n"));
  const isDeleted = message === "This confession has been deleted.";

  function handleSave() {
    if (titleError) {
      setError(titleError);
      return;
    }

    if (bodyError) {
      setError(bodyError);
      return;
    }

    if (!moderationResult.allowed) {
      setError(
        moderationResult.issues[0]?.message ??
          "Please remove identifying or unsafe details before saving."
      );
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await updateManagedConfession({
        token,
        category,
        title,
        body,
        visibility
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("Your confession has been updated.");
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this confession? This will remove it from public view."
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await deleteManagedConfession({
        token
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("This confession has been deleted.");
    });
  }

  return (
    <div className="space-y-6">
      {isDeleted ? (
        <Card variant="danger">
          <h2 className="font-serif text-2xl font-semibold text-white">
            This confession has been deleted.
          </h2>
          <p className="mt-3 text-sm leading-7 text-rose-100/80">
            It is no longer visible in the public archive.
          </p>
        </Card>
      ) : null}

      <Card variant="glass" className="space-y-7">
        <section className="space-y-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-confession-pink">
              Category
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white">
              What kind of truth is this?
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {confessionCategories.map((item) => (
              <CategoryChip
                key={item}
                category={item}
                variant="selectable"
                active={category === item}
                disabled={isDeleted || isPending}
                onClick={() => setCategory(item)}
              />
            ))}
          </div>
        </section>

        <Input
          id="managed-title"
          label="Title"
          placeholder="I still check"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={confessionTitleMaxLength}
          disabled={isDeleted || isPending}
          error={titleError ?? undefined}
          helperText={`${title.length}/${confessionTitleMaxLength} characters`}
        />

        <Textarea
          id="managed-body"
          label="Confession"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          minLength={confessionBodyMinLength}
          maxLength={confessionBodyMaxLength}
          characterCount={body.length}
          disabled={isDeleted || isPending}
          error={body.length > 0 ? bodyError ?? undefined : undefined}
          helperText="Keep it anonymous. Do not include names, phone numbers, addresses, emails, threats, or revenge posting."
        />

        {moderationResult.supportiveNotice ? (
          <div className="rounded-3xl border border-veil-300/20 bg-veil-500/10 p-4 text-sm leading-7 text-zinc-300">
            {moderationResult.supportiveNotice}
          </div>
        ) : null}

        {moderationResult.issues.length > 0 ? (
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-sm font-medium text-amber-100">
              Before saving, review this:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-6 text-amber-100/80">
              {moderationResult.issues.map((issue) => (
                <li key={`${issue.type}-${issue.message}`}>{issue.message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-confession-pink">
            Visibility
          </p>

          <div className="grid gap-3">
            <button
              type="button"
              aria-pressed={visibility === "public"}
              disabled={isDeleted || isPending}
              className={`rounded-4xl border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-veil-300 ${
                visibility === "public"
                  ? "border-confession-pink/45 bg-confession-pink/14"
                  : "border-white/10 bg-white/[0.045] hover:border-veil-300/35"
              }`}
              onClick={() => setVisibility("public")}
            >
              <span className="flex items-center gap-3 text-base font-semibold text-white">
                <Eye className="h-5 w-5 text-confession-pink" aria-hidden="true" />
                Public in the archive
              </span>
              <span className="mt-2 block text-sm leading-6 text-zinc-400">
                Visible to strangers if approved and not hidden.
              </span>
            </button>

            <button
              type="button"
              aria-pressed={visibility === "private"}
              disabled={isDeleted || isPending}
              className={`rounded-4xl border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-veil-300 ${
                visibility === "private"
                  ? "border-confession-pink/45 bg-confession-pink/14"
                  : "border-white/10 bg-white/[0.045] hover:border-veil-300/35"
              }`}
              onClick={() => setVisibility("private")}
            >
              <span className="flex items-center gap-3 text-base font-semibold text-white">
                <EyeOff className="h-5 w-5 text-confession-pink" aria-hidden="true" />
                Private link only
              </span>
              <span className="mt-2 block text-sm leading-6 text-zinc-400">
                Not listed in the public archive.
              </span>
            </button>
          </div>
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

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="danger"
            disabled={isDeleted || isPending}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete confession
          </Button>

          <Button type="button" disabled={isDeleted || isPending} onClick={handleSave}>
            <Check className="h-4 w-4" aria-hidden="true" />
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}