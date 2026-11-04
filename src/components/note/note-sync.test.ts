import { describe, expect, it } from "vitest";
import type { Note } from "@/lib/types";
import { afterSave, draftOf, hasUnsyncedEdits, onRemoteNote, syncedFrom } from "./note-sync";

const note = (overrides: Partial<Note> = {}): Note => ({
  id: "n1",
  user_id: "u1",
  title: "Plan",
  content: "intro",
  tags: null,
  version: 1,
  head_revision_id: "r1",
  created_at: null,
  updated_at: null,
  ...overrides,
});

describe("afterSave", () => {
  it("adopts the merged document when nothing was typed during the save", () => {
    const sent = { title: "Plan", content: "intro + laptop", tags: "" };
    const merged = note({ content: "intro + phone + laptop", version: 3, head_revision_id: "r3" });
    const decision = afterSave(sent, sent, { note: merged, submittedRevisionId: "s1" });
    expect(decision.adopt).toEqual(draftOf(merged));
    expect(decision.synced).toMatchObject({ revisionId: "r3", version: 3 });
  });

  it("does not reload the editor when the server kept exactly what was sent", () => {
    const sent = { title: "Plan", content: "intro!", tags: "" };
    const saved = note({ content: "intro!", version: 2, head_revision_id: "r2" });
    expect(afterSave(sent, sent, { note: saved, submittedRevisionId: "r2" }).adopt).toBeNull();
  });

  it("rebases on the submitted snapshot when typing continued during the save", () => {
    const sent = { title: "Plan", content: "intro + laptop", tags: "" };
    const latest = { ...sent, content: "intro + laptop, more" };
    const merged = note({ content: "intro + phone + laptop", version: 3, head_revision_id: "r3" });
    const decision = afterSave(sent, latest, { note: merged, submittedRevisionId: "s1" });
    expect(decision.adopt).toBeNull();
    expect(decision.synced).toEqual({ ...sent, revisionId: "s1", version: 3 });
    // The newer typing is still unsynced, so it is saved next on top of s1.
    expect(hasUnsyncedEdits(latest, decision.synced)).toBe(true);
  });
});

describe("onRemoteNote", () => {
  const synced = syncedFrom(note());

  it("loads a newer remote version when the editor is idle", () => {
    const remote = note({ content: "edited on phone", version: 2, head_revision_id: "r2" });
    const decision = onRemoteNote(remote, synced, draftOf(note()), false);
    expect(decision?.adopt?.content).toBe("edited on phone");
    expect(decision?.synced.revisionId).toBe("r2");
  });

  it("keeps the base when there are unsaved edits, so the next save merges", () => {
    // Regression: refocusing the tab used to move the base to the new head
    // while keeping the old text, so the next autosave reverted the phone edit.
    const remote = note({ content: "edited on phone", version: 2, head_revision_id: "r2" });
    const typing = { ...draftOf(note()), content: "intro, typed on laptop" };
    expect(onRemoteNote(remote, synced, typing, false)).toBeNull();
  });

  it("waits while a save is in flight", () => {
    const remote = note({ content: "edited on phone", version: 2, head_revision_id: "r2" });
    expect(onRemoteNote(remote, synced, draftOf(note()), true)).toBeNull();
  });

  it("ignores server data older than what the editor has seen", () => {
    const current = syncedFrom(note({ content: "v3", version: 3, head_revision_id: "r3" }));
    const lateRefetch = note({ content: "v2", version: 2, head_revision_id: "r2" });
    expect(onRemoteNote(lateRefetch, current, draftOf(current), false)).toBeNull();
  });
});
