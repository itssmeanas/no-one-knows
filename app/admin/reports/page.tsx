// app/admin/reports/page.tsx

import type { Metadata } from "next";
import { AdminReportsTable } from "@/app/admin/reports/AdminReportsTable";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/PageShell";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminReportListItem, ReportStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Admin Reports",
  description: "Review confession reports on No One Knows."
};

type AdminReportsPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const validReportStatuses = new Set<ReportStatus>([
  "pending",
  "reviewed",
  "dismissed"
]);

function parseReportStatus(value: string | undefined): ReportStatus {
  if (value && validReportStatuses.has(value as ReportStatus)) {
    return value as ReportStatus;
  }

  return "pending";
}

export default async function AdminReportsPage({
  searchParams
}: AdminReportsPageProps) {
  await requireAdmin();

  const resolvedSearchParams = await searchParams;
  const activeStatus = parseReportStatus(resolvedSearchParams?.status);

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reports")
    .select(
      `
        id,
        confession_id,
        reason,
        details,
        anonymous_session_id,
        ip_hash,
        status,
        created_at,
        reviewed_at,
        reviewed_by,
        confession:confessions (
          id,
          public_id,
          title,
          category,
          body,
          is_hidden,
          is_deleted
        )
      `
    )
    .eq("status", activeStatus)
    .order("created_at", { ascending: false })
    .limit(100);

  const reports = (data ?? []) as AdminReportListItem[];

  return (
    <PageShell
      width="wide"
      eyebrow="Admin"
      title="Reports"
      description="Review reports, inspect reported confessions, and take moderation action when needed."
      actions={
        <>
          <Button href="/admin">Dashboard</Button>
          <Button href="/admin/confessions" variant="secondary">
            Confessions
          </Button>
          <Button href="/admin/settings" variant="ghost">
            Settings
          </Button>
        </>
      }
    >
      <AdminReportsTable
        reports={reports}
        activeStatus={activeStatus}
        loadError={error ? "Could not load reports." : null}
      />
    </PageShell>
  );
}