"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Note } from "@/lib/types";
import { NoteCard } from "@/components/note/note-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Loader2, X, StickyNote, FileText } from "lucide-react";
import { getNotes, createNote, updateNote } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useNavigate } from "@tanstack/react-router";
import { MDXEditorWrapper } from "@/components/note/mdx-editor-wrapper";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { toast } from "sonner";

function NoteCardSkeleton() {
  return (
    <div className="h-80 flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="relative p-3 sm:p-4 border-b bg-muted/30 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex-1 p-3 sm:p-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="px-3 sm:px-4 pb-3 flex gap-1">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="px-3 sm:px-4 py-2 bg-muted/30 border-t flex justify-center">
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function NoteGrid() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<MDXEditorMethods>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [draftNoteId, setDraftNoteId] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

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

  // Filter notes based on search term
  const filteredNotes = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return notes;
    }

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (note.tags && note.tags.toLowerCase().includes(debouncedSearchTerm.toLowerCase())),
    );
  }, [notes, debouncedSearchTerm]);

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

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const visibleNotes = filteredNotes.filter((n) => !removingIds.has(n.id));

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Skeleton className="h-10 flex-1 sm:max-w-md" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchTerm("");
                searchInputRef.current?.blur();
              }
            }}
            className="pl-10 pr-10 bg-background/60 backdrop-blur-sm border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
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
      </div>

      {visibleNotes.length === 0 ? (
        <div className="text-center py-16 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            {searchTerm ? (
              <Search className="h-8 w-8 text-primary" />
            ) : (
              <StickyNote className="h-8 w-8 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {searchTerm ? "No notes found" : "No notes yet"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            {searchTerm
              ? "Try adjusting your search terms or check the spelling."
              : "Jot down your first idea, draft, or plan. Your notes are auto-saved as you type."}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Your First Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {visibleNotes.map((note, index) => (
            <div
              key={note.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-forwards"
              style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
            >
              <NoteCard note={note} onDelete={handleDeleteNote} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
