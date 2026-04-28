// app/privacy/page.tsx

import type { Metadata } from "next";
import { Database, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Privacy information for No One Knows, including what anonymous confession data is stored."
};

const storedDataItems = [
  "confession category",
  "title",
  "body",
  "visibility",
  "reactions",
  "reports",
  "timestamps",
  "anonymous session IDs",
  "hashed IPs for spam prevention",
  "hashed manage tokens"
] as const;

const privacyPromises = [
  "We do not sell your data.",
  "We do not store raw manage tokens.",
  "We do not publicly show IP addresses."
] as const;

export default function PrivacyPage() {
  return (
    <PageShell
      width="narrow"
      eyebrow="Privacy"
      title="Anonymous does not mean careless."
      description="No One Knows is designed to keep public users anonymous while still protecting the archive from spam, abuse, and unsafe content."
      actions={
        <>
          <Button href="/confess">Make a Confession</Button>
          <Button href="/guidelines" variant="secondary">
            Read Guidelines
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Card variant="glass">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-veil-300/20 bg-veil-500/10">
            <EyeOff className="h-5 w-5 text-veil-300" aria-hidden="true" />
          </div>

          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
            Public users stay anonymous
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Public users do not create accounts, public profiles, follower lists,
            comment threads, or direct messages. Confessions are shown as
            anonymous.
          </p>
        </Card>

        <Card variant="default">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <Database className="h-5 w-5 text-confession-pink" aria-hidden="true" />
          </div>

          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
            What we store
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            To operate the archive, moderation tools, private manage links, and
            abuse prevention systems, we store:
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {storedDataItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs text-zinc-300"
              >
                {item}
              </span>
            ))}
          </div>
        </Card>

        <Card variant="glass">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-confession-pink/30 bg-confession-pink/10">
            <KeyRound className="h-5 w-5 text-pink-200" aria-hidden="true" />
          </div>

          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
            Private manage links
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            When you submit a confession, you receive a private manage link. Save
            it carefully. Anyone with that link can edit or delete your
            confession.
          </p>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            We do not store raw manage tokens. We store only hashed manage tokens,
            so lost manage links cannot be recovered.
          </p>
        </Card>

        <Card variant="default">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-veil-300/20 bg-veil-500/10">
            <ShieldCheck className="h-5 w-5 text-veil-300" aria-hidden="true" />
          </div>

          <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
            Safety and abuse prevention
          </h2>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Anonymous session IDs help prevent duplicate reactions. Hashed IPs
            may be used for spam prevention, rate limiting, and moderation
            signals. We do not publicly show IP addresses.
          </p>

          <div className="soft-divider my-6" />

          <div className="space-y-3">
            {privacyPromises.map((promise) => (
              <p
                key={promise}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200"
              >
                {promise}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}