// app/loading.tsx

import { LockKeyhole } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/PageShell";

export default function Loading() {
  return (
    <PageShell width="wide">
      <section
        aria-label="Loading page"
        aria-busy="true"
        className="grid min-h-[60vh] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 shadow-inner-secret">
            <LockKeyhole className="h-4 w-4 text-veil-300" aria-hidden="true" />
            <span className="text-sm text-zinc-400">Opening the room...</span>
          </div>

          <div className="space-y-4">
            <div className="h-14 w-11/12 animate-pulse rounded-3xl bg-white/10 sm:h-20" />
            <div className="h-14 w-8/12 animate-pulse rounded-3xl bg-white/10 sm:h-20" />
          </div>

          <div className="space-y-3">
            <div className="h-5 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
            <div className="h-5 w-10/12 max-w-lg animate-pulse rounded-full bg-white/10" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="h-12 w-full animate-pulse rounded-full bg-white/10 sm:w-44" />
            <div className="h-12 w-full animate-pulse rounded-full bg-white/10 sm:w-40" />
          </div>
        </div>

        <Card variant="glass" className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-confession-pink/12 blur-3xl"
          />

          <div className="relative animate-pulse space-y-7">
            <div className="mx-auto h-40 w-28 rounded-t-full border border-veil-300/20 bg-white/10" />

            <div className="rounded-4xl border border-white/10 bg-white/[0.045] p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="h-8 w-40 rounded-full bg-white/10" />
                <div className="h-4 w-20 rounded-full bg-white/10" />
              </div>

              <div className="space-y-3">
                <div className="h-8 w-2/3 rounded-2xl bg-white/10" />
                <div className="h-4 w-full rounded-full bg-white/10" />
                <div className="h-4 w-11/12 rounded-full bg-white/10" />
                <div className="h-4 w-8/12 rounded-full bg-white/10" />
              </div>

              <div className="soft-divider my-5" />

              <div className="flex items-center justify-between gap-4">
                <div className="h-4 w-24 rounded-full bg-white/10" />
                <div className="h-4 w-28 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}