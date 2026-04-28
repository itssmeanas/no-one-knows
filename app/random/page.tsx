// app/random/page.tsx

import type { Metadata } from "next";
import { RandomConfession } from "@/app/random/RandomConfession";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/PageShell";
import { createClient } from "@/lib/supabase/server";
import { toPublicConfession } from "@/lib/types";
import type { ConfessionRow, PublicConfession } from "@/lib/types";

export const metadata: Metadata = {
  title: "Random Confession",
  description:
    "Open one anonymous confession at random from the No One Knows archive."
};

async function getRandomPublicConfession(): Promise<PublicConfession | null> {
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("confessions")
    .select("id", {
      count: "exact",
      head: true
    })
    .eq("visibility", "public")
    .eq("approval_status", "approved")
    .eq("is_hidden", false)
    .eq("is_deleted", false);

  if (countError || !count) {
    return null;
  }

  const randomOffset = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from("confessions")
    .select(
      "id, public_id, title, category, body, visibility, is_anonymous, approval_status, is_hidden, is_deleted, manage_token_hash, felt_count, report_count, created_at, updated_at, hidden_at, deleted_at"
    )
    .eq("visibility", "public")
    .eq("approval_status", "approved")
    .eq("is_hidden", false)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(randomOffset, randomOffset)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toPublicConfession(data as ConfessionRow);
}

export default async function RandomPage() {
  const confession = await getRandomPublicConfession();

  return (
    <PageShell
      width="narrow"
      eyebrow="Random confession"
      title="A stranger left this in the dark."
      description="Pull one anonymous confession from the archive. No profiles. No comments. Just one truth at a time."
    >
      {confession ? (
        <RandomConfession confession={confession} />
      ) : (
        <Card variant="glass" className="text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-white">
            The room is quiet. Be the first to confess.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-400">
            Random confessions will appear here once public confessions are approved and visible.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/confess">Make a Confession</Button>
            <Button href="/archive" variant="secondary">
              Back to archive
            </Button>
          </div>
        </Card>
      )}
    </PageShell>
  );
}