'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { NoteCard } from './note-card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Plus, Search, Loader2 } from 'lucide-react';
import { getNotes, createNote, updateNote } from '@/lib/api';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useNavigate } from '@tanstack/react-router';

export function NoteGrid() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [draftNoteId, setDraftNoteId] = useState<string | null>(null);

  // Debounce search term with 300ms delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: '',
  });

  // Debounced values for auto-save in creation
  const debouncedNewTitle = useDebounce(newNote.title, 800);
  const debouncedNewContent = useDebounce(newNote.content, 800);
  const debouncedNewTags = useDebounce(newNote.tags, 800);

  useEffect(() => {
    loadNotes();
  }, []);

  // Handle debounced search
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        note.content
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        (note.tags &&
          note.tags.toLowerCase().includes(debouncedSearchTerm.toLowerCase())),
    );
    setFilteredNotes(filtered);
  }, [notes, debouncedSearchTerm]);

  // Auto-create draft note when user starts typing
  useEffect(() => {
    if (!isCreateDialogOpen) return;

    const hasContent = debouncedNewTitle || debouncedNewContent;

    if (hasContent && !draftNoteId) {
      // Create initial draft
      const createDraft = async () => {
        try {
          const created = await createNote({
            title: debouncedNewTitle || 'Untitled Note',
            content: debouncedNewContent || '',
            tags: debouncedNewTags || undefined,
          });
          setDraftNoteId(created.id);
          setNotes([created, ...notes]);
        } catch (error) {
          console.error('Failed to create draft note:', error);
        }
      };
      createDraft();
    } else if (hasContent && draftNoteId) {
      // Update existing draft
      const updateDraft = async () => {
        try {
          const updated = await updateNote(draftNoteId, {
            title: debouncedNewTitle || 'Untitled Note',
            content: debouncedNewContent || '',
            tags: debouncedNewTags || undefined,
          });
          // Update the note in our local state
          setNotes((prev) =>
            prev.map((note) => (note.id === draftNoteId ? updated : note)),
          );
        } catch (error) {
          console.error('Failed to update draft note:', error);
        }
      };
      updateDraft();
    }
  }, [
    debouncedNewTitle,
    debouncedNewContent,
    debouncedNewTags,
    isCreateDialogOpen,
    draftNoteId,
    notes,
  ]);

  const loadNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAndEdit = async () => {
    if (draftNoteId) {
      // If we have a draft, just navigate to it
      navigate({ to: `/notes/${draftNoteId}` });
      return;
    }

    // If no draft, create new note and redirect
    setIsCreating(true);
    try {
      const created = await createNote({
        title: newNote.title || 'Untitled Note',
        content: newNote.content || '',
        tags: newNote.tags || undefined,
      });
      navigate({ to: `/notes/${created.id}` });
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateDialogChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      // Reset draft state when closing
      setDraftNoteId(null);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/60 backdrop-blur-sm border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={handleCreateDialogChange}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-title">Title (optional)</Label>
                <Input
                  id="new-title"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  placeholder="Enter note title"
                />
              </div>
              <div>
                <Label htmlFor="new-content">Content</Label>
                <Textarea
                  id="new-content"
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                  placeholder="Start writing your note..."
                  className="min-h-[200px] mt-2"
                  spellCheck={true}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Start typing to create your note. It will be saved
                  automatically.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewNote({ title: '', content: '', tags: '' });
                      handleCreateDialogChange(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAndEdit}
                    disabled={isCreating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create & Edit'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {searchTerm ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {searchTerm
              ? 'Try adjusting your search terms or check the spelling.'
              : 'Create your first note to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
          ))}
        </div>
      )}
    </div>
  );
}
