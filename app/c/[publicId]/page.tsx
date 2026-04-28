// app/c/[publicId]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CategoryChip } from "@/components/CategoryChip";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/server";
import { isValidPublicId } from "@/lib/utils/ids";
import { toPublicConfession } from "@/lib/types";
import type { ConfessionRow, PublicConfession } from "@/lib/types";

type ConfessionDetailPageProps = {
  params: Promise<{
    publicId: string;
  }>;
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

function getBodyPreview(body: string): string {
  const normalizedBody = body.replace(/\s+/g, " ").trim();

  if (normalizedBody.length <= 150) {
    return normalizedBody;
  }

  return `${normalizedBody.slice(0, 147).trim()}...`;
}

async function getPublicConfession(publicId: string): Promise<PublicConfession | null> {
  if (!isValidPublicId(publicId)) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("confessions")
    .select(
      "id, public_id, title, category, body, visibility, is_anonymous, approval_status, is_hidden, is_deleted, manage_token_hash, felt_count, report_count, created_at, updated_at, hidden_at, deleted_at"
    )
    .eq("public_id", publicId)
    .eq("visibility", "public")
    .eq("approval_status", "approved")
    .eq("is_hidden", false)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toPublicConfession(data as ConfessionRow);
}

export async function generateMetadata({
  params
}: ConfessionDetailPageProps): Promise<Metadata> {
  const { publicId } = await params;
  const confession = await getPublicConfession(publicId);

  if (!confession) {
    return {
      title: "Confession not found",
      description: "This confession could not be found on No One Knows."
    };
  }

  const description = getBodyPreview(confession.body);

  return {
    title: "Someone confessed something on No One Knows",
    description,
    openGraph: {
      title: "Someone confessed something on No One Knows",
      description,
      images: [
        {
          url: "/og/default.png",
          width: 1200,
          height: 630,
          alt: "A glowing keyhole in a dark room for No One Knows"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "Someone confessed something on No One Knows",
      description,
      images: ["/og/default.png"]
    }
  };
}

export default async function ConfessionDetailPage({
  params
}: ConfessionDetailPageProps) {
  const { publicId } = await params;
  const confession = await getPublicConfession(publicId);

  if (!confession) {
    notFound();
  }

  return (
    <PageShell width="narrow">
      <div className="mb-6">
        <Link
          href="/archive"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to archive
        </Link>
      </div>

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

          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl">
            {confession.title ?? "Untitled confession"}
          </h1>

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

              <Button type="button" variant="ghost" size="sm" disabled>
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

      <div className="mt-6">
        <Button href="/archive" variant="secondary">
          Back to archive
        </Button>
      </div>
    </PageShell>
  );
}