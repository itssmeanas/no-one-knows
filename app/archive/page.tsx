// app/archive/page.tsx

import type { Metadata } from "next";
import { ArchiveFilters } from "@/app/archive/ArchiveFilters";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfessionCard } from "@/components/ConfessionCard";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/server";
import { toPublicConfession } from "@/lib/types";
import type { ConfessionCategory, ConfessionRow } from "@/lib/types";
import { isConfessionCategory } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Read anonymous confessions from strangers carrying quiet truths on No One Knows."
};

type ArchivePageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

const pageSize = 24;

function getCategoryFilter(category: string | undefined): ConfessionCategory | null {
  if (!category) {
    return null;
  }

  const decodedCategory = decodeURIComponent(category);

  if (!isConfessionCategory(decodedCategory)) {
    return null;
  }

  return decodedCategory;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const resolvedSearchParams = await searchParams;
  const categoryFilter = getCategoryFilter(resolvedSearchParams?.category);

  const supabase = await createClient();

  let query = supabase
    .from("confessions")
    .select(
      "id, public_id, title, category, body, visibility, is_anonymous, approval_status, is_hidden, is_deleted, manage_token_hash, felt_count, report_count, created_at, updated_at, hidden_at, deleted_at"
    )
    .eq("visibility", "public")
    .eq("approval_status", "approved")
    .eq("is_hidden", false)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(pageSize);

  if (categoryFilter) {
    query = query.eq("category", categoryFilter);
  }

  const { data, error } = await query;

  const confessions = (data ?? []).map((row) =>
    toPublicConfession(row as ConfessionRow)
  );

  return (
    <PageShell
      width="wide"
      eyebrow="The archive"
      title="Read the truths strangers are carrying."
      description="No profiles. No comments. Just anonymous confessions and one quiet way to say you felt it too."
      actions={
        <>
          <Button href="/confess">Make a Confession</Button>
          <Button href="/random" variant="secondary">
            Open Random
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        <ArchiveFilters selectedCategory={categoryFilter} />

        {error ? (
          <Card variant="danger">
            <h2 className="font-serif text-2xl font-semibold text-white">
              The archive could not be opened.
            </h2>
            <p className="mt-3 text-sm leading-7 text-rose-100/80">
              Please try again in a moment.
            </p>
          </Card>
        ) : null}

        {!error && confessions.length === 0 ? (
          <Card variant="glass" className="text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-white">
              The room is quiet. Be the first to confess.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-400">
              Public confessions will appear here after they are approved and visible.
            </p>
            <Button href="/confess" className="mt-7">
              Make a Confession
            </Button>
          </Card>
        ) : null}

        {confessions.length > 0 ? (
          <section
            aria-label="Public confession archive"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {confessions.map((confession) => (
              <ConfessionCard
                key={confession.publicId}
                confession={{
                  publicId: confession.publicId,
                  category: confession.category,
                  title: confession.title,
                  body: confession.body,
                  createdAt: confession.createdAt,
                  feltCount: confession.feltCount
                }}
              />
            ))}
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}