import type { NextApiRequest, NextApiResponse } from "next";

import {
  createSession,
  createSessionCookie,
  validateCredentials,
} from "@/lib/auth";
import { sanitizeEmail } from "@/lib/sanitize";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { email, password } = req.body;

  if (!validateCredentials(email, password)) {
    return res.redirect(302, "/login?error=invalid_credentials");
  }

  const sanitizedEmail = sanitizeEmail(email);
  const sessionToken = createSession(sanitizedEmail);

  res.setHeader("Set-Cookie", createSessionCookie(sessionToken));
  return res.redirect(302, "/notes");
}
