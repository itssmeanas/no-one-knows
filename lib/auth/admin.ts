// lib/auth/admin.ts

import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  user: User;
  email: string;
};

function getAllowedAdminEmail() {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error("Missing ADMIN_EMAIL environment variable.");
  }

  return adminEmail.trim().toLowerCase();
}

function getUserEmail(user: User) {
  return user.email?.trim().toLowerCase() ?? null;
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const allowedAdminEmail = getAllowedAdminEmail();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const userEmail = getUserEmail(user);

  if (!userEmail || userEmail !== allowedAdminEmail) {
    return null;
  }

  return {
    user,
    email: userEmail
  };
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function redirectAdminAwayFromLogin() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/admin");
  }
}