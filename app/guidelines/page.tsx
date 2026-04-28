// app/guidelines/page.tsx

import type { Metadata } from "next";
import { AlertTriangle, EyeOff, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Guidelines",
  description:
    "Guidelines for keeping No One Knows anonymous, human, and safe."
};

const allowedExamples = [
  "regret",
  "guilt",
  "love",
  "sadness",
  "fear",
  "embarrassment",
  "loneliness",
  "anonymous emotional truths"
] as const;

const notAllowedExamples = [
  "real names",
  "phone numbers",
  "addresses",
  "emails",
  "threats",
  "blackmail",
  "revenge posting",
  "hate or discrimination"
] as const;

export default function GuidelinesPage() {
  return (
    <PageShell
      width="narrow"
      eyebrow="Guidelines"
      title="This is a place for anonymous truth, not public harm."
      description="Before you confess, make sure the truth you share does not expose, threaten, or target another person."
      actions={
        <>
          <Button href="/confess">Make a Confession</Button>
          <Button href="/archive" variant="secondary">
            Read the Archive
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Card variant="glass">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-confession-pink/30 bg-confession-pink/10">
            <EyeOff className="h-5 w-5 text-pink-200" aria-hidden="true" />
          </div>

          <div className="space-y-5 text-base leading-8 text-zinc-300">
            <p>
              This is a place for anonymous truth, not public harm.
            </p>

            <p>
              Do not name real people, expose private information, threaten
              anyone, or use this space for revenge.
            </p>

            <p>
              You can confess regret, love, guilt, fear, loneliness, shame, or
              things you have never said out loud.
            </p>

            <p>
              Keep it anonymous. Keep it human.
            </p>
          </div>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2">
          <Card variant="default">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-veil-300/20 bg-veil-500/10">
              <Heart className="h-5 w-5 text-veil-300" aria-hidden="true" />
            </div>

            <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
              What belongs here
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {allowedExamples.map((example) => (
                <span
                  key={example}
                  className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs text-zinc-300"
                >
                  {example}
                </span>
              ))}
            </div>
          </Card>

          <Card variant="danger">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-500/10">
              <AlertTriangle className="h-5 w-5 text-rose-200" aria-hidden="true" />
            </div>

            <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
              What does not belong here
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {notAllowedExamples.map((example) => (
                <span
                  key={example}
                  className="rounded-full border border-rose-300/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100"
                >
                  {example}
                </span>
              ))}
            </div>
          </Card>
        </section>

        <Card variant="glass">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <ShieldCheck className="h-5 w-5 text-veil-300" aria-hidden="true" />
          </div>

          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
            If something feels unsafe
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Confessions can be reported for review. Reports help keep the archive
            from becoming a public shaming wall. If a confession includes
            immediate danger or self-harm concern, contact local emergency
            services or a trusted crisis support line.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}