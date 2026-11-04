import { NoteEditor } from '@/components/note/note-editor';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/note/$noteId')({
  ssr: false,
  component: NoteEditorPage,
});

function NoteEditorPage() {
  const params = Route.useParams();
  // One editor per note, so unsaved edits and sync state never cross notes.
  return <NoteEditor key={params.noteId} noteId={params.noteId} />;
}
