// app/confess/ConfessForm.tsx

"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CategoryChip } from "@/components/CategoryChip";
import { confessionCategories } from "@/lib/categories";
import type { ConfessionCategory, ConfessionVisibility } from "@/lib/types";
import {
  confessionBodyMaxLength,
  confessionBodyMinLength,
  confessionTitleMaxLength
} from "@/lib/utils/validation";
import { moderateConfessionText } from "@/lib/utils/moderation";
import { createConfession } from "@/app/actions/confessions";

type FormStep = 1 | 2 | 3 | 4;

type SubmissionResult = {
  publicId: string;
  manageUrl: string;
};

const exampleTitles = [
  "I still check",
  "I lied about being happy",
  "I miss my old life",
  "I never stopped",
  "I was not okay"
] as const;

const stepLabels: Record<FormStep, string> = {
  1: "Category",
  2: "Title",
  3: "Confession",
  4: "Visibility"
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

export function ConfessForm() {
  const [step, setStep] = useState<FormStep>(1);
  const [category, setCategory] = useState<ConfessionCategory | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<ConfessionVisibility>("public");
  const [honeypot, setHoneypot] = useState("");
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const titleError = getTitleError(title);
  const bodyError = getBodyError(body);

  const moderationResult = useMemo(() => {
    if (!body.trim()) {
      return null;
    }

    return moderateConfessionText([title, body].join("\n"));
  }, [body, title]);

  const canGoNext =
    (step === 1 && Boolean(category)) ||
    (step === 2 && !titleError) ||
    (step === 3 && !bodyError && moderationResult?.allowed !== false) ||
    step === 4;

  function goNext() {
    if (!canGoNext) {
      return;
    }

    setFormError(null);
    setStep((currentStep) => Math.min(currentStep + 1, 4) as FormStep);
  }

  function goBack() {
    setFormError(null);
    setStep((currentStep) => Math.max(currentStep - 1, 1) as FormStep);
  }

  async function copyManageLink() {
    if (!submissionResult) {
      return;
    }

    await navigator.clipboard.writeText(submissionResult.manageUrl);
    setCopied(true);
  }

  function handleSubmit() {
    if (!category) {
      setFormError("Choose a category before submitting.");
      setStep(1);
      return;
    }

    if (titleError) {
      setFormError(titleError);
      setStep(2);
      return;
    }

    if (bodyError) {
      setFormError(bodyError);
      setStep(3);
      return;
    }

    if (moderationResult && !moderationResult.allowed) {
      setFormError(
        moderationResult.issues[0]?.message ??
          "Please remove identifying or unsafe details before submitting."
      );
      setStep(3);
      return;
    }

    setFormError(null);

    startTransition(async () => {
      const result = await createConfession({
        category,
        title,
        body,
        visibility,
        honeypot
      });

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      setSubmissionResult({
        publicId: result.publicId,
        manageUrl: result.manageUrl
      });
    });
  }

  if (submissionResult) {
    return (
      <Card variant="glass" className="space-y-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-veil-300/30 bg-veil-500/10">
          <Check className="h-6 w-6 text-veil-300" aria-hidden="true" />
        </div>

        <div>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-white">
            Your confession has been placed in the archive.
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Save this private link. Anyone with it can edit or delete your
            confession.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-ink-950/70 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
            Private manage link
          </p>
          <p className="break-all text-sm leading-6 text-zinc-200">
            {submissionResult.manageUrl}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={copyManageLink}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? "Copied" : "Copy manage link"}
          </Button>

          <Button href={`/c/${submissionResult.publicId}`} variant="secondary">
            View confession
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="space-y-7">
      <div className="grid grid-cols-4 gap-2" aria-label="Confession form progress">
        {([1, 2, 3, 4] as const).map((item) => (
          <div key={item} className="space-y-2">
            <div
              className={`h-1.5 rounded-full ${
                item <= step ? "bg-confession-pink" : "bg-white/10"
              }`}
            />
            <p className="hidden text-xs text-zinc-500 sm:block">
              {stepLabels[item]}
            </p>
          </div>
        ))}
      </div>

      {step === 1 ? (
        <section className="space-y-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-confession-pink">
              Step 1
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white">
              What kind of truth are you carrying?
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {confessionCategories.map((item) => (
              <CategoryChip
                key={item}
                category={item}
                variant="selectable"
                active={category === item}
                onClick={() => setCategory(item)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-confession-pink">
              Step 2
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white">
              Give this confession a title.
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Optional, but recommended.
            </p>
          </div>

          <Input
            id="confession-title"
            label="Title"
            placeholder="I still check"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={confessionTitleMaxLength}
            error={titleError ?? undefined}
            helperText={`${title.length}/${confessionTitleMaxLength} characters`}
          />

          <div className="flex flex-wrap gap-2">
            {exampleTitles.map((exampleTitle) => (
              <button
                key={exampleTitle}
                type="button"
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition hover:border-veil-300/35 hover:text-white"
                onClick={() => setTitle(exampleTitle)}
              >
                {exampleTitle}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-confession-pink">
              Step 3
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white">
              Say the thing you cannot say out loud.
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Keep it anonymous. Say the truth without exposing anyone.
            </p>
          </div>

          <Textarea
            id="confession-body"
            label="Confession"
            placeholder="Write it here. No real names, phone numbers, addresses, emails, threats, or revenge posting."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            minLength={confessionBodyMinLength}
            maxLength={confessionBodyMaxLength}
            characterCount={body.length}
            error={body.length > 0 ? bodyError ?? undefined : undefined}
            helperText="Required. Minimum 20 characters. Maximum 1000 characters."
          />

          {moderationResult?.supportiveNotice ? (
            <div className="rounded-3xl border border-veil-300/20 bg-veil-500/10 p-4 text-sm leading-7 text-zinc-300">
              {moderationResult.supportiveNotice}
            </div>
          ) : null}

          {moderationResult && moderationResult.issues.length > 0 ? (
            <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm font-medium text-amber-100">
                Before submitting, review this:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-6 text-amber-100/80">
                {moderationResult.issues.map((issue) => (
                  <li key={`${issue.type}-${issue.message}`}>{issue.message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
            className="hidden"
            aria-hidden="true"
          />
        </section>
      ) : null}

      {step === 4 ? (
        <section className="space-y-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-confession-pink">
              Step 4
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white">
              Choose where this confession belongs.
            </h2>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              aria-pressed={visibility === "public"}
              className={`rounded-4xl border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-veil-300 ${
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
              className={`rounded-4xl border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-veil-300 ${
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
                Not listed in the archive. Accessible only through its direct link
                or manage link.
              </span>
            </button>
          </div>
        </section>
      ) : null}

      {formError ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-100">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 1 || isPending}
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        {step < 4 ? (
          <Button type="button" disabled={!canGoNext || isPending} onClick={goNext}>
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="button" disabled={isPending} onClick={handleSubmit}>
            {isPending ? "Placing confession..." : "Place this confession in the archive"}
          </Button>
        )}
      </div>
    </Card>
  );
}