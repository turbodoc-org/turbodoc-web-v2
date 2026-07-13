import type { Note } from "@/lib/types";

interface AutosaveState {
  note: Note | undefined;
  title: string;
  content: string;
  tags: string;
  restoring: boolean;
  documentEpoch: number;
  debouncedDocumentEpoch: number;
}

export function shouldAutoSaveNote({
  note,
  title,
  content,
  tags,
  restoring,
  documentEpoch,
  debouncedDocumentEpoch,
}: AutosaveState): boolean {
  if (!note || restoring || debouncedDocumentEpoch !== documentEpoch) return false;

  const hasDataChanges =
    title !== (note.title || "") || content !== (note.content || "") || tags !== (note.tags || "");

  return hasDataChanges && Boolean(title || content || tags);
}
