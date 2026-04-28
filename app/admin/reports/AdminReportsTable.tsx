// app/admin/reports/AdminReportsTable.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  EyeOff,
  FileWarning,
  Trash2,
  XCircle
} from "lucide-react";
import { AdminTable } from "@/components/AdminTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  deleteReportedConfession,
  dismissReport,
  hideReportedConfession,
  markReportReviewed
} from "@/app/actions/admin-reports";
import type { AdminReportListItem, ReportStatus } from "@/lib/types";

export type AdminReportsTableProps = {
  reports: AdminReportListItem[];
  activeStatus: ReportStatus;
  loadError: string | null;
};

const statusFilters = [
  { label: "Pending", value: "pending" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Dismissed", value: "dismissed" }
] as const;

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function getStatusHref(status: ReportStatus): string {
  return status === "pending"
    ? "/admin/reports"
    : `/admin/reports?status=${status}`;
}

function getConfessionTitle(report: AdminReportListItem): string {
  return report.confession?.title ?? "Untitled confession";
}

function getConfessionPreview(report: AdminReportListItem): string {
  return report.confession?.body ?? "The reported confession could not be loaded.";
}

export function AdminReportsTable({
  reports,
  activeStatus,
  loadError
}: AdminReportsTableProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(loadError);
  const [isPending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setMessage(null);
    setActionError(null);

    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        setActionError(result.error);
        return;
      }

      setMessage("Report action saved.");
      router.refresh();
    });
  }

  function confirmAndDeleteReportConfession(reportId: string) {
    const confirmed = window.confirm(
      "Delete the reported confession? This performs a soft delete."
    );

    if (!confirmed) {
      return;
    }

    runAction(() => deleteReportedConfession({ reportId }));
  }

  const columns = [
    {
      key: "report",
      header: "Report",
      render: (report: AdminReportListItem) => (
        <div className="min-w-64">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-confession-pink">
            {report.reason}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {report.details ?? "No extra details provided."}
          </p>
          <p className="mt-3 text-xs text-zinc-600">
            Reported {formatDate(report.created_at)}
          </p>
        </div>
      )
    },
    {
      key: "confession",
      header: "Reported confession",
      render: (report: AdminReportListItem) => (
        <div className="min-w-80 max-w-xl">
          {report.confession ? (
            <>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-veil-300">
                {report.confession.category}
              </p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-white">
                {getConfessionTitle(report)}
              </h2>
              <p className="mt-2 line-clamp-4 text-sm leading-6 text-zinc-400">
                {getConfessionPreview(report)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                <span>Public ID: {report.confession.public_id}</span>
                {report.confession.is_hidden ? <span>Hidden</span> : null}
                {report.confession.is_deleted ? <span>Deleted</span> : null}
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-zinc-400">
              The reported confession could not be loaded.
            </p>
          )}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (report: AdminReportListItem) => (
        <div className="space-y-2 whitespace-nowrap">
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-medium text-zinc-300">
            {report.status}
          </span>
          {report.reviewed_at ? (
            <p className="text-xs text-zinc-500">
              Reviewed {formatDate(report.reviewed_at)}
            </p>
          ) : null}
        </div>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (report: AdminReportListItem) => (
        <div className="flex min-w-72 flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isPending || report.status === "reviewed"}
            onClick={() => runAction(() => markReportReviewed({ reportId: report.id }))}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Mark reviewed
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isPending || report.status === "dismissed"}
            onClick={() => runAction(() => dismissReport({ reportId: report.id }))}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Dismiss
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={
              isPending ||
              !report.confession ||
              report.confession.is_hidden ||
              report.confession.is_deleted
            }
            onClick={() => runAction(() => hideReportedConfession({ reportId: report.id }))}
          >
            <EyeOff className="h-4 w-4" aria-hidden="true" />
            Hide confession
          </Button>

          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={isPending || !report.confession || report.confession.is_deleted}
            onClick={() => confirmAndDeleteReportConfession(report.id)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete confession
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <FileWarning className="h-5 w-5 text-confession-pink" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
              Review queue
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Filter reports by status and take moderation action on the related confession.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                href={getStatusHref(filter.value)}
                variant={activeStatus === filter.value ? "primary" : "secondary"}
                size="sm"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {actionError ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-100">
          {actionError}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-2xl border border-veil-300/20 bg-veil-500/10 px-4 py-3 text-sm leading-6 text-veil-300">
          {message}
        </p>
      ) : null}

      <AdminTable
        columns={columns}
        rows={reports}
        getRowKey={(report) => report.id}
        emptyTitle="No reports found"
        emptyDescription="There are no reports in this status right now."
      />
    </div>
  );
}