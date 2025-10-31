'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/lib/types';
import { getNote, updateNote, deleteNote } from '@/lib/api';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Trash2, Loader2, Clock, StickyNote } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { MDXEditorWrapper } from './mdx-editor-wrapper';
import type { MDXEditorMethods } from '@mdxeditor/editor';

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const editorRef = useRef<MDXEditorMethods>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  // Debounced values for auto-save
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTags = useDebounce(tags, 1000);

  // Fetch note with React Query
  const {
    data: note,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNote(noteId),
    retry: 1,
  });

  // Initialize form when note loads
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || '');
      setLastSaved(new Date());

      // Update editor content via ref if it exists and content changed
      if (editorRef.current && note.content !== content) {
        editorRef.current.setMarkdown(note.content || '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]); // Only run when note ID changes (new note loaded)

  // Navigate away if note fails to load
  useEffect(() => {
    if (isError) {
      console.error('Failed to load note');
      navigate({ to: '/notes' });
    }
  }, [isError, navigate]);

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: (data: Partial<Note>) => updateNote(noteId, data),
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(['note', noteId], updatedNote);
      queryClient.setQueryData<Note[]>(['notes'], (old = []) =>
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
      queryClient.setQueryData<Note[]>(['notes'], (old = []) =>
        old.filter((n) => n.id !== noteId),
      );
      console.log('Note deleted successfully');
      navigate({ to: '/notes' });
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (!note) return;

    const hasDataChanges =
      debouncedTitle !== (note.title || '') ||
      debouncedContent !== (note.content || '') ||
      debouncedTags !== (note.tags || '');

    if (
      hasDataChanges &&
      (debouncedTitle || debouncedContent || debouncedTags)
    ) {
      const autoSave = async () => {
        try {
          setAutoSaving(true);
          await updateNoteMutation.mutateAsync({
            title: debouncedTitle || undefined,
            content: debouncedContent || undefined,
            tags: debouncedTags || null,
          });
        } catch (error) {
          console.error('Failed to auto-save note:', error);
        } finally {
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
    note?.title,
    note?.content,
    note?.tags,
  ]);

  const handleDelete = async () => {
    if (!note) return;

    try {
      await deleteNoteMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to delete note:', error);
      console.error('Failed to delete note');
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasChanges(true);
  };

  const handleContentChange = (value: string) => {
    // Only update if the value actually changed
    if (value !== content) {
      setContent(value);
      setHasChanges(true);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Note not found
          </h2>
          <p className="text-muted-foreground mb-4">
            The note you&apos;re looking for doesn&apos;t exist or has been
            deleted.
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="w-full max-w-5xl mx-auto flex justify-between items-center p-3 md:p-4 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <Link to="/notes">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Notes</span>
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
                {title || 'Untitled Note'}
              </h1>
              {autoSaving ? (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              ) : hasChanges ? (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  Unsaved changes
                </span>
              ) : lastSaved ? (
                <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                  Saved
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Updated {formatDate(note.updated_at)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteNoteMutation.isPending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6">
        <div className="space-y-8 bg-card rounded-lg border border-border shadow-sm my-6 p-6 md:p-8">
          {/* Title Input */}
          <div>
            <Label
              htmlFor="title"
              className="text-sm font-medium text-foreground mb-3 block sr-only"
            >
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter note title..."
              className="text-xl font-semibold border-0 shadow-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Content Editor */}
          <div className="flex-1">
            <Label
              htmlFor="content"
              className="text-sm font-medium text-foreground mb-3 block"
            >
              Content
            </Label>
            <div className="border border-border/50 rounded-md overflow-hidden bg-background/50 focus-within:border-primary/50 transition-colors">
              <MDXEditorWrapper
                key={noteId}
                ref={editorRef}
                markdown={note?.content || ''}
                onChange={handleContentChange}
                placeholder="Start writing your note..."
              />
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{title || 'this note'}
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
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
