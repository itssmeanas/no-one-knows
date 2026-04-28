// lib/utils/session.ts

const anonymousSessionStorageKey = "no_one_knows_anonymous_session_id";
const anonymousSessionCookieName = "nok_session";
const anonymousSessionByteLength = 24;

function generateAnonymousSessionId(): string {
  const values = new Uint8Array(anonymousSessionByteLength);
  globalThis.crypto.getRandomValues(values);

  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function isValidAnonymousSessionId(value: string): boolean {
  return /^[a-f0-9]{48}$/.test(value);
}

function readSessionFromLocalStorage(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const storedValue = window.localStorage.getItem(anonymousSessionStorageKey);

  if (!storedValue || !isValidAnonymousSessionId(storedValue)) {
    return null;
  }

  return storedValue;
}

function writeSessionToLocalStorage(sessionId: string): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(anonymousSessionStorageKey, sessionId);
}

function readSessionFromCookie(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${anonymousSessionCookieName}=`));

  if (!cookie) {
    return null;
  }

  const value = decodeURIComponent(cookie.split("=")[1] ?? "");

  if (!isValidAnonymousSessionId(value)) {
    return null;
  }

  return value;
}

function writeSessionToCookie(sessionId: string): void {
  if (!isBrowser()) {
    return;
  }

  const maxAge = 60 * 60 * 24 * 365;

  document.cookie = [
    `${anonymousSessionCookieName}=${encodeURIComponent(sessionId)}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "SameSite=Lax",
    "Secure"
  ].join("; ");
}

export function getAnonymousSessionId(): string {
  const existingSession =
    readSessionFromLocalStorage() ?? readSessionFromCookie();

  if (existingSession) {
    writeSessionToLocalStorage(existingSession);
    writeSessionToCookie(existingSession);

    return existingSession;
  }

  const sessionId = generateAnonymousSessionId();

  writeSessionToLocalStorage(sessionId);
  writeSessionToCookie(sessionId);

  return sessionId;
}

export function getAnonymousSessionCookieName(): string {
  return anonymousSessionCookieName;
}