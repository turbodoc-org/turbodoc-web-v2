import { describe, expect, it } from "vite-plus/test";
import type { Note } from "@/lib/types";
import { shouldAutoSaveNote } from "./note-autosave";

const restoredNote: Note = {
  id: "note-1",
  user_id: "user-1",
  title: "Restored title",
  content: "Restored content",
  tags: null,
  version: 3,
  head_revision_id: "revision-3",
  created_at: "2026-07-13T00:00:00Z",
  updated_at: "2026-07-13T01:00:00Z",
};

describe("note autosave restore guard", () => {
  it("rejects a stale debounced draft captured before a restore", () => {
    expect(
      shouldAutoSaveNote({
        note: restoredNote,
        title: "Current title",
        content: "Current content",
        tags: "",
        restoring: false,
        documentEpoch: 1,
        debouncedDocumentEpoch: 0,
      }),
    ).toBe(false);
  });

  it("allows a new edit after the restored draft has caught up", () => {
    expect(
      shouldAutoSaveNote({
        note: restoredNote,
        title: restoredNote.title,
        content: "Edited after restore",
        tags: "",
        restoring: false,
        documentEpoch: 1,
        debouncedDocumentEpoch: 1,
      }),
    ).toBe(true);
  });
});
