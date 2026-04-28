// components/ReactionButton.tsx

"use client";

import { Heart } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";

export type ReactionButtonProps = {
  feltCount: number;
  hasReacted?: boolean;
  disabled?: boolean;
  pending?: boolean;
  onReact?: () => void;
  className?: string;
};

function formatFeltCount(count: number) {
  if (count < 1000) {
    return count.toString();
  }

  const formatted = new Intl.NumberFormat("en", {
    maximumFractionDigits: count >= 10000 ? 0 : 1
  }).format(count / 1000);

  return `${formatted}K`;
}

export function ReactionButton({
  feltCount,
  hasReacted = false,
  disabled = false,
  pending = false,
  onReact,
  className
}: ReactionButtonProps) {
  const countLabel = `${formatFeltCount(feltCount)} felt this`;
  const buttonLabel = hasReacted ? "You felt this" : "I felt this";

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <Button
        type="button"
        variant={hasReacted ? "primary" : "secondary"}
        size="sm"
        onClick={onReact}
        disabled={disabled || pending || hasReacted}
        aria-pressed={hasReacted}
        aria-label={buttonLabel}
      >
        <Heart
          className={clsx(
            "h-4 w-4 transition",
            hasReacted && "fill-current",
            pending && "animate-pulse"
          )}
          aria-hidden="true"
        />
        {pending ? "Feeling..." : "I felt this"}
      </Button>

      <span className="text-sm text-zinc-400" aria-live="polite">
        {countLabel}
      </span>
    </div>
  );
}