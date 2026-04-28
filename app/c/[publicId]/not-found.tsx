// app/c/[publicId]/not-found.tsx

import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/PageShell";

export default function ConfessionDetailNotFound() {
  return (
    <PageShell width="narrow">
      <Card variant="glass" className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.06] shadow-glow">
          <LockKeyhole className="h-7 w-7 text-veil-300" aria-hidden="true" />
        </div>

        <h1 className="font-serif text-4xl font-semibold tracking-tight text-white">
          This confession is not available.
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-400">
          It may have been removed, hidden, kept private, or never placed in the
          archive.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/archive" variant="secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to archive
          </Button>

          <Button href="/random">
            Pull another confession
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}