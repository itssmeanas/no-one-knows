// app/not-found.tsx

import { ArrowLeft, LockKeyhole, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell width="narrow">
      <Card variant="glass" className="relative overflow-hidden text-center">
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-confession-pink/12 blur-3xl"
        />

        <div className="relative">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.06] shadow-glow">
            <LockKeyhole className="h-7 w-7 text-veil-300" aria-hidden="true" />
          </div>

          <p className="text-sm font-medium uppercase tracking-[0.28em] text-confession-pink">
            404
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            This room does not exist.
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-400">
            The page may have moved, the link may be wrong, or the confession may
            no longer be available.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/archive" variant="secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to archive
            </Button>

            <Button href="/random">
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Pull a confession
            </Button>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}