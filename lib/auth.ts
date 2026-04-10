import { createHash, randomBytes, timingSafeEqual } from "crypto";

import { sanitizeEmail } from "./sanitize";

type SessionRecord = {
  createdAt: number;
  email: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __browserNotesSessions: Map<string, SessionRecord> | undefined;
}

const DEMO_EMAIL = "demo@browsernotes.app";
const DEMO_PASSWORD_HASH =
  "bc125818ce8b460ab6b51407c156c5f064798ed74467bfdfda3c8d0f4f0567c1";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export const SESSION_COOKIE_NAME = "browser_notes_session";

const sessions =
  globalThis.__browserNotesSessions ?? new Map<string, SessionRecord>();

if (!globalThis.__browserNotesSessions) {
  globalThis.__browserNotesSessions = sessions;
}

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function parseCookies(cookieHeader?: string) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((accumulator, item) => {
    const [key, ...valueParts] = item.trim().split("=");

    if (!key) {
      return accumulator;
    }

    accumulator[key] = decodeURIComponent(valueParts.join("="));
    return accumulator;
  }, {});
}

export function getSessionToken(cookieHeader?: string) {
  return parseCookies(cookieHeader)[SESSION_COOKIE_NAME];
}

export function getSession(token?: string | null) {
  if (!token) {
    return null;
  }

  const session = sessions.get(token);

  if (!session) {
    return null;
  }

  const hasExpired =
    Date.now() - session.createdAt > SESSION_TTL_SECONDS * 1000;

  if (hasExpired) {
    sessions.delete(token);
    return null;
  }

  return session;
}

export function isAuthenticated(cookieHeader?: string) {
  const token = getSessionToken(cookieHeader);
  return Boolean(getSession(token));
}

export function validateCredentials(email: unknown, password: unknown) {
  const sanitizedEmail = sanitizeEmail(email);
  const passwordValue = typeof password === "string" ? password : "";

  return (
    safeEqual(sanitizedEmail, DEMO_EMAIL) &&
    safeEqual(hashPassword(passwordValue), DEMO_PASSWORD_HASH)
  );
}

export function createSession(email: string) {
  const token = randomBytes(32).toString("hex");

  sessions.set(token, {
    createdAt: Date.now(),
    email,
  });

  return token;
}

export function destroySession(token?: string | null) {
  if (!token) {
    return;
  }

  sessions.delete(token);
}

export function createSessionCookie(token: string) {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secureFlag}`;
}

export function clearSessionCookie() {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;
}
