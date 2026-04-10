"use client";

import { GripVertical } from "lucide-react";
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";

import { type ServerNote } from "@/lib/note-store";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type NotesDashboardProps = {
  email: string;
  initialSelectedNoteId?: string | null;
  notes: ServerNote[];
};

const PANEL_WIDTH_STORAGE_KEY = "browser-notes-panel-width";
const MIN_LEFT_PANEL_WIDTH = 320;
const MIN_RIGHT_PANEL_WIDTH = 360;

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function NotesDashboard({
  email,
  initialSelectedNoteId,
  notes,
}: NotesDashboardProps) {
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState(
    initialSelectedNoteId ?? notes[0]?.id ?? null
  );
  const [leftPanelWidth, setLeftPanelWidth] = useState(420);

  useEffect(() => {
    const nextSelectedNoteId =
      initialSelectedNoteId && notes.some((note) => note.id === initialSelectedNoteId)
        ? initialSelectedNoteId
        : notes[0]?.id ?? null;

    setSelectedNoteId(nextSelectedNoteId);
  }, [initialSelectedNoteId, notes]);

  useEffect(() => {
    const savedWidth = window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);

    if (!savedWidth) {
      return;
    }

    const parsedWidth = Number(savedWidth);

    if (!Number.isNaN(parsedWidth)) {
      setLeftPanelWidth(parsedWidth);
    }
  }, []);

  const clampPanelWidth = (nextWidth: number) => {
    const containerWidth = layoutRef.current?.clientWidth ?? 0;

    if (!containerWidth) {
      return Math.max(MIN_LEFT_PANEL_WIDTH, nextWidth);
    }

    const maxWidth = Math.max(
      MIN_LEFT_PANEL_WIDTH,
      containerWidth - MIN_RIGHT_PANEL_WIDTH
    );

    return Math.min(Math.max(nextWidth, MIN_LEFT_PANEL_WIDTH), maxWidth);
  };

  const handleResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!layoutRef.current || window.innerWidth < 1024) {
      return;
    }

    event.preventDefault();

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!layoutRef.current) {
        return;
      }

      const bounds = layoutRef.current.getBoundingClientRect();
      const nextWidth = clampPanelWidth(moveEvent.clientX - bounds.left);
      setLeftPanelWidth(nextWidth);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.body.style.removeProperty("user-select");
    };

    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  useEffect(() => {
    window.localStorage.setItem(
      PANEL_WIDTH_STORAGE_KEY,
      String(Math.round(leftPanelWidth))
    );
  }, [leftPanelWidth]);

  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))] px-4 py-8 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,1),_rgba(2,6,23,1))]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <header className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Your personal notes
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Your Notes</h1>
            <p className="text-sm text-muted-foreground">
              You are signed in as{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <form action="/auth/logout" method="post">
            <Button type="submit" variant="outline" className="cursor-pointer">
              Logout
            </Button>
          </form>
        </header>

        <section
          ref={layoutRef}
          className="flex flex-col gap-6 lg:flex-row lg:items-stretch"
        >
          <div
            className="space-y-6 lg:shrink-0"
            style={{ width: "100%", maxWidth: `${leftPanelWidth}px` }}
          >
            <Card className="py-0">
              <CardHeader className="px-6 pt-6">
                <CardTitle>Add a note</CardTitle>
                <CardDescription>
                  Write something and save it to see it in your notes list.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form action="/notes/create" method="post" className="space-y-4">
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
                <CardTitle>Saved notes</CardTitle>
                <CardDescription>
                  Click a note to read it on the right.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                {notes.map((note) => {
                  const isActive = note.id === selectedNote?.id;

                  return (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                        isActive
                          ? "border-slate-900 bg-slate-950 text-white"
                          : "border-border/70 bg-background hover:bg-accent dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-semibold">
                            {note.title}
                          </h2>
                          <p
                            className={`mt-2 text-sm leading-6 ${
                              isActive ? "text-slate-300" : "text-muted-foreground"
                            }`}
                          >
                            {note.content.slice(0, 90)}
                            {note.content.length > 90 ? "..." : ""}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-xs ${
                            isActive ? "text-slate-400" : "text-muted-foreground"
                          }`}
                        >
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <button
            type="button"
            onPointerDown={handleResizeStart}
            className="relative hidden lg:flex lg:w-4 lg:shrink-0 lg:cursor-col-resize lg:items-center lg:justify-center"
            aria-label="Resize notes panels"
            title="Drag to resize"
          >
            <span className="flex h-full w-px bg-border" />
            <span className="absolute rounded-full border border-border bg-background p-1 shadow-sm">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </span>
          </button>

          <Card className="min-w-0 py-0 lg:flex-1">
            <CardHeader className="px-6 pt-6">
              <CardTitle>{selectedNote?.title ?? "No note selected"}</CardTitle>
              <CardDescription>
                {selectedNote
                  ? `Saved on ${formatDate(selectedNote.createdAt)}`
                  : "Add your first note to get started."}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {selectedNote ? (
                <div className="min-h-[26rem] whitespace-pre-wrap rounded-2xl border border-border/70 bg-background p-5 text-sm leading-7 text-foreground">
                  {selectedNote.content}
                </div>
              ) : (
                <div className="flex min-h-[26rem] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background p-5 text-sm text-muted-foreground">
                  Select a note from the list to read it here.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
