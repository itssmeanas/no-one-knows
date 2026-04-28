// components/PageShell.tsx

import type { ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type PageShellWidth = "default" | "narrow" | "wide";

const widthClasses: Record<PageShellWidth, string> = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl"
};

export type PageShellProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  width?: PageShellWidth;
  showHeader?: boolean;
  className?: string;
};

export function PageShell({
  children,
  title,
  description,
  eyebrow,
  actions,
  width = "default",
  showHeader = true,
  className
}: PageShellProps) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-confession-glow/15 blur-3xl sm:h-[34rem] sm:w-[34rem]"
      />

      {showHeader ? (
        <header className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-glow transition group-hover:border-veil-300/40">
              <LockKeyhole
                className="h-5 w-5 text-veil-300"
                aria-hidden="true"
              />
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-200">
              No One Knows
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-6 sm:flex"
          >
            <Link
              href="/guidelines"
              className="text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              Guidelines
            </Link>
            <Link
              href="/archive"
              className="text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              Archive
            </Link>
          </nav>
        </header>
      ) : null}

      <div
        className={twMerge(
          clsx(
            "mx-auto w-full py-12 sm:py-16",
            widthClasses[width],
            className
          )
        )}
      >
        {title || description || eyebrow || actions ? (
          <section className="mb-8 flex flex-col gap-6 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {eyebrow ? (
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-confession-pink">
                  {eyebrow}
                </p>
              ) : null}

              {title ? (
                <h1 className="font-serif text-4xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
                  {title}
                </h1>
              ) : null}

              {description ? (
                <p className="mt-4 text-base leading-8 text-zinc-400 sm:text-lg">
                  {description}
                </p>
              ) : null}
            </div>

            {actions ? (
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                {actions}
              </div>
            ) : null}
          </section>
        ) : null}

        {children}
      </div>
    </main>
  );
}