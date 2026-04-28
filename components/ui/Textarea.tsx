// components/ui/Textarea.tsx

import type { TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type TextareaVariant = "default" | "danger";

const variantClasses: Record<TextareaVariant, string> = {
  default:
    "border-white/12 bg-white/[0.055] text-zinc-100 placeholder:text-zinc-500 focus:border-veil-300/70 focus:ring-veil-300/20",
  danger:
    "border-rose-400/45 bg-rose-500/10 text-rose-50 placeholder:text-rose-200/50 focus:border-rose-300 focus:ring-rose-300/20"
};

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  characterCount?: number;
  maxLength?: number;
  variant?: TextareaVariant;
};

export function Textarea({
  id,
  label,
  helperText,
  error,
  characterCount,
  maxLength,
  variant = "default",
  className,
  disabled,
  ...props
}: TextareaProps) {
  const textareaVariant = error ? "danger" : variant;
  const helperId = helperText && id ? `${id}-helper` : undefined;
  const errorId = error && id ? `${id}-error` : undefined;
  const counterId =
    typeof characterCount === "number" && id ? `${id}-counter` : undefined;
  const describedBy =
    [helperId, errorId, counterId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        {label ? (
          <label htmlFor={id} className="block text-sm font-medium text-zinc-200">
            {label}
          </label>
        ) : (
          <span />
        )}

        {typeof characterCount === "number" ? (
          <p
            id={counterId}
            className={clsx(
              "text-xs tabular-nums",
              maxLength && characterCount > maxLength
                ? "text-rose-200"
                : "text-zinc-500"
            )}
          >
            {maxLength ? `${characterCount}/${maxLength}` : characterCount}
          </p>
        ) : null}
      </div>

      <textarea
        id={id}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={twMerge(
          clsx(
            "min-h-36 w-full resize-y rounded-2xl border px-4 py-3 text-sm leading-7 shadow-inner-secret outline-none backdrop-blur transition",
            "focus:ring-4",
            "disabled:cursor-not-allowed disabled:opacity-50",
            variantClasses[textareaVariant],
            className
          )
        )}
        {...props}
      />

      {helperText ? (
        <p id={helperId} className="text-xs leading-5 text-zinc-500">
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs leading-5 text-rose-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}