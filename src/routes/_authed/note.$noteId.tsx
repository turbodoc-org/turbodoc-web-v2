import { NoteEditor } from '@/components/note-editor';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/note/$noteId')({
  ssr: false,
  component: NoteEditorPage,
});

function NoteEditorPage() {
  const params = Route.useParams();
  return <NoteEditor noteId={params.noteId} />;
}
