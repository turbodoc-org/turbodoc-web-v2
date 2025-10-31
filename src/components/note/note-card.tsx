'use client';

import { useState } from 'react';
import { Note } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Trash2,
  Edit,
  MoreVertical,
  Clock,
  StickyNote,
  Loader2,
} from 'lucide-react';
import { deleteNote } from '@/lib/api';
import { useNavigate } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const tags = note.tags
    ? note.tags
        .split('|')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNote(note.id);
      onDelete(note.id);
    } catch (error) {
      console.error('Failed to delete note:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate({ to: `/note/${note.id}` });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card
      className="group h-80 hover:shadow-lg transition-all duration-200 border border-border hover:border-primary/20 shadow-sm bg-card overflow-hidden dark:border-gray-400 flex flex-col cursor-pointer"
      onClick={handleEdit}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header with icon and action menu */}
        <div className="relative p-3 sm:p-4 border-b border-border bg-muted/30 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary shrink-0" />
            <h3 className="font-semibold text-sm leading-tight text-foreground flex-1 min-w-0">
              {note.title ? truncateText(note.title, 30) : 'Untitled Note'}
            </h3>
          </div>

          {/* Action Menu */}
          <div
            className="absolute top-2 right-2"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background/90"
                >
                  <MoreVertical className="h-3 w-3 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit note
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 p-3 sm:p-4 overflow-hidden">
          <div className="h-full overflow-hidden">
            {note.content ? (
              <div className="text-xs text-muted-foreground line-clamp-6 overflow-hidden prose prose-xs max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    // Remove margins from elements to fit better in preview
                    p: ({ children }) => <p className="mb-1">{children}</p>,
                    h1: ({ children }) => (
                      <h1 className="text-sm font-bold mb-1">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-sm font-semibold mb-1">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xs font-semibold mb-1">{children}</h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc ml-3 mb-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal ml-3 mb-1">{children}</ol>
                    ),
                    li: ({ children }) => <li className="mb-0">{children}</li>,
                    code: ({ children }) => (
                      <code className="text-xs bg-muted px-1 rounded">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="text-xs bg-muted p-1 rounded mb-1 overflow-hidden">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-primary pl-2 italic mb-1">
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a href={href} className="text-primary underline">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {truncateText(note.content, 300)}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                Empty note
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="px-3 sm:px-4 pb-3">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-warning/10 text-warning-foreground border-warning/20 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                >
                  {truncateText(tag, 12)}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 border-border text-muted-foreground dark:border-gray-500 dark:text-gray-400"
                >
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-3 sm:px-4 py-2 bg-muted/30 border-t border-border dark:border-gray-500 dark:bg-gray-800">
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatDate(note.updated_at)}</span>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
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
    </Card>
  );
}
