import type { GetServerSideProps } from "next";

import NotesDashboard from "@/components/notes-dashboard";
import { getSession, getSessionToken } from "@/lib/auth";
import { getNotesForSession, type ServerNote } from "@/lib/note-store";

type NotesPageProps = {
  email: string;
  notes: ServerNote[];
  selectedNoteId: string | null;
};

export default function NotesPage({
  email,
  notes,
  selectedNoteId,
}: NotesPageProps) {
  return (
    <NotesDashboard
      email={email}
      notes={notes}
      initialSelectedNoteId={selectedNoteId}
    />
  );
}

export const getServerSideProps: GetServerSideProps<NotesPageProps> = async ({
  query,
  req,
}) => {
  const sessionToken = getSessionToken(req.headers.cookie);
  const session = getSession(sessionToken);
  const selectedNoteId =
    typeof query.note === "string" ? query.note : null;

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
      selectedNoteId,
    },
  };
};
