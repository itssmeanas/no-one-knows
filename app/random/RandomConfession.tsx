// app/random/RandomConfession.tsx

"use client";

import { useState } from "react";
import { ArrowLeft, Flag, Heart, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CategoryChip } from "@/components/CategoryChip";
import type { PublicConfession } from "@/lib/types";

export type RandomConfessionProps = {
  confession: PublicConfession;
};

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatFeltCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }

  const formatted = new Intl.NumberFormat("en", {
    maximumFractionDigits: count >= 10000 ? 0 : 1
  }).format(count / 1000);

  return `${formatted}K`;
}

export function RandomConfession({ confession }: RandomConfessionProps) {
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  async function handleShare() {
    const confessionUrl = `${window.location.origin}/c/${confession.publicId}`;

    if (navigator.share) {
      await navigator.share({
        title: "Someone confessed something on No One Knows",
        text: confession.body.slice(0, 140),
        url: confessionUrl
      });

      return;
    }

    await navigator.clipboard.writeText(confessionUrl);
    setShareMessage("Link copied.");
  }

  function pullAnotherConfession() {
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <Card variant="glass" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-confession-pink/12 blur-3xl"
        />

        <article className="relative">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <CategoryChip category={confession.category} active />
            <span className="text-sm text-zinc-500">
              {formatTimestamp(confession.createdAt)}
            </span>
          </div>

          <h2 className="font-serif text-4xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
            {confession.title ?? "Untitled confession"}
          </h2>

          <p className="mt-7 whitespace-pre-line text-lg leading-9 text-zinc-200">
            {confession.body}
          </p>

          <div className="soft-divider my-7" />

          <footer className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-300">Anonymous</p>
              <p className="text-sm text-zinc-500">
                {formatFeltCount(confession.feltCount)} felt this
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" disabled>
                <Heart className="h-4 w-4" aria-hidden="true" />
                I felt this
              </Button>

              <Button type="button" variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Share
              </Button>

              <Button type="button" variant="ghost" size="sm" disabled>
                <Flag className="h-4 w-4" aria-hidden="true" />
                Report
              </Button>
            </div>
          </footer>
        </article>
      </Card>

      {shareMessage ? (
        <p className="rounded-2xl border border-veil-300/20 bg-veil-500/10 px-4 py-3 text-sm text-veil-300">
          {shareMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button href="/archive" variant="secondary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to archive
        </Button>

        <Button type="button" onClick={pullAnotherConfession}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Pull another confession
        </Button>
      </div>
    </div>
  );
}