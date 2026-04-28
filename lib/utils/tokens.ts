// lib/utils/tokens.ts

import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const manageTokenByteLength = 32;
const manageTokenEncoding = "base64url";

function getTokenHashSecret(): string {
  const tokenHashSecret = process.env.TOKEN_HASH_SECRET;

  if (!tokenHashSecret) {
    throw new Error("Missing TOKEN_HASH_SECRET environment variable.");
  }

  if (tokenHashSecret.length < 32) {
    throw new Error("TOKEN_HASH_SECRET must be at least 32 characters long.");
  }

  return tokenHashSecret;
}

export function generateManageToken(): string {
  return randomBytes(manageTokenByteLength).toString(manageTokenEncoding);
}

export function hashManageToken(token: string): string {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    throw new Error("Cannot hash an empty manage token.");
  }

  return createHmac("sha256", getTokenHashSecret())
    .update(trimmedToken)
    .digest("hex");
}

export function verifyManageToken({
  token,
  expectedHash
}: {
  token: string;
  expectedHash: string;
}): boolean {
  const actualHash = hashManageToken(token);

  const actualBuffer = Buffer.from(actualHash, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function buildManageUrl({
  appUrl,
  token
}: {
  appUrl: string;
  token: string;
}): string {
  const normalizedAppUrl = appUrl.replace(/\/+$/, "");

  return `${normalizedAppUrl}/manage/${encodeURIComponent(token)}`;
}