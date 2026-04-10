import type { GetServerSideProps } from "next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSession, getSessionToken } from "@/lib/auth";
import { getNotesForSession, type ServerNote } from "@/lib/note-store";

type NotesPageProps = {
  email: string;
  notes: ServerNote[];
};

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function NotesPage({ email, notes }: NotesPageProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))] px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              SSR Notes Dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Your Notes</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="outline" className="cursor-pointer">
              Logout
            </Button>
          </form>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="py-0">
            <CardHeader className="px-6 pt-6">
              <CardTitle>Add a note</CardTitle>
              <CardDescription>
                This submits to a server route and reloads the page with fresh
                SSR data.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <form action="/api/notes/create" method="post" className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-foreground"
                  >
                    Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Add a note title"
                    maxLength={80}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="content"
                    className="text-sm font-medium text-foreground"
                  >
                    Content
                  </label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write a quick note"
                    className="min-h-32"
                    maxLength={600}
                  />
                </div>
                <Button type="submit" className="cursor-pointer">
                  Add Note
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="py-0">
            <CardHeader className="px-6 pt-6">
              <CardTitle>Mock notes list</CardTitle>
              <CardDescription>
                The initial list is seeded, and new notes are stored per
                authenticated session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              {notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-foreground">
                      {note.title}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {note.content}
                  </p>
                </article>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<NotesPageProps> = async ({
  req,
}) => {
  const sessionToken = getSessionToken(req.headers.cookie);
  const session = getSession(sessionToken);

  if (!sessionToken || !session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      email: session.email,
      notes: getNotesForSession(sessionToken),
    },
  };
};
