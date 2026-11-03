"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Note } from "@/lib/types";
import { NoteCard } from "@/components/note/note-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, StickyNote, FileText } from "lucide-react";
import { ContentCardSkeleton, ContentGrid } from "@/components/shared/content-card";
import {
  collectTags,
  GridEmptyState,
  GridPageHeader,
  GridToolbar,
  NewItemButton,
  NoResults,
  useGridShortcuts,
  usePersistentOption,
} from "@/components/shared/grid-page";
import { MobileFab } from "@/components/shared/module-nav";
import { formatRelativeDate, pluralize, toDate } from "@/lib/format";
import { parseTags } from "@/lib/utils";
import { getNotes, createNote, updateNote } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useNavigate } from "@tanstack/react-router";
import { MDXEditorWrapper } from "@/components/note/mdx-editor-wrapper";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { toast } from "sonner";

type NoteSort = "updated" | "created" | "title";

const NOTE_SORTS: { value: NoteSort; label: string }[] = [
  { value: "updated", label: "Last edited" },
  { value: "created", label: "Created" },
  { value: "title", label: "A–Z" },
];

function timeOf(value: string | null | undefined) {
  return toDate(value)?.getTime() ?? 0;
}

interface NoteGridProps {
  /** Open the "new note" dialog on mount (e.g. arriving from the dashboard's New menu). */
  initialCreateOpen?: boolean;
}

export function NoteGrid({ initialCreateOpen = false }: NoteGridProps = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<MDXEditorMethods>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(initialCreateOpen);
  const [draftNoteId, setDraftNoteId] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sort, setSort] = usePersistentOption<NoteSort>(
    "turbodoc:notes:sort",
    "updated",
    NOTE_SORTS.map((o) => o.value),
  );

  // Debounce search term with 300ms delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
  });

  // Debounced values for auto-save in creation
  const debouncedNewTitle = useDebounce(newNote.title, 800);
  const debouncedNewContent = useDebounce(newNote.content, 800);
  const debouncedNewTags = useDebounce(newNote.tags, 800);

  // Fetch notes with React Query
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      queryClient.setQueryData<Note[]>(["notes"], (old = []) => [newNote, ...old]);
    },
    onError: () => {
      toast.error("Failed to create note");
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) => updateNote(id, data),
    onSuccess: (updatedNote) => {
      queryClient.setQueryData<Note[]>(["notes"], (old = []) =>
        old.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      );
    },
    onError: () => {
      toast.error("Failed to save note");
    },
  });

  const tagOptions = useMemo(() => collectTags(notes.map((note) => parseTags(note.tags))), [notes]);

  // Drop a tag filter that no longer exists (e.g. its last note was deleted).
  useEffect(() => {
    if (selectedTag && !tagOptions.some((t) => t.tag === selectedTag)) setSelectedTag(null);
  }, [selectedTag, tagOptions]);

  // Filter by search term and tag, then sort
  const filteredNotes = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();

    const filtered = notes.filter((note) => {
      if (selectedTag && !parseTags(note.tags).includes(selectedTag)) return false;
      if (!term) return true;
      return (
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term) ||
        (note.tags?.toLowerCase().includes(term) ?? false)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      if (sort === "created") return timeOf(b.created_at) - timeOf(a.created_at);
      return timeOf(b.updated_at ?? b.created_at) - timeOf(a.updated_at ?? a.created_at);
    });
  }, [notes, debouncedSearchTerm, selectedTag, sort]);

  const lastEdited = useMemo(() => {
    const latest = Math.max(0, ...notes.map((n) => timeOf(n.updated_at ?? n.created_at)));
    return latest ? formatRelativeDate(latest) : null;
  }, [notes]);

  // Auto-create draft note when user starts typing
  useEffect(() => {
    if (!isCreateDialogOpen) return;

    // Only consider real content, not just whitespace
    const hasRealContent = debouncedNewTitle.trim() || debouncedNewContent.trim();

    if (!hasRealContent) return;

    if (!draftNoteId) {
      // Create initial draft only if there's actual content
      const createDraft = async () => {
        try {
          const created = await createNoteMutation.mutateAsync({
            title: debouncedNewTitle.trim() || "Untitled Note",
            content: debouncedNewContent || "",
            tags: debouncedNewTags || undefined,
          });
          setDraftNoteId(created.id);
        } catch (error) {
          console.error("Failed to create draft note:", error);
        }
      };
      createDraft();
    } else {
      // Update existing draft
      const updateDraft = async () => {
        try {
          await updateNoteMutation.mutateAsync({
            id: draftNoteId,
            data: {
              title: debouncedNewTitle.trim() || "Untitled Note",
              content: debouncedNewContent || "",
              tags: debouncedNewTags || undefined,
            },
          });
        } catch (error) {
          console.error("Failed to update draft note:", error);
        }
      };
      updateDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedNewTitle,
    debouncedNewContent,
    debouncedNewTags,
    isCreateDialogOpen,
    draftNoteId,
    // Do NOT include mutations in deps - they change on every mutation
  ]);

  const handleCreateAndEdit = async () => {
    if (draftNoteId) {
      // If we have a draft, just navigate to it
      navigate({ to: `/note/${draftNoteId}` });
      return;
    }

    // If no draft, create new note and redirect
    try {
      const created = await createNoteMutation.mutateAsync({
        title: newNote.title || "Untitled Note",
        content: newNote.content || "",
        tags: newNote.tags || undefined,
      });
      navigate({ to: `/note/${created.id}` });
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      // Reset draft state and form when closing
      setDraftNoteId(null);
      setNewNote({ title: "", content: "", tags: "" });
      if (draftNoteId) {
        toast.success("Note saved");
      }
    }
  };

  const handleDeleteNote = useCallback(
    (id: string, title: string) => {
      const deletedNote = filteredNotes.find((n) => n.id === id);

      setRemovingIds((prev) => new Set(prev).add(id));

      toast.success("Note deleted", {
        description: `"${title || "Untitled Note"}" has been removed.`,
        action: deletedNote
          ? {
              label: "Undo",
              onClick: () => {
                setRemovingIds((prev) => {
                  const next = new Set(prev);
                  next.delete(id);
                  return next;
                });
                queryClient.setQueryData<Note[]>(["notes"], (old = []) => {
                  if (old.some((n) => n.id === id)) return old;
                  return [deletedNote, ...old];
                });
                toast.success("Note restored");
              },
            }
          : undefined,
      });

      setTimeout(() => {
        queryClient.setQueryData<Note[]>(["notes"], (old = []) =>
          old.filter((note) => note.id !== id),
        );
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 250);
    },
    [filteredNotes, queryClient],
  );

  useGridShortcuts({ searchRef: searchInputRef, onNew: () => setIsCreateDialogOpen(true) });

  const visibleNotes = filteredNotes.filter((n) => !removingIds.has(n.id));

  const hasFilters = Boolean(searchTerm.trim() || selectedTag);
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag(null);
  };

  const subtitle = isLoading
    ? "Loading…"
    : [pluralize(notes.length, "note"), lastEdited && `last edited ${lastEdited}`]
        .filter(Boolean)
        .join(" · ");

  return (
    <>
      <GridPageHeader
        title="Notes"
        subtitle={subtitle}
        action={<NewItemButton label="New note" onClick={() => setIsCreateDialogOpen(true)} />}
      />

      <GridToolbar
        searchRef={searchInputRef}
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search notes"
        tags={tagOptions}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        sort={sort}
        sortOptions={NOTE_SORTS}
        onSortChange={setSort}
      />

      {isLoading ? (
        <ContentGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </ContentGrid>
      ) : notes.length === 0 ? (
        <GridEmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Jot down your first idea, draft, or plan. Your notes are auto-saved as you type."
          action={
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <FileText className="h-4 w-4" />
              Create your first note
            </Button>
          }
        />
      ) : visibleNotes.length === 0 && hasFilters ? (
        <NoResults onReset={clearFilters} />
      ) : (
        <ContentGrid>
          {visibleNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
          ))}
        </ContentGrid>
      )}

      <MobileFab label="New note" onClick={() => setIsCreateDialogOpen(true)} />

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-title">Title (optional)</Label>
              <Input
                id="new-title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter note title"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="new-content">Content</Label>
              <div className="border border-border/50 rounded-md overflow-hidden bg-background/50 focus-within:border-primary/50 transition-colors mt-2 mdxeditor-dialog">
                <MDXEditorWrapper
                  key={`create-note-${isCreateDialogOpen}`}
                  ref={editorRef}
                  markdown={newNote.content}
                  onChange={(value) => setNewNote({ ...newNote, content: value })}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Start typing to create your note. It will be saved automatically.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewNote({ title: "", content: "", tags: "" });
                    handleCreateDialogChange(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAndEdit}
                  disabled={createNoteMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {createNoteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create & Edit"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
