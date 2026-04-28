// lib/utils/security.ts

import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";

function getHashSecret(): string {
  const tokenHashSecret = process.env.TOKEN_HASH_SECRET;

  if (!tokenHashSecret) {
    throw new Error("Missing TOKEN_HASH_SECRET environment variable.");
  }

  if (tokenHashSecret.length < 32) {
    throw new Error("TOKEN_HASH_SECRET must be at least 32 characters long.");
  }

  return tokenHashSecret;
}

function normalizeIpAddress(ipAddress: string): string {
  return ipAddress.trim().toLowerCase();
}

export function hashIpAddress(ipAddress: string): string {
  const normalizedIpAddress = normalizeIpAddress(ipAddress);

  if (!normalizedIpAddress) {
    throw new Error("Cannot hash an empty IP address.");
  }

  return createHmac("sha256", getHashSecret())
    .update(normalizedIpAddress)
    .digest("hex");
}

function getFirstForwardedIp(value: string): string | null {
  const firstIp = value.split(",")[0]?.trim();

  return firstIp ? firstIp : null;
}

export async function getRequestIpAddress(): Promise<string | null> {
  const headerStore = await headers();

  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return getFirstForwardedIp(forwardedFor);
  }

  const realIp = headerStore.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const vercelForwardedFor = headerStore.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return getFirstForwardedIp(vercelForwardedFor);
  }

  return null;
}

export async function getRequestIpHash(): Promise<string | null> {
  const ipAddress = await getRequestIpAddress();

  if (!ipAddress) {
    return null;
  }

  return hashIpAddress(ipAddress);
}