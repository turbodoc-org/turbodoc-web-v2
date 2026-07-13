"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DocumentRevision, Note } from "@/lib/types";
import { deleteNote, getNote, restoreDocumentRevision, updateNote } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
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
import { shouldAutoSaveNote } from "./note-autosave";
import { NoteHistory } from "./note-history";

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<MDXEditorMethods>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef("");
  const pendingSaveRef = useRef<Promise<Note> | null>(null);
  const restoringRef = useRef(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [documentEpoch, setDocumentEpoch] = useState(0);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  // Debounced values for auto-save
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTags = useDebounce(tags, 1000);
  const debouncedDocumentEpoch = useDebounce(documentEpoch, 1000);

  useLayoutEffect(() => {
    const titleElement = titleRef.current;
    if (!titleElement) return;

    titleElement.style.height = "auto";
    titleElement.style.height = `${titleElement.scrollHeight}px`;
  }, [title]);

  // Invalidate notes query when component unmounts to ensure fresh data on notes page
  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    };
  }, [queryClient]);

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

  // Initialize form when note loads
  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      contentRef.current = note.content || "";
      setTags(note.tags || "");
      setLastSaved(new Date());

      // Update editor content via ref if it exists and content changed
      if (editorRef.current && note.content !== content) {
        editorRef.current.setMarkdown(note.content || "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]); // Only run when note ID changes (new note loaded)

  // Navigate away if note fails to load
  useEffect(() => {
    if (isError) {
      console.error("Failed to load note");
      navigate({ to: "/notes" });
    }
  }, [isError, navigate]);

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: (data: Partial<Note>) => updateNote(noteId, data),
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(["note", noteId], updatedNote);
      queryClient.setQueryData<Note[]>(["notes"], (old = []) =>
        old.map((n) => (n.id === noteId ? updatedNote : n)),
      );
      setHasChanges(false);
      setLastSaved(new Date());
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: () => deleteNote(noteId),
    onSuccess: () => {
      queryClient.setQueryData<Note[]>(["notes"], (old = []) => old.filter((n) => n.id !== noteId));
      console.log("Note deleted successfully");
      navigate({ to: "/notes" });
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (!note) return;

    if (
      shouldAutoSaveNote({
        note,
        title: debouncedTitle,
        content: debouncedContent,
        tags: debouncedTags,
        restoring: restoringRef.current,
        documentEpoch,
        debouncedDocumentEpoch,
      })
    ) {
      const autoSave = async () => {
        let savePromise: Promise<Note> | null = null;
        try {
          setAutoSaving(true);
          savePromise = updateNoteMutation.mutateAsync({
            title: debouncedTitle || undefined,
            content: debouncedContent || undefined,
            tags: debouncedTags || null,
            head_revision_id: note.head_revision_id,
          });
          pendingSaveRef.current = savePromise;
          await savePromise;
        } catch (error) {
          console.error("Failed to auto-save note:", error);
        } finally {
          if (pendingSaveRef.current === savePromise) pendingSaveRef.current = null;
          setAutoSaving(false);
        }
      };

      autoSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedTitle,
    debouncedContent,
    debouncedTags,
    debouncedDocumentEpoch,
    documentEpoch,
    note?.title,
    note?.content,
    note?.tags,
  ]);

  const handleRestore = async (revision: DocumentRevision): Promise<Note> => {
    restoringRef.current = true;

    try {
      // A restore must be the last write. Wait for any auto-save that was
      // already sent before creating the restored head revision.
      await pendingSaveRef.current;

      // Preserve edits that have not reached the debounce yet as their own
      // revision before restoring the selected historical version.
      const currentNote = queryClient.getQueryData<Note>(["note", noteId]) ?? note;
      const hasUnsavedDraft =
        currentNote &&
        (title !== (currentNote.title || "") ||
          content !== (currentNote.content || "") ||
          tags !== (currentNote.tags || ""));

      if (currentNote && hasUnsavedDraft) {
        await updateNoteMutation.mutateAsync({
          title: title || undefined,
          content,
          tags: tags || null,
          head_revision_id: currentNote.head_revision_id,
        });
      }

      const restored = await restoreDocumentRevision(noteId, revision.id);

      // Invalidate every debounced snapshot captured before the restore, then
      // make the restored server document the editor's new local baseline.
      setDocumentEpoch((epoch) => epoch + 1);
      setTitle(restored.title || "");
      setContent(restored.content || "");
      contentRef.current = restored.content || "";
      setTags(restored.tags || "");
      editorRef.current?.setMarkdown(restored.content || "");
      queryClient.setQueryData(["note", noteId], restored);
      queryClient.setQueryData<Note[]>(["notes"], (old = []) =>
        old.map((item) => (item.id === noteId ? restored : item)),
      );
      setHasChanges(false);
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
    setTitle(value);
    setHasChanges(true);
  };

  const handleContentChange = (value: string) => {
    // The editor also emits changes for programmatic setMarkdown calls. Keep a
    // synchronous ref so applying a restore is not marked as a fresh user edit.
    if (value !== contentRef.current) {
      contentRef.current = value;
      setContent(value);
      setHasChanges(true);
    }
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
