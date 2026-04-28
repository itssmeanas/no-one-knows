// components/ui/Input.tsx

import type { InputHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type InputVariant = "default" | "danger";

const variantClasses: Record<InputVariant, string> = {
  default:
    "border-white/12 bg-white/[0.055] text-zinc-100 placeholder:text-zinc-500 focus:border-veil-300/70 focus:ring-veil-300/20",
  danger:
    "border-rose-400/45 bg-rose-500/10 text-rose-50 placeholder:text-rose-200/50 focus:border-rose-300 focus:ring-rose-300/20"
};

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  variant?: InputVariant;
};

export function Input({
  id,
  label,
  helperText,
  error,
  leftIcon,
  rightElement,
  variant = "default",
  className,
  disabled,
  ...props
}: InputProps) {
  const inputVariant = error ? "danger" : variant;
  const helperId = helperText && id ? `${id}-helper` : undefined;
  const errorId = error && id ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-zinc-200">
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-zinc-500"
          >
            {leftIcon}
          </div>
        ) : null}

        <input
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={twMerge(
            clsx(
              "min-h-12 w-full rounded-2xl border px-4 py-3 text-sm shadow-inner-secret outline-none backdrop-blur transition",
              "focus:ring-4",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-11",
              rightElement && "pr-12",
              variantClasses[inputVariant],
              className
            )
          )}
          {...props}
        />

        {rightElement ? (
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
            {rightElement}
          </div>
        ) : null}
      </div>

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