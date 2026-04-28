// app/admin/confessions/page.tsx

import type { Metadata } from "next";
import { AdminConfessionsTable } from "@/app/admin/confessions/AdminConfessionsTable";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/PageShell";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminConfessionListItem, ApprovalStatus, ConfessionVisibility } from "@/lib/types";

export const metadata: Metadata = {
  title: "Admin Confessions",
  description: "Moderate confessions on No One Knows."
};

type AdminConfessionsPageProps = {
  searchParams?: Promise<{
    q?: string;
    filter?: string;
  }>;
};

type ConfessionFilter =
  | "newest"
  | "public"
  | "private"
  | "hidden"
  | "deleted"
  | "reported"
  | "pending";

const validFilters = new Set<ConfessionFilter>([
  "newest",
  "public",
  "private",
  "hidden",
  "deleted",
  "reported",
  "pending"
]);

function parseFilter(value: string | undefined): ConfessionFilter {
  if (value && validFilters.has(value as ConfessionFilter)) {
    return value as ConfessionFilter;
  }

  return "newest";
}

function normalizeSearchQuery(value: string | undefined): string {
  return value?.trim() ?? "";
}

export default async function AdminConfessionsPage({
  searchParams
}: AdminConfessionsPageProps) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const searchQuery = normalizeSearchQuery(resolvedSearchParams?.q);
  const activeFilter = parseFilter(resolvedSearchParams?.filter);

  const supabase = createAdminClient();

  let query = supabase
    .from("confessions")
    .select(
      "id, public_id, title, category, body, visibility, is_anonymous, approval_status, is_hidden, is_deleted, manage_token_hash, felt_count, report_count, created_at, updated_at, hidden_at, deleted_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchQuery) {
    query = query.or(
      `title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%,public_id.ilike.%${searchQuery}%`
    );
  }

  if (activeFilter === "public") {
    query = query.eq("visibility", "public" satisfies ConfessionVisibility);
  }

  if (activeFilter === "private") {
    query = query.eq("visibility", "private" satisfies ConfessionVisibility);
  }

  if (activeFilter === "hidden") {
    query = query.eq("is_hidden", true);
  }

  if (activeFilter === "deleted") {
    query = query.eq("is_deleted", true);
  }

  if (activeFilter === "reported") {
    query = query.gt("report_count", 0);
  }

  if (activeFilter === "pending") {
    query = query.eq("approval_status", "pending" satisfies ApprovalStatus);
  }

  const { data, error } = await query;
  const confessions = (data ?? []) as AdminConfessionListItem[];

  return (
    <PageShell
      width="wide"
      eyebrow="Admin"
      title="Confessions"
      description="Search, filter, approve, hide, delete, restore, and moderate anonymous confessions."
      actions={
        <>
          <Button href="/admin">Dashboard</Button>
          <Button href="/admin/reports" variant="secondary">
            Reports
          </Button>
          <Button href="/admin/settings" variant="ghost">
            Settings
          </Button>
        </>
      }
    >
      <AdminConfessionsTable
        confessions={confessions}
        activeFilter={activeFilter}
        searchQuery={searchQuery}
        loadError={error ? "Could not load confessions." : null}
      />
    </PageShell>
  );
}