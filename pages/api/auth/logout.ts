import type { NextApiRequest, NextApiResponse } from "next";

import { clearSessionCookie, destroySession, getSessionToken } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const sessionToken = getSessionToken(req.headers.cookie);
  destroySession(sessionToken);
  res.setHeader("Set-Cookie", clearSessionCookie());
  return res.redirect(302, "/login");
}
