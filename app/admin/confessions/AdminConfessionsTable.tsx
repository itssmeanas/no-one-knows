// app/admin/confessions/AdminConfessionsTable.tsx

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  Search,
  Trash2,
  XCircle
} from "lucide-react";
import { AdminTable } from "@/components/AdminTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  approveConfession,
  deleteConfessionAsAdmin,
  hideConfession,
  rejectConfession,
  restoreConfessionAsAdmin,
  unhideConfession
} from "@/app/actions/admin-confessions";
import type { AdminConfessionListItem } from "@/lib/types";

export type AdminConfessionsTableProps = {
  confessions: AdminConfessionListItem[];
  activeFilter:
    | "newest"
    | "public"
    | "private"
    | "hidden"
    | "deleted"
    | "reported"
    | "pending";
  searchQuery: string;
  loadError: string | null;
};

const filters = [
  { label: "Newest", value: "newest" },
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
  { label: "Hidden", value: "hidden" },
  { label: "Deleted", value: "deleted" },
  { label: "Reported", value: "reported" },
  { label: "Pending approval", value: "pending" }
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

function getStatusLabel(confession: AdminConfessionListItem): string {
  if (confession.is_deleted) {
    return "Deleted";
  }

  if (confession.is_hidden) {
    return "Hidden";
  }

  if (confession.approval_status === "pending") {
    return "Pending";
  }

  if (confession.approval_status === "rejected") {
    return "Rejected";
  }

  return "Visible";
}

function getPublicUrl(publicId: string): string {
  if (typeof window === "undefined") {
    return `/c/${publicId}`;
  }

  return `${window.location.origin}/c/${publicId}`;
}

function getFilterHref(filter: string, query: string): string {
  const searchParams = new URLSearchParams();

  if (filter !== "newest") {
    searchParams.set("filter", filter);
  }

  if (query.trim()) {
    searchParams.set("q", query.trim());
  }

  const queryString = searchParams.toString();

  return queryString ? `/admin/confessions?${queryString}` : "/admin/confessions";
}

export function AdminConfessionsTable({
  confessions,
  activeFilter,
  searchQuery,
  loadError
}: AdminConfessionsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState(searchQuery);
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(loadError);
  const [isPending, startTransition] = useTransition();

  const columns = useMemo(
    () => [
      {
        key: "confession",
        header: "Confession",
        render: (confession: AdminConfessionListItem) => (
          <div className="min-w-72 max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-confession-pink">
              {confession.category}
            </p>
            <h2 className="mt-2 font-serif text-xl font-semibold text-white">
              {confession.title ?? "Untitled confession"}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
              {confession.body}
            </p>
            <p className="mt-3 text-xs text-zinc-600">
              Public ID: {confession.public_id}
            </p>
          </div>
        )
      },
      {
        key: "status",
        header: "Status",
        render: (confession: AdminConfessionListItem) => (
          <div className="space-y-2 whitespace-nowrap">
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-medium text-zinc-300">
              {getStatusLabel(confession)}
            </span>
            <p className="text-xs text-zinc-500">
              {confession.visibility}
            </p>
          </div>
        )
      },
      {
        key: "signals",
        header: "Signals",
        render: (confession: AdminConfessionListItem) => (
          <div className="whitespace-nowrap text-sm text-zinc-400">
            <p>{confession.felt_count} felt</p>
            <p>{confession.report_count} reports</p>
          </div>
        )
      },
      {
        key: "created",
        header: "Created",
        render: (confession: AdminConfessionListItem) => (
          <span className="whitespace-nowrap text-sm text-zinc-400">
            {formatDate(confession.created_at)}
          </span>
        )
      },
      {
        key: "actions",
        header: "Actions",
        render: (confession: AdminConfessionListItem) => (
          <div className="flex min-w-72 flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => copyPublicLink(confession.public_id)}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy link
            </Button>

            {confession.approval_status !== "approved" ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending || confession.is_deleted}
                onClick={() => runAction(() => approveConfession({ id: confession.id }))}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Approve
              </Button>
            ) : null}

            {confession.approval_status !== "rejected" ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isPending || confession.is_deleted}
                onClick={() => runAction(() => rejectConfession({ id: confession.id }))}
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Reject
              </Button>
            ) : null}

            {confession.is_hidden ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending || confession.is_deleted}
                onClick={() => runAction(() => unhideConfession({ id: confession.id }))}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Unhide
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isPending || confession.is_deleted}
                onClick={() => runAction(() => hideConfession({ id: confession.id }))}
              >
                <EyeOff className="h-4 w-4" aria-hidden="true" />
                Hide
              </Button>
            )}

            {confession.is_deleted ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() =>
                  runAction(() => restoreConfessionAsAdmin({ id: confession.id }))
                }
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Restore
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={isPending}
                onClick={() =>
                  confirmAndRunDelete(confession.id)
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            )}
          </div>
        )
      }
    ],
    [isPending]
  );

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchParams = new URLSearchParams();

    if (activeFilter !== "newest") {
      searchParams.set("filter", activeFilter);
    }

    if (query.trim()) {
      searchParams.set("q", query.trim());
    }

    const queryString = searchParams.toString();

    router.push(queryString ? `/admin/confessions?${queryString}` : "/admin/confessions");
  }

  async function copyPublicLink(publicId: string) {
    await navigator.clipboard.writeText(getPublicUrl(publicId));
    setMessage("Public link copied.");
    setActionError(null);
  }

  function confirmAndRunDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this confession? This performs a soft delete."
    );

    if (!confirmed) {
      return;
    }

    runAction(() => deleteConfessionAsAdmin({ id }));
  }

  function runAction(action: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setMessage(null);
    setActionError(null);

    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        setActionError(result.error);
        return;
      }

      setMessage("Moderation action saved.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <form className="grid gap-4 lg:grid-cols-[1fr_auto]" onSubmit={submitSearch}>
          <Input
            id="admin-confession-search"
            label="Search confessions"
            placeholder="Search by title, body, or public ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
          />

          <div className="flex items-end">
            <Button type="submit" className="w-full lg:w-auto">
              Search
            </Button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              href={getFilterHref(filter.value, query)}
              variant={activeFilter === filter.value ? "primary" : "secondary"}
              size="sm"
            >
              {filter.label}
            </Button>
          ))}
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
        rows={confessions}
        getRowKey={(confession) => confession.id}
        emptyTitle="No confessions found"
        emptyDescription="Try a different filter or search term."
      />
    </div>
  );
}