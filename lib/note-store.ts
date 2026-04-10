import { sanitizeMultilineText, sanitizeText } from "@/lib/sanitize";

export type ServerNote = {
  content: string;
  createdAt: string;
  id: string;
  title: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __browserNotesStore: Map<string, ServerNote[]> | undefined;
}

const initialNotes = [
  {
    content: "Review the browser extension checklist before Friday.",
    title: "Launch checklist",
  },
  {
    content: "Capture quick product ideas and follow-up questions from testing.",
    title: "Research notes",
  },
];

const noteStore =
  globalThis.__browserNotesStore ?? new Map<string, ServerNote[]>();

if (!globalThis.__browserNotesStore) {
  globalThis.__browserNotesStore = noteStore;
}

function createNote(title: string, content: string): ServerNote {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    content,
    createdAt: new Date().toISOString(),
  };
}

function createSeedNotes() {
  return initialNotes.map((note) => createNote(note.title, note.content));
}

export function getNotesForSession(sessionToken: string) {
  const existingNotes = noteStore.get(sessionToken);

  if (existingNotes) {
    return existingNotes;
  }

  const seededNotes = createSeedNotes();
  noteStore.set(sessionToken, seededNotes);
  return seededNotes;
}

export function addNoteForSession(
  sessionToken: string,
  rawTitle: unknown,
  rawContent: unknown
) {
  const title = sanitizeText(rawTitle, 80) || "Untitled note";
  const content = sanitizeMultilineText(rawContent, 600) || "New note";
  const nextNote = createNote(title, content);
  const notes = getNotesForSession(sessionToken);

  noteStore.set(sessionToken, [nextNote, ...notes]);
  return nextNote;
}
