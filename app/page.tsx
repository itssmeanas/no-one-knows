// app/page.tsx

import Link from "next/link";
import {
  ArrowRight,
  EyeOff,
  Flag,
  Heart,
  LockKeyhole,
  MessageCircleOff,
  Shuffle,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CategoryChip } from "@/components/CategoryChip";
import { PageShell } from "@/components/PageShell";
import { confessionCategories } from "@/lib/categories";

const featuredConfession = {
  category: "I never told anyone",
  title: "I still check",
  body:
    "I pretend I moved on, but some nights I type your name and delete it before searching.",
  feltCount: "1.2K"
};

const safetyNotes = [
  {
    icon: EyeOff,
    title: "Anonymous by design",
    description:
      "No public profiles, no followers, no names. Just the truth someone needed to put down."
  },
  {
    icon: MessageCircleOff,
    title: "No comment threads",
    description:
      "There are no replies, arguments, pile-ons, or public shaming loops."
  },
  {
    icon: ShieldCheck,
    title: "Built for quiet safety",
    description:
      "Reports, moderation rules, and admin review help keep the archive human."
  }
] as const;

export default function HomePage() {
  return (
    <PageShell showHeader={false} width="wide" className="py-0">
      <header className="flex items-center justify-between py-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-glow transition group-hover:border-veil-300/40">
            <LockKeyhole className="h-5 w-5 text-veil-300" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.32em] text-zinc-200">
            No One Knows
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-6 sm:flex">
          <Link
            href="/guidelines"
            className="text-sm text-zinc-400 transition hover:text-zinc-100"
          >
            Guidelines
          </Link>
          <Link
            href="/archive"
            className="text-sm text-zinc-400 transition hover:text-zinc-100"
          >
            Archive
          </Link>
        </nav>
      </header>

      <section className="grid min-h-[calc(100vh-5.5rem)] items-center gap-12 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-zinc-300 shadow-inner-secret backdrop-blur">
            <EyeOff className="h-4 w-4 text-confession-pink" aria-hidden="true" />
            <span>A quiet place for anonymous truths.</span>
          </div>

          <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Everyone is hiding{" "}
            <span className="secret-gradient-text">something.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            Leave an anonymous confession. Read the truths strangers are carrying.
            React only if you felt it too.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/confess" size="lg">
              Make a Confession
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button href="/archive" variant="secondary" size="lg">
              Read the Archive
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-semibold text-white">0</p>
              <p className="mt-1 text-sm text-zinc-500">public profiles</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-semibold text-white">1</p>
              <p className="mt-1 text-sm text-zinc-500">quiet reaction</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-semibold text-white">∞</p>
              <p className="mt-1 text-sm text-zinc-500">things unsaid</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mr-0">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-confession-pink/14 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-8 h-72 w-44 -translate-x-1/2 rounded-t-full border border-veil-300/20 bg-gradient-to-b from-confession-violet/35 via-confession-pink/14 to-transparent keyhole-glow animate-slow-pulse"
          />

          <Card variant="glass" className="relative overflow-hidden p-5 sm:p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-veil-300/60 to-transparent" />

            <div className="rounded-4xl border border-white/10 bg-ink-950/72 p-5 shadow-inner-secret sm:p-6">
              <div className="mb-8 flex justify-center">
                <div className="relative flex h-40 w-28 items-end justify-center rounded-t-full border border-veil-300/30 bg-gradient-to-b from-confession-violet/45 via-confession-pink/18 to-transparent p-5 keyhole-glow">
                  <div className="h-20 w-12 rounded-t-full bg-ink-950 shadow-[0_0_32px_rgba(0,0,0,0.7)]" />
                  <Sparkles
                    className="absolute -right-3 top-10 h-5 w-5 text-pink-200"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <article className="rounded-4xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <CategoryChip category={featuredConfession.category} active />
                  <span className="text-xs text-zinc-500">Anonymous</span>
                </div>

                <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
                  {featuredConfession.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  {featuredConfession.body}
                </p>

                <div className="soft-divider my-5" />

                <div className="flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                  <span>Left in the dark</span>
                  <span className="inline-flex items-center gap-2">
                    <Heart className="h-4 w-4 text-confession-pink" aria-hidden="true" />
                    {featuredConfession.feltCount} felt this
                  </span>
                </div>
              </article>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-confession-pink">
              Choose the room
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              What kind of truth are you carrying?
            </h2>
          </div>

          <Button href="/confess" variant="secondary">
            Start quietly
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {confessionCategories.map((category) => (
            <CategoryChip key={category} category={category} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 py-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <Card variant="glass" className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-veil-500/14 blur-3xl"
          />
          <div className="relative">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <Shuffle className="h-5 w-5 text-veil-300" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-confession-pink">
              Random confession
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-white">
              A stranger left this in the dark.
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Open the archive at random. No profiles. No performance. Just one
              anonymous truth at a time.
            </p>
            <Button href="/random" className="mt-6" variant="secondary">
              Pull a confession
            </Button>
          </div>
        </Card>

        <Card variant="glass">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-confession-pink">
            Latest from the archive
          </p>
          <div className="mt-5 rounded-4xl border border-white/10 bg-white/[0.045] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <CategoryChip category="I am pretending" />
              <span className="text-xs text-zinc-500">Anonymous</span>
            </div>
            <h3 className="font-serif text-2xl font-semibold text-white">
              I lied about being happy
            </h3>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              Everyone thinks I am doing better because I learned how to answer
              quickly and smile before they ask anything else.
            </p>
            <div className="soft-divider my-5" />
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4 text-confession-pink" aria-hidden="true" />
                248 felt this
              </span>
              <Button href="/archive" variant="ghost" size="sm">
                Read the Archive
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 py-12 sm:py-16 lg:grid-cols-3">
        {safetyNotes.map((note) => {
          const Icon = note.icon;

          return (
            <Card key={note.title} variant="default">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                <Icon className="h-5 w-5 text-veil-300" aria-hidden="true" />
              </div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-white">
                {note.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {note.description}
              </p>
            </Card>
          );
        })}
      </section>

      <section className="py-12 sm:py-16">
        <Card variant="glass" className="overflow-hidden text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-3xl border border-confession-pink/30 bg-confession-pink/10">
            <Flag className="h-6 w-6 text-pink-200" aria-hidden="true" />
          </div>
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            This is a place for anonymous truth, not public harm.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Do not name real people, expose private information, threaten anyone,
            or use this space for revenge. Keep it anonymous. Keep it human.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/guidelines" variant="secondary">
              Read the Guidelines
            </Button>
            <Button href="/confess">
              Make a Confession
            </Button>
          </div>
        </Card>
      </section>
    </PageShell>
  );
}