// app/admin/login/LoginForm.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/browser";

type LoginState = {
  email: string;
  password: string;
};

const initialLoginState: LoginState = {
  email: "",
  password: ""
};

export function LoginForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<LoginState>(initialLoginState);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof LoginState, value: string) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = formState.email.trim();
    const password = formState.password;

    if (!email || !password) {
      setError("Enter your admin email and password.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError("Invalid admin login.");
        return;
      }

      router.refresh();
      router.push("/admin");
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-white">
          Admin login
        </h2>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Sign in with the Supabase Auth account that matches the configured
          admin email.
        </p>
      </div>

      <Input
        id="admin-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="admin@example.com"
        value={formState.email}
        onChange={(event) => updateField("email", event.target.value)}
        disabled={isPending}
      />

      <Input
        id="admin-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={formState.password}
        onChange={(event) => updateField("password", event.target.value)}
        disabled={isPending}
      />

      {error ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-100">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}