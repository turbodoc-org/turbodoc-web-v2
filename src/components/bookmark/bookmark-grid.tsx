"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "@/lib/types";
import { BookmarkCard } from "@/components/bookmark/bookmark-card";
import { DragDropZone } from "@/components/bookmark/drag-drop-zone";
import { TagFilter } from "@/components/bookmark/tag-filter";
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
import { Plus, Search, Loader2, X, Globe, Link as LinkIcon } from "lucide-react";
import { getBookmarks, createBookmark, searchBookmarks } from "@/lib/api";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { toast } from "sonner";

function BookmarkCardSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <Skeleton className="h-32 sm:h-40 w-full rounded-none" />
      <div className="p-3 sm:p-4 flex-1 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
      <div className="px-3 sm:px-4 py-3 border-t bg-muted/30 flex justify-between items-center">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function BookmarkGrid() {
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // Debounce search term with 300ms delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [newBookmark, setNewBookmark] = useState({
    title: "",
    url: "",
    tags: "",
  });

  // Fetch bookmarks with React Query
  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });

  // Create bookmark mutation
  const createBookmarkMutation = useMutation({
    mutationFn: createBookmark,
    onSuccess: (newBookmark) => {
      queryClient.setQueryData<Bookmark[]>(["bookmarks"], (old = []) => [newBookmark, ...old]);
      // Close dialog and reset form on success
      setIsDialogOpen(false);
      setNewBookmark({ title: "", url: "", tags: "" });
      toast.success("Bookmark created", {
        description: `"${newBookmark.title}" has been saved.`,
      });
    },
    onError: () => {
      toast.error("Failed to create bookmark");
    },
  });

  // Handle debounced search and tag filtering
  useEffect(() => {
    const performSearch = async () => {
      let results = bookmarks;

      // Apply text search if there's a search term
      if (debouncedSearchTerm.trim()) {
        // Short queries (< 3 characters) use client-side filtering
        if (debouncedSearchTerm.trim().length < 3) {
          results = bookmarks.filter(
            (bookmark) =>
              bookmark.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              bookmark.url.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              (bookmark.tags &&
                bookmark.tags.toLowerCase().includes(debouncedSearchTerm.toLowerCase())),
          );
          setIsSearching(false);
        } else {
          // Longer queries use server-side search
          setIsSearching(true);
          try {
            results = await searchBookmarks(debouncedSearchTerm);
          } catch (error) {
            console.error("Search failed, falling back to client-side filtering:", error);
            // Fallback to client-side filtering on error
            results = bookmarks.filter(
              (bookmark) =>
                bookmark.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                bookmark.url.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                (bookmark.tags &&
                  bookmark.tags.toLowerCase().includes(debouncedSearchTerm.toLowerCase())),
            );
          } finally {
            setIsSearching(false);
          }
        }
      } else {
        setIsSearching(false);
      }

      // Apply tag filtering (client-side, works with any previous filtering)
      if (selectedTags.length > 0) {
        results = results.filter((bookmark) => {
          if (!bookmark.tags) return false;
          const bookmarkTags = bookmark.tags.split("|").map((tag) => tag.trim().toLowerCase());
          // Match ANY of the selected tags
          return selectedTags.some((selectedTag) =>
            bookmarkTags.includes(selectedTag.toLowerCase()),
          );
        });
      }

      setFilteredBookmarks(results);
    };

    performSearch();
  }, [bookmarks, debouncedSearchTerm, selectedTags]);

  // Set searching state when user is typing
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm && searchTerm.trim().length >= 3) {
      setIsSearching(true);
    }
  }, [searchTerm, debouncedSearchTerm]);

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

  const handleCreateBookmark = async () => {
    if (!newBookmark.title || !newBookmark.url) {
      return;
    }

    try {
      await createBookmarkMutation.mutateAsync({
        title: newBookmark.title,
        url: newBookmark.url,
        tags: newBookmark.tags || undefined,
      });
    } catch (error) {
      console.error("Failed to create bookmark:", error);
    }
  };

  const handleDragDropBookmark = (bookmark: Bookmark) => {
    queryClient.setQueryData<Bookmark[]>(["bookmarks"], (old = []) => [bookmark, ...old]);
    toast.success("Bookmark added", {
      description: `"${bookmark.title}" was added from the browser extension.`,
    });
  };

  const handleUpdateBookmark = (updatedBookmark: Bookmark) => {
    queryClient.setQueryData<Bookmark[]>(["bookmarks"], (old = []) =>
      old.map((bookmark) => (bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark)),
    );
  };

  const handleDeleteBookmark = useCallback(
    (id: string, title: string) => {
      // Optimistically animate out
      setRemovingIds((prev) => new Set(prev).add(id));

      // Show toast with undo
      const deletedBookmark = filteredBookmarks.find((b) => b.id === id);

      toast.success("Bookmark deleted", {
        description: `"${title}" has been removed.`,
        action: deletedBookmark
          ? {
              label: "Undo",
              onClick: () => {
                setRemovingIds((prev) => {
                  const next = new Set(prev);
                  next.delete(id);
                  return next;
                });
                queryClient.setQueryData<Bookmark[]>(["bookmarks"], (old = []) => {
                  if (old.some((b) => b.id === id)) return old;
                  return [deletedBookmark, ...old];
                });
                toast.success("Bookmark restored");
              },
            }
          : undefined,
      });

      // Actually remove after animation
      setTimeout(() => {
        queryClient.setQueryData<Bookmark[]>(["bookmarks"], (old = []) =>
          old.filter((bookmark) => bookmark.id !== id),
        );
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 250);
    },
    [filteredBookmarks, queryClient],
  );

  const visibleBookmarks = filteredBookmarks.filter((b) => !removingIds.has(b.id));

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Skeleton className="h-10 flex-1 sm:max-w-md" />
          <Skeleton className="h-10 flex-1 max-w-md" />
          <Skeleton className="h-10 w-36 sm:ml-auto shrink-0" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookmarkCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 sm:max-w-md">
          {isSearching ? (
            <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            ref={searchInputRef}
            placeholder="Search bookmarks..."
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
        <div className="flex-1 max-w-md">
          <TagFilter
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            maxVisibleTags={2}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg sm:ml-auto shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Bookmark
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md animate-in zoom-in-95 fade-in duration-200">
            <DialogHeader>
              <DialogTitle>Add New Bookmark</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-title">Title</Label>
                <Input
                  id="new-title"
                  value={newBookmark.title}
                  onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                  placeholder="Enter bookmark title"
                />
              </div>
              <div>
                <Label htmlFor="new-url">URL</Label>
                <Input
                  id="new-url"
                  value={newBookmark.url}
                  onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="new-tags">Tags (pipe-separated)</Label>
                <Input
                  id="new-tags"
                  value={newBookmark.tags}
                  onChange={(e) => setNewBookmark({ ...newBookmark, tags: e.target.value })}
                  placeholder="work | important | read-later"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleCreateBookmark}
                  disabled={
                    !newBookmark.title || !newBookmark.url || createBookmarkMutation.isPending
                  }
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {createBookmarkMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Bookmark"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Drag and Drop Zone */}
      <DragDropZone onBookmarkCreated={handleDragDropBookmark} />

      {visibleBookmarks.length === 0 ? (
        <div className="text-center py-16 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            {searchTerm || selectedTags.length > 0 ? (
              <Search className="h-8 w-8 text-primary" />
            ) : (
              <Globe className="h-8 w-8 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {searchTerm || selectedTags.length > 0 ? "No bookmarks found" : "No bookmarks yet"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            {searchTerm || selectedTags.length > 0
              ? "Try adjusting your search terms or selected tags."
              : "Save your first link to start organizing your favorite content from anywhere."}
          </p>
          {!(searchTerm || selectedTags.length > 0) && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Add Your First Bookmark
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {visibleBookmarks.map((bookmark, index) => (
            <div
              key={bookmark.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-forwards"
              style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
            >
              <BookmarkCard
                bookmark={bookmark}
                onUpdate={handleUpdateBookmark}
                onDelete={handleDeleteBookmark}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
