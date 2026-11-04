import type { Note } from "@/lib/types";

/**
 * Sync rules for an open note editor.
 *
 * The editor tracks the last document it agreed on with the server: its
 * content and the revision that holds it. Every save sends that revision as
 * `base_revision_id`, so the server merges with anything that changed since.
 * The base only moves to a newer revision when the editor also takes that
 * revision's content. Otherwise the next save would overwrite edits it never
 * saw.
 */

export interface NoteDraft {
  title: string;
  content: string;
  tags: string;
}

export interface SyncedState extends NoteDraft {
  /** Revision holding exactly this draft. Sent as the next save's base. */
  revisionId: string | null;
  /** Server version this state came from. Older server data is ignored. */
  version: number;
}

export interface SaveResponse {
  note: Note;
  /** Revision holding exactly what this save sent (see the API). */
  submittedRevisionId: string | null;
}

export interface SyncDecision {
  synced: SyncedState;
  /** Server draft to load into the editor, or null to keep the editor as is. */
  adopt: NoteDraft | null;
}

export const draftOf = (note: Pick<Note, "title" | "content" | "tags">): NoteDraft => ({
  title: note.title || "",
  content: note.content || "",
  tags: note.tags || "",
});

export const sameDraft = (a: NoteDraft, b: NoteDraft) =>
  a.title === b.title && a.content === b.content && a.tags === b.tags;

export const syncedFrom = (note: Note): SyncedState => ({
  ...draftOf(note),
  revisionId: note.head_revision_id ?? null,
  version: note.version,
});

/** True when the editor holds edits the server has not received. */
export const hasUnsyncedEdits = (latest: NoteDraft, synced: SyncedState | null) =>
  synced !== null && !sameDraft(latest, synced);

/**
 * After a save returns. If nothing was typed while it was in flight, take the
 * server's (possibly merged) document. Otherwise keep the editor as is and
 * rebase on the snapshot that was sent: the next save merges only the newer
 * typing.
 */
export function afterSave(
  sent: NoteDraft,
  latest: NoteDraft,
  response: SaveResponse,
): SyncDecision {
  if (sameDraft(latest, sent)) {
    const server = draftOf(response.note);
    return {
      synced: syncedFrom(response.note),
      adopt: sameDraft(server, latest) ? null : server,
    };
  }
  return {
    synced: {
      ...sent,
      revisionId: response.submittedRevisionId ?? response.note.head_revision_id ?? null,
      version: response.note.version,
    },
    adopt: null,
  };
}

/**
 * When newer server data arrives (refetch, live update). It is loaded only if
 * the editor has no unsaved edits and no save is in flight. Otherwise the
 * pending save merges with it.
 */
export function onRemoteNote(
  remote: Note,
  synced: SyncedState,
  latest: NoteDraft,
  saving: boolean,
): SyncDecision | null {
  if (saving) return null;
  if (remote.version <= synced.version) return null;
  if (remote.head_revision_id && remote.head_revision_id === synced.revisionId) return null;
  if (hasUnsyncedEdits(latest, synced)) return null;
  const server = draftOf(remote);
  return { synced: syncedFrom(remote), adopt: sameDraft(server, latest) ? null : server };
}
