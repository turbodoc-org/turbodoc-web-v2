"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DocumentRevision, Note } from "@/lib/types";
import { deleteNote, getNote, restoreDocumentRevision, saveNoteDocument } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useLiveNote } from "@/lib/hooks/use-live-note";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, Loader2, Clock, StickyNote, PencilLine } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MDXEditorWrapper } from "./mdx-editor-wrapper";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { NoteHistory } from "./note-history";
import { preserveSourceFormatting } from "./preserve-formatting";
import {
  afterSave,
  draftOf,
  hasUnsyncedEdits,
  onRemoteNote,
  syncedFrom,
  type NoteDraft,
  type SyncDecision,
  type SyncedState,
} from "./note-sync";

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<MDXEditorMethods>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  // Last markdown the editor itself reported (its own serialisation).
  const contentRef = useRef("");
  // Stored markdown last loaded into the editor, and the editor's serialisation
  // of it. Edits are mapped back onto `source` so lines the user did not touch
  // keep their original formatting (see preserve-formatting.ts).
  const baselineRef = useRef<{ source: string; loaded: string | null }>({
    source: "",
    loaded: null,
  });
  // Editor state as of the last keystroke (state updates lag behind).
  const latestRef = useRef<NoteDraft>({ title: "", content: "", tags: "" });
  // Last document agreed with the server, and the revision that holds it.
  const syncedRef = useRef<SyncedState | null>(null);
  const loadedNoteIdRef = useRef<string | null>(null);
  const pendingSaveRef = useRef<Promise<void> | null>(null);
  const restoringRef = useRef(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  // Bumped after each successful save, so edits typed meanwhile are saved next.
  const [saveCount, setSaveCount] = useState(0);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  // Debounced values for auto-save
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTags = useDebounce(tags, 1000);

  useLayoutEffect(() => {
    const titleElement = titleRef.current;
    if (!titleElement) return;

    titleElement.style.height = "auto";
    titleElement.style.height = `${titleElement.scrollHeight}px`;
  }, [title]);

  // Fetch note with React Query
  const {
    data: note,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => getNote(noteId),
    retry: 1,
  });
  useLiveNote(noteId);

  const cacheNote = (saved: Note) => {
    queryClient.setQueryData(["note", noteId], saved);
    queryClient.setQueryData<Note[]>(["notes"], (old = []) =>
      old.map((n) => (n.id === noteId ? saved : n)),
    );
  };

  /** Replace the editor contents, e.g. with a merged or remote document. */
  const loadDraft = (draft: NoteDraft) => {
    const previousContent = latestRef.current.content;
    latestRef.current = draft;
    setTitle(draft.title);
    setTags(draft.tags);
    setContent(draft.content);
    if (draft.content !== previousContent || baselineRef.current.source !== draft.content) {
      const baseline = { source: draft.content, loaded: null as string | null };
      baselineRef.current = baseline;
      contentRef.current = draft.content;
      editorRef.current?.setMarkdown(draft.content);
      // setMarkdown commits in a microtask and emits no change event. Read the
      // editor's serialisation once it has, before the user can type.
      setTimeout(() => {
        if (baselineRef.current !== baseline || !editorRef.current) return;
        baseline.loaded = editorRef.current.getMarkdown();
        contentRef.current = baseline.loaded;
      }, 0);
    }
  };

  const applyDecision = (decision: SyncDecision) => {
    syncedRef.current = decision.synced;
    if (decision.adopt) loadDraft(decision.adopt);
    setHasChanges(hasUnsyncedEdits(latestRef.current, decision.synced));
  };

  // Load the note, then take newer server versions (window refocus, live
  // updates) whenever the editor has nothing unsaved.
  useEffect(() => {
    if (!note) return;
    if (loadedNoteIdRef.current !== note.id || !syncedRef.current) {
      loadedNoteIdRef.current = note.id;
      syncedRef.current = syncedFrom(note);
      loadDraft(draftOf(note));
      setHasChanges(false);
      setLastSaved(new Date());
      return;
    }
    const decision = onRemoteNote(
      note,
      syncedRef.current,
      latestRef.current,
      pendingSaveRef.current !== null || restoringRef.current,
    );
    if (decision) applyDecision(decision);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  // Navigate away if note fails to load
  useEffect(() => {
    if (isError) {
      console.error("Failed to load note");
      navigate({ to: "/notes" });
    }
  }, [isError, navigate]);

  /** Save unsynced edits. One save at a time; later edits go in the next one. */
  const save = async () => {
    const synced = syncedRef.current;
    if (!synced || pendingSaveRef.current || restoringRef.current) return;
    const sent = latestRef.current;
    if (!hasUnsyncedEdits(sent, synced)) return;

    const run = (async () => {
      setAutoSaving(true);
      try {
        const result = await saveNoteDocument(noteId, sent, synced.revisionId);
        applyDecision(afterSave(sent, latestRef.current, result));
        cacheNote(result.note);
        setLastSaved(new Date());
        if (result.conflicts > 0) {
          toast.warning("This note was also edited on another device", {
            description:
              "Where you both changed the same passage, both versions were kept. Review the note and remove the one you don't want.",
          });
        }
        setSaveCount((count) => count + 1);
      } catch (error) {
        // Edits stay unsynced and are retried with the next change.
        console.error("Failed to auto-save note:", error);
      } finally {
        pendingSaveRef.current = null;
        setAutoSaving(false);
      }
    })();
    pendingSaveRef.current = run;
    await run;
  };

  // Auto-save once typing pauses, and again after a save if typing continued.
  useEffect(() => {
    void save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle, debouncedContent, debouncedTags, saveCount]);

  // Leaving the editor: save anything typed within the debounce window, then
  // refresh the notes list.
  useEffect(() => {
    return () => {
      const flush = async () => {
        await pendingSaveRef.current;
        const synced = syncedRef.current;
        const latest = latestRef.current;
        if (synced && !restoringRef.current && hasUnsyncedEdits(latest, synced)) {
          await saveNoteDocument(noteId, latest, synced.revisionId);
        }
      };
      void flush()
        .catch((error) => console.error("Failed to save note on close:", error))
        .finally(() => queryClient.invalidateQueries({ queryKey: ["notes"] }));
    };
  }, [noteId, queryClient]);

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: () => deleteNote(noteId),
    onSuccess: () => {
      queryClient.setQueryData<Note[]>(["notes"], (old = []) => old.filter((n) => n.id !== noteId));
      console.log("Note deleted successfully");
      navigate({ to: "/notes" });
    },
  });

  const handleRestore = async (revision: DocumentRevision): Promise<Note> => {
    restoringRef.current = true;

    try {
      // A restore must be the last write. Wait for any save already sent.
      await pendingSaveRef.current;

      // Keep edits that had not been saved yet as their own revision first.
      const synced = syncedRef.current;
      if (synced && hasUnsyncedEdits(latestRef.current, synced)) {
        const result = await saveNoteDocument(noteId, latestRef.current, synced.revisionId);
        cacheNote(result.note);
      }

      const restored = await restoreDocumentRevision(noteId, revision.id);
      applyDecision({ synced: syncedFrom(restored), adopt: draftOf(restored) });
      cacheNote(restored);
      setLastSaved(new Date());

      return restored;
    } finally {
      restoringRef.current = false;
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    try {
      await deleteNoteMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to delete note:", error);
      console.error("Failed to delete note");
    }
  };

  const handleTitleChange = (value: string) => {
    latestRef.current = { ...latestRef.current, title: value };
    setTitle(value);
    setHasChanges(true);
  };

  const handleContentChange = (value: string, initialNormalize?: boolean) => {
    if (value === contentRef.current) return;
    contentRef.current = value;
    if (initialNormalize) {
      // The editor's first serialisation of what it was given, not an edit.
      if (baselineRef.current.loaded === null) baselineRef.current.loaded = value;
      return;
    }
    const { source, loaded } = baselineRef.current;
    const stored = loaded === null ? value : preserveSourceFormatting(source, loaded, value);
    if (stored === latestRef.current.content) return;
    latestRef.current = { ...latestRef.current, content: stored };
    setContent(stored);
    setHasChanges(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading note...
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Note not found</h2>
          <p className="text-muted-foreground mb-4">
            The note you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button asChild>
            <Link to="/notes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor-page min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center h-16 px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
            >
              <Link to="/notes" aria-label="Back to notes">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="hidden min-w-0 items-center gap-2 sm:flex">
              <StickyNote className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-medium text-foreground/80 max-w-[18rem] lg:max-w-[30rem]">
                {title || "Untitled Note"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Updated {formatDate(note.updated_at)}</span>
            </div>
            <div
              className="inline-flex h-7 items-center rounded-full border border-border/70 bg-muted/40 px-2.5 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {autoSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Saving
                </>
              ) : hasChanges ? (
                "Unsaved"
              ) : lastSaved ? (
                <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
              ) : (
                "Ready"
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground"
              onClick={() => setShowHistory(true)}
              aria-label="Version history"
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteNoteMutation.isPending}
              className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      {showHistory ? (
        <NoteHistory note={note} onClose={() => setShowHistory(false)} onRestore={handleRestore} />
      ) : null}

      {/* Editor Content */}
      <main className="flex-1 w-full">
        <article className="note-writing-surface mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14 md:pt-20">
          {/* Title Input */}
          <div className="group relative mb-4">
            <label htmlFor="title" className="sr-only">
              Note title
            </label>
            <textarea
              ref={titleRef}
              id="title"
              rows={1}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled"
              className="note-title-field block w-full resize-none overflow-hidden rounded-xl border border-transparent bg-transparent py-2 px-4 pr-10 text-3xl font-semibold leading-[1.15] tracking-[-0.035em] text-foreground outline-none transition-colors placeholder:text-muted-foreground/45 hover:bg-muted/25 focus:border-border/60 focus:bg-muted/20 sm:text-4xl"
            />
            <PencilLine
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-4 h-4 w-4 text-muted-foreground opacity-40 transition-opacity sm:opacity-0 sm:group-hover:opacity-50 sm:group-focus-within:opacity-70"
            />
          </div>

          {/* Content Editor */}
          <div className="note-body-editor">
            <MDXEditorWrapper
              key={noteId}
              ref={editorRef}
              markdown={content}
              onChange={handleContentChange}
              className="note-editor-mdx"
              placeholder="Start writing, or type # for a heading…"
              showToolbar
            />
          </div>
        </article>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{title || "this note"}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteNoteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteNoteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
