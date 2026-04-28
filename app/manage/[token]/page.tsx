// app/manage/[token]/page.tsx

import type { Metadata } from "next";
import { ManageConfessionForm } from "@/app/manage/[token]/ManageConfessionForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/PageShell";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashManageToken } from "@/lib/utils/tokens";
import { toManageableConfession } from "@/lib/types";
import type { ConfessionRow, ManageableConfession } from "@/lib/types";

export const metadata: Metadata = {
  title: "Manage Confession",
  description:
    "Use your private manage link to edit or delete an anonymous confession on No One Knows."
};

type ManageConfessionPageProps = {
  params: Promise<{
    token: string;
  }>;
};

async function getManageableConfession(
  token: string
): Promise<ManageableConfession | null> {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    return null;
  }

  const tokenHash = hashManageToken(trimmedToken);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("confessions")
    .select(
      "id, public_id, title, category, body, visibility, is_anonymous, approval_status, is_hidden, is_deleted, manage_token_hash, felt_count, report_count, created_at, updated_at, hidden_at, deleted_at"
    )
    .eq("manage_token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toManageableConfession(data as ConfessionRow);
}

export default async function ManageConfessionPage({
  params
}: ManageConfessionPageProps) {
  const { token } = await params;
  const confession = await getManageableConfession(token);

  if (!confession) {
    return (
      <PageShell
        width="narrow"
        eyebrow="Private link"
        title="This manage link is invalid or expired."
        description="Check that you copied the full private link. For safety, we cannot recover manage links if they are lost."
      >
        <Card variant="glass" className="text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-white">
            This manage link is invalid or expired.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-400">
            If this confession was deleted or the link was copied incorrectly, it
            cannot be managed from here.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/confess">Make a Confession</Button>
            <Button href="/archive" variant="secondary">
              Read the Archive
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      width="narrow"
      eyebrow="Private manage link"
      title="Manage your confession."
      description="Anyone with this private link can edit or delete this confession. Do not share it publicly."
    >
      <ManageConfessionForm token={token} confession={confession} />
    </PageShell>
  );
}