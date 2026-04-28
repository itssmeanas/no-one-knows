// app/admin/login/page.tsx

import type { Metadata } from "next";
import { LoginForm } from "@/app/admin/login/LoginForm";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/PageShell";
import { redirectAdminAwayFromLogin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Admin login for No One Knows."
};

export default async function AdminLoginPage() {
  await redirectAdminAwayFromLogin();

  return (
    <PageShell
      width="narrow"
      eyebrow="Admin"
      title="Enter quietly."
      description="Admin access is restricted to the configured allowed email."
    >
      <Card variant="glass">
        <LoginForm />
      </Card>
    </PageShell>
  );
}