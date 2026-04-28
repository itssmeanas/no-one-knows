// app/confess/page.tsx

import type { Metadata } from "next";
import { ConfessForm } from "@/app/confess/ConfessForm";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Make a Confession",
  description:
    "Leave an anonymous confession on No One Knows. Keep it anonymous, human, and safe."
};

export default function ConfessPage() {
  return (
    <PageShell
      width="narrow"
      eyebrow="Make a confession"
      title="Say the thing you cannot say out loud."
      description="Move slowly. Keep it anonymous. You will receive a private manage link after your confession is placed in the archive."
    >
      <ConfessForm />
    </PageShell>
  );
}