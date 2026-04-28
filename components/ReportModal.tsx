// components/ReportModal.tsx

"use client";

import { useId, useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

export const reportReasons = [
  "Names or personal information",
  "Harassment or revenge posting",
  "Threats or violence",
  "Hate or discrimination",
  "Self-harm concern",
  "Sexual content",
  "Spam",
  "Other"
] as const;

export type ReportReason = (typeof reportReasons)[number];

export type ReportModalSubmitInput = {
  reason: ReportReason;
  details: string;
};

export type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ReportModalSubmitInput) => Promise<void> | void;
  pending?: boolean;
  success?: boolean;
  error?: string;
};

export function ReportModal({
  open,
  onClose,
  onSubmit,
  pending = false,
  success = false,
  error
}: ReportModalProps) {
  const reasonGroupId = useId();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");

  const canSubmit = Boolean(selectedReason) && !pending && !success;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedReason || pending || success) {
      return;
    }

    await onSubmit({
      reason: selectedReason,
      details: details.trim()
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={success ? "Report sent" : "Report this confession"}
      description={
        success
          ? "Thanks. This has been sent for review."
          : "Help keep this place anonymous and safe. Reports are reviewed by an admin."
      }
      size="md"
    >
      {success ? (
        <div className="space-y-5">
          <div className="rounded-3xl border border-veil-300/20 bg-veil-500/10 p-5 text-sm leading-7 text-zinc-300">
            Thanks. This has been sent for review.
          </div>

          <Button type="button" variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <fieldset className="space-y-3" aria-labelledby={reasonGroupId}>
            <legend
              id={reasonGroupId}
              className="text-sm font-medium text-zinc-200"
            >
              Why are you reporting this?
            </legend>

            <div className="grid gap-2">
              {reportReasons.map((reason) => {
                const isSelected = selectedReason === reason;

                return (
                  <button
                    key={reason}
                    type="button"
                    aria-pressed={isSelected}
                    className={`flex min-h-11 items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-veil-300 ${
                      isSelected
                        ? "border-confession-pink/45 bg-confession-pink/14 text-pink-100"
                        : "border-white/10 bg-white/[0.045] text-zinc-300 hover:border-veil-300/35 hover:bg-white/[0.075] hover:text-white"
                    }`}
                    onClick={() => setSelectedReason(reason)}
                  >
                    <span>{reason}</span>
                    {isSelected ? (
                      <Flag className="h-4 w-4 text-confession-pink" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Textarea
            id="report-details"
            label="Optional details"
            helperText="Do not include private information. Add only what helps an admin review the report."
            placeholder="Add context if needed..."
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={500}
            characterCount={details.length}
            disabled={pending}
          />

          {error ? (
            <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-100">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!canSubmit}>
              {pending ? "Sending..." : "Send report"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}