// app/admin/page.tsx

import type { Metadata } from "next";
import {
  Archive,
  Eye,
  EyeOff,
  Flag,
  Heart,
  Inbox,
  Lock,
  ShieldAlert,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/PageShell";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for No One Knows."
};

type DashboardStat = {
  label: string;
  value: number;
  icon: React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
};

async function getCount(
  table: "confessions" | "reports",
  filters?: (query: ReturnType<ReturnType<typeof createAdminClient>["from"]>) => unknown
): Promise<number> {
  const supabase = createAdminClient();

  let query = supabase
    .from(table)
    .select("id", {
      count: "exact",
      head: true
    });

  if (filters) {
    query = filters(query) as typeof query;
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Unable to count ${table}.`);
  }

  return count ?? 0;
}

async function getTotalFeltReactions(): Promise<number> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("confessions")
    .select("felt_count");

  if (error) {
    throw new Error("Unable to count total felt reactions.");
  }

  return data.reduce((total, confession) => total + confession.felt_count, 0);
}

function getStartOfTodayIso(): string {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return startOfToday.toISOString();
}

function getStartOfWeekIso(): string {
  const now = new Date();
  const day = now.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysSinceMonday
  );

  return startOfWeek.toISOString();
}

async function getDashboardStats(): Promise<DashboardStat[]> {
  const [
    totalConfessions,
    publicConfessions,
    privateConfessions,
    hiddenConfessions,
    deletedConfessions,
    totalFeltReactions,
    totalReports,
    pendingReports,
    confessionsToday,
    confessionsThisWeek
  ] = await Promise.all([
    getCount("confessions"),
    getCount("confessions", (query) => query.eq("visibility", "public")),
    getCount("confessions", (query) => query.eq("visibility", "private")),
    getCount("confessions", (query) => query.eq("is_hidden", true)),
    getCount("confessions", (query) => query.eq("is_deleted", true)),
    getTotalFeltReactions(),
    getCount("reports"),
    getCount("reports", (query) => query.eq("status", "pending")),
    getCount("confessions", (query) =>
      query.gte("created_at", getStartOfTodayIso())
    ),
    getCount("confessions", (query) =>
      query.gte("created_at", getStartOfWeekIso())
    )
  ]);

  return [
    {
      label: "Total confessions",
      value: totalConfessions,
      icon: Archive
    },
    {
      label: "Public confessions",
      value: publicConfessions,
      icon: Eye
    },
    {
      label: "Private confessions",
      value: privateConfessions,
      icon: Lock
    },
    {
      label: "Hidden confessions",
      value: hiddenConfessions,
      icon: EyeOff
    },
    {
      label: "Deleted confessions",
      value: deletedConfessions,
      icon: Trash2
    },
    {
      label: "Total felt reactions",
      value: totalFeltReactions,
      icon: Heart
    },
    {
      label: "Total reports",
      value: totalReports,
      icon: Flag
    },
    {
      label: "Pending reports",
      value: pendingReports,
      icon: ShieldAlert
    },
    {
      label: "Confessions today",
      value: confessionsToday,
      icon: Inbox
    },
    {
      label: "Confessions this week",
      value: confessionsThisWeek,
      icon: Inbox
    }
  ];
}

function formatStatValue(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const stats = await getDashboardStats();

  return (
    <PageShell
      width="wide"
      eyebrow="Admin"
      title="Dashboard"
      description="Review the health of the archive, reports, moderation queue, and confession activity."
      actions={
        <>
          <Button href="/admin/confessions">Confessions</Button>
          <Button href="/admin/reports" variant="secondary">
            Reports
          </Button>
          <Button href="/admin/settings" variant="ghost">
            Settings
          </Button>
        </>
      }
    >
      <section
        aria-label="Admin dashboard stats"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label} variant="glass" className="relative overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-confession-pink/10 blur-2xl"
              />

              <div className="relative">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                  <Icon className="h-5 w-5 text-veil-300" aria-hidden="true" />
                </div>

                <p className="text-3xl font-semibold tracking-tight text-white">
                  {formatStatValue(stat.value)}
                </p>

                <h2 className="mt-2 text-sm leading-6 text-zinc-400">
                  {stat.label}
                </h2>
              </div>
            </Card>
          );
        })}
      </section>
    </PageShell>
  );
}