// app/c/[publicId]/loading.tsx

import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/Card";

export default function ConfessionDetailLoading() {
  return (
    <PageShell width="narrow">
      <div className="mb-6 h-5 w-36 animate-pulse rounded-full bg-white/10" />

      <Card variant="glass" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-confession-pink/12 blur-3xl"
        />

        <div className="relative animate-pulse space-y-7">
          <div className="flex items-center justify-between gap-3">
            <div className="h-8 w-44 rounded-full bg-white/10" />
            <div className="h-4 w-24 rounded-full bg-white/10" />
          </div>

          <div className="space-y-3">
            <div className="h-12 w-4/5 rounded-2xl bg-white/10" />
            <div className="h-12 w-2/3 rounded-2xl bg-white/10" />
          </div>

          <div className="space-y-3">
            <div className="h-5 w-full rounded-full bg-white/10" />
            <div className="h-5 w-11/12 rounded-full bg-white/10" />
            <div className="h-5 w-10/12 rounded-full bg-white/10" />
            <div className="h-5 w-8/12 rounded-full bg-white/10" />
          </div>

          <div className="soft-divider" />

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded-full bg-white/10" />
              <div className="h-4 w-32 rounded-full bg-white/10" />
            </div>

            <div className="flex gap-2">
              <div className="h-10 w-28 rounded-full bg-white/10" />
              <div className="h-10 w-24 rounded-full bg-white/10" />
              <div className="h-10 w-24 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}