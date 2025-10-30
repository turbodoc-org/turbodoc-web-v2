'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from '@/lib/types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Trash2,
  Edit,
  ExternalLink,
  MoreVertical,
  Globe,
  Clock,
  ImageIcon,
  Check,
  Circle,
} from 'lucide-react';
import { deleteBookmark, updateBookmark, getOgImage } from '@/lib/api';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onUpdate: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

export function BookmarkCard({
  bookmark,
  onUpdate,
  onDelete,
}: BookmarkCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editTags, setEditTags] = useState(bookmark.tags || '');
  const [editTitle, setEditTitle] = useState(bookmark.title);
  const [ogImage, setOgImage] = useState<string | null>(
    bookmark.ogImage || null,
  );
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const tags = bookmark.tags
    ? bookmark.tags
        .split('|')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  // Fetch OG image if not already available
  useEffect(() => {
    const fetchOgImage = async () => {
      if (!ogImage && !imageLoading && !imageError) {
        setImageLoading(true);
        try {
          const result = await getOgImage(bookmark.url);
          if (result.ogImage) {
            setOgImage(result.ogImage);
          } else {
            setImageError(true);
          }
        } catch (error) {
          console.error('Failed to fetch OG image:', error);
          setImageError(true);
        } finally {
          setImageLoading(false);
        }
      }
    };

    fetchOgImage();
  }, [bookmark.url, ogImage, imageLoading, imageError]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBookmark(bookmark.id);
      onDelete(bookmark.id);
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateBookmark(bookmark.id, {
        title: editTitle,
        tags: editTags || null,
      });
      onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = bookmark.status === 'read' ? 'unread' : 'read';
      const updated = await updateBookmark(bookmark.id, {
        status: newStatus,
      });
      onUpdate(updated);
    } catch (error) {
      console.error('Failed to update bookmark status:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    // Convert to number in case it comes as string
    let ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;

    // If timestamp is in seconds (less than year 2000), convert to milliseconds
    if (ts < 946684800000) {
      // Jan 1, 2000 in milliseconds
      ts = ts * 1000;
    }

    const date = new Date(ts);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <Card className="group h-full hover:shadow-lg transition-all duration-200 border border-border hover:border-primary/20 shadow-sm bg-card overflow-hidden dark:border-gray-400">
      <CardContent className="p-0 flex flex-col h-full">
        {/* OG Image Header */}
        <div className="relative h-32 sm:h-40 bg-secondary border-b border-border">
          {ogImage && !imageError ? (
            <img
              src={ogImage}
              alt={bookmark.title}
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {imageLoading ? (
                <div className="animate-pulse">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {getDomain(bookmark.url)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Menu Overlay */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background/90"
                >
                  <MoreVertical className="h-4 w-4 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit bookmark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleToggleStatus}
                  className="cursor-pointer"
                >
                  {bookmark.status === 'read' ? (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Mark as unread
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as read
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(bookmark.url, '_blank')}
                  className="cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
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

        <div className="p-3 sm:p-4 flex-grow flex flex-col">
          <div className="mb-3">
            <h3 className="font-semibold text-base leading-tight line-clamp-2 text-foreground mb-2">
              {bookmark.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-3 w-3 flex-shrink-0" />
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground hover:underline truncate"
              >
                {getDomain(bookmark.url)}
              </a>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-warning/10 text-warning-foreground border-warning/20 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-1 border-border text-muted-foreground dark:border-gray-500 dark:text-gray-400"
                >
                  +{tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="px-3 sm:px-4 py-3 bg-muted/30 border-t border-border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDate(bookmark.time_added)}</span>
            </div>
            <Badge
              variant={bookmark.status === 'read' ? 'default' : 'outline'}
              className={`text-xs px-2.5 py-1 font-semibold ${
                bookmark.status === 'read'
                  ? 'bg-green-500/90 hover:bg-green-500 text-white border-green-600 dark:bg-green-600 dark:border-green-700'
                  : 'bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40'
              }`}
            >
              {bookmark.status === 'read' ? (
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Read
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Circle className="h-3 w-3" />
                  Unread
                </span>
              )}
            </Badge>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (pipe-separated)</Label>
              <Input
                id="tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="work | important | read-later"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bookmark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{bookmark.title}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
