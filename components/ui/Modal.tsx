// components/ui/Modal.tsx

"use client";

import type { ReactNode } from "react";
import { useEffect, useId } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Button } from "@/components/ui/Button";

type ModalSize = "sm" | "md" | "lg";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl"
};

export type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  size?: ModalSize;
  closeLabel?: string;
  className?: string;
};

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  size = "md",
  closeLabel = "Close dialog",
  className
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-dvh items-end justify-center px-4 py-4 sm:items-center sm:py-8"
      role="presentation"
    >
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 cursor-default bg-ink-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={twMerge(
          clsx(
            "glass-panel relative w-full rounded-4xl p-5 shadow-glow sm:p-6",
            sizeClasses[size],
            className
          )
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2
              id={titleId}
              className="font-serif text-2xl font-semibold tracking-tight text-white"
            >
              {title}
            </h2>

            {description ? (
              <p id={descriptionId} className="text-sm leading-6 text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={closeLabel}
            className="h-10 w-10 shrink-0 rounded-full px-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {children}
      </section>
    </div>
  );
}