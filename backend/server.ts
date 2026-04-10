import express from "express";
import next from "next";

import {
  clearSessionCookie,
  createSession,
  createSessionCookie,
  destroySession,
  getSession,
  getSessionToken,
  validateCredentials,
} from "../lib/auth";
import { addNoteForSession } from "../lib/note-store";
import { sanitizeEmail } from "../lib/sanitize";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);
const app = next({ dev });
const handle = app.getRequestHandler();

async function startServer() {
  await app.prepare();

  const server = express();

  server.disable("x-powered-by");
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());

  server.post("/auth/login", (req, res) => {
    const { email, password } = req.body ?? {};

    if (!validateCredentials(email, password)) {
      return res.redirect("/login?error=invalid_credentials");
    }

    const sanitizedEmail = sanitizeEmail(email);
    const sessionToken = createSession(sanitizedEmail);

    res.setHeader("Set-Cookie", createSessionCookie(sessionToken));
    return res.redirect("/notes");
  });

  server.post("/auth/logout", (req, res) => {
    const sessionToken = getSessionToken(req.headers.cookie);

    if (sessionToken) {
      destroySession(sessionToken);
      res.setHeader("Set-Cookie", clearSessionCookie());
    }

    return res.redirect("/login");
  });

  server.post("/notes/create", (req, res) => {
    const sessionToken = getSessionToken(req.headers.cookie);
    const session = getSession(sessionToken);

    if (!sessionToken || !session) {
      return res.redirect("/login");
    }

    const nextNote = addNoteForSession(
      sessionToken,
      req.body?.title,
      req.body?.content
    );

    return res.redirect(`/notes?note=${encodeURIComponent(nextNote.id)}`);
  });

  server.all(/(.*)/, (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`> Express server ready on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start Express server", error);
  process.exit(1);
});
