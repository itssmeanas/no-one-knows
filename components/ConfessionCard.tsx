// components/ConfessionCard.tsx

import Link from "next/link";
import { Flag, Heart, Share2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export type ConfessionCardVariant = "preview" | "full";

export type ConfessionCardData = {
  publicId: string;
  category: string;
  title: string | null;
  body: string;
  createdAt: string;
  feltCount: number;
};

export type ConfessionCardProps = {
  confession: ConfessionCardData;
  variant?: ConfessionCardVariant;
  href?: string;
  onReact?: () => void;
  onReport?: () => void;
  onShare?: () => void;
  hasReacted?: boolean;
  reactionDisabled?: boolean;
  className?: string;
};

const previewLength = 180;

function formatFeltCount(count: number) {
  if (count < 1000) {
    return count.toString();
  }

  const formatted = new Intl.NumberFormat("en", {
    maximumFractionDigits: count >= 10000 ? 0 : 1
  }).format(count / 1000);

  return `${formatted}K`;
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function getBodyText(body: string, variant: ConfessionCardVariant) {
  if (variant === "full" || body.length <= previewLength) {
    return body;
  }

  return `${body.slice(0, previewLength).trim()}…`;
}

export function ConfessionCard({
  confession,
  variant = "preview",
  href,
  onReact,
  onReport,
  onShare,
  hasReacted = false,
  reactionDisabled = false,
  className
}: ConfessionCardProps) {
  const confessionHref = href ?? `/c/${confession.publicId}`;
  const bodyText = getBodyText(confession.body, variant);
  const feltLabel = `${formatFeltCount(confession.feltCount)} felt this`;
  const timestamp = formatTimestamp(confession.createdAt);

  return (
    <Card
      variant="glass"
      className={twMerge(
        clsx(
          "group relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-veil-300/30",
          className
        )
      )}
    >
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-confession-pink/10 blur-3xl transition group-hover:bg-confession-pink/16"
      />

      <div className="relative">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-confession-pink/30 bg-confession-pink/10 px-3 py-1 text-xs font-medium text-pink-200">
            {confession.category}
          </span>

          <span className="text-xs text-zinc-500">{timestamp}</span>
        </div>

        {confession.title ? (
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
            {variant === "preview" ? (
              <Link href={confessionHref} className="outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                <span className="relative">{confession.title}</span>
              </Link>
            ) : (
              confession.title
            )}
          </h2>
        ) : null}

        <p
          className={clsx(
            "mt-3 whitespace-pre-line leading-7 text-zinc-300",
            variant === "full" ? "text-base sm:text-lg" : "text-sm"
          )}
        >
          {bodyText}
        </p>

        <div className="soft-divider my-5" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
            <span>Anonymous</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-zinc-600" />
            <span>{feltLabel}</span>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={hasReacted ? "primary" : "secondary"}
              size="sm"
              onClick={onReact}
              disabled={reactionDisabled}
              aria-pressed={hasReacted}
              aria-label="I felt this"
            >
              <Heart
                className={clsx("h-4 w-4", hasReacted && "fill-current")}
                aria-hidden="true"
              />
              I felt this
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onShare}
              aria-label="Share confession"
              className="px-3"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReport}
              aria-label="Report confession"
              className="px-3 text-zinc-500 hover:text-rose-100"
            >
              <Flag className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}