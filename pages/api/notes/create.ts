import type { NextApiRequest, NextApiResponse } from "next";

import { getSession, getSessionToken } from "@/lib/auth";
import { addNoteForSession } from "@/lib/note-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const sessionToken = getSessionToken(req.headers.cookie);
  const session = getSession(sessionToken);

  if (!sessionToken || !session) {
    return res.redirect(302, "/login");
  }

  const nextNote = addNoteForSession(
    sessionToken,
    req.body.title,
    req.body.content
  );

  return res.redirect(302, `/notes?note=${encodeURIComponent(nextNote.id)}`);
}
