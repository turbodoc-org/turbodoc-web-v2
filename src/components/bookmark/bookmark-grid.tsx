"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "@/lib/types";
import { BookmarkCard } from "@/components/bookmark/bookmark-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Globe, Link as LinkIcon, Trash2, Unlink } from "lucide-react";
import { getBookmarks, createBookmark, deleteBookmarks, searchBookmarks } from "@/lib/api";
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
import { useDebounce } from "@/lib/hooks/useDebounce";
import { toast } from "sonner";
import { ContentCardSkeleton, ContentGrid } from "@/components/shared/content-card";
import {
  Chip,
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
import { pluralize, toDate } from "@/lib/format";

const EMPTY_BOOKMARKS: Bookmark[] = [];

type BookmarkSort = "newest" | "oldest" | "title";

const BOOKMARK_SORTS: { value: BookmarkSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "A–Z" },
];

function bookmarkTags(bookmark: Bookmark): string[] {
  return bookmark.tags
    ? bookmark.tags
        .split("|")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
}

function matchesTerm(bookmark: Bookmark, term: string) {
  const t = term.toLowerCase();
  return (
    bookmark.title.toLowerCase().includes(t) ||
    bookmark.url.toLowerCase().includes(t) ||
    (bookmark.tags?.toLowerCase().includes(t) ?? false)
  );
}

function isBroken(bookmark: Bookmark) {
  return bookmark.link_status === "broken";
}

function addedAt(bookmark: Bookmark) {
  return toDate(bookmark.time_added)?.getTime() ?? 0;
}

interface BookmarkGridProps {
  /** Open the "new bookmark" dialog on mount (e.g. arriving from the dashboard's New menu). */
  initialCreateOpen?: boolean;
}

export function BookmarkGrid({ initialCreateOpen = false }: BookmarkGridProps = {}) {
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<Bookmark[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [brokenOnly, setBrokenOnly] = useState(false);
  const [showDeleteBroken, setShowDeleteBroken] = useState(false);
  const [isDeletingBroken, setIsDeletingBroken] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(initialCreateOpen);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = usePersistentOption<BookmarkSort>(
    "turbodoc:bookmarks:sort",
    "newest",
    BOOKMARK_SORTS.map((o) => o.value),
  );

  // Debounce search term with 300ms delay
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [newBookmark, setNewBookmark] = useState({
    title: "",
    url: "",
    tags: "",
  });

  // Fetch bookmarks with React Query
  const { data: bookmarks = EMPTY_BOOKMARKS, isLoading } = useQuery({
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

  // Text search: short queries filter client-side, longer ones use server-side search.
  useEffect(() => {
    const term = debouncedSearchTerm.trim();
    let cancelled = false;

    if (!term) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    if (term.length < 3) {
      setSearchResults(bookmarks.filter((b) => matchesTerm(b, term)));
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchBookmarks(term)
      .then((results) => {
        if (!cancelled) setSearchResults(results);
      })
      .catch((error) => {
        console.error("Search failed, falling back to client-side filtering:", error);
        if (!cancelled) setSearchResults(bookmarks.filter((b) => matchesTerm(b, term)));
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookmarks, debouncedSearchTerm]);

  // Set searching state when user is typing
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm && searchTerm.trim().length >= 3) {
      setIsSearching(true);
    }
  }, [searchTerm, debouncedSearchTerm]);

  const tagOptions = useMemo(() => collectTags(bookmarks.map(bookmarkTags)), [bookmarks]);

  useEffect(() => {
    if (selectedTag && !tagOptions.some((t) => t.tag === selectedTag)) setSelectedTag(null);
  }, [selectedTag, tagOptions]);

  const brokenCount = useMemo(() => bookmarks.filter(isBroken).length, [bookmarks]);

  // Drop the filter once the last broken bookmark is gone.
  useEffect(() => {
    if (brokenOnly && brokenCount === 0) setBrokenOnly(false);
  }, [brokenOnly, brokenCount]);

  // Broken / tag filters + sort on top of the (optional) text search results
  const filteredBookmarks = useMemo(() => {
    let results = searchResults ?? bookmarks;
    if (brokenOnly) results = results.filter(isBroken);
    if (selectedTag) {
      const tag = selectedTag.toLowerCase();
      results = results.filter((b) => bookmarkTags(b).some((t) => t.toLowerCase() === tag));
    }
    return [...results].sort((a, b) => {
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      if (sort === "oldest") return addedAt(a) - addedAt(b);
      return addedAt(b) - addedAt(a);
    });
  }, [bookmarks, searchResults, selectedTag, sort, brokenOnly]);

  useGridShortcuts({ searchRef: searchInputRef, onNew: () => setIsDialogOpen(true) });

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

  const handleUpdateBookmark = (updatedBookmark: Bookmark) => {
    queryClient.setQueryData<Bookmark[]>(["bookmarks"], (old = []) =>
      old.map((bookmark) => (bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark)),
    );
    setSearchResults((old) =>
      old ? old.map((b) => (b.id === updatedBookmark.id ? updatedBookmark : b)) : old,
    );
  };

  const handleDeleteBookmark = useCallback(
    (id: string, title: string) => {
      // Optimistically animate out
      setRemovingIds((prev) => new Set(prev).add(id));

      // Show toast with undo
      const deletedBookmark = bookmarks.find((b) => b.id === id);

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
        setSearchResults((old) => (old ? old.filter((b) => b.id !== id) : old));
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 250);
    },
    [bookmarks, queryClient],
  );

  const visibleBookmarks = filteredBookmarks.filter((b) => !removingIds.has(b.id));
  const unreadCount = bookmarks.filter((b) => b.status === "unread").length;
  const hasFilters = Boolean(searchTerm.trim() || selectedTag || brokenOnly);
  // "Delete all" acts on exactly what the Broken filter is showing (incl. search / tag).
  const brokenToDelete = brokenOnly ? visibleBookmarks : [];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTag(null);
    setBrokenOnly(false);
  };

  const handleDeleteBroken = async () => {
    const targets = brokenToDelete;
    if (!targets.length) return;
    setIsDeletingBroken(true);
    try {
      const deleted = new Set(await deleteBookmarks(targets.map((b) => b.id)));
      queryClient.setQueryData<Bookmark[]>(["bookmarks"], (old = []) =>
        old.filter((b) => !deleted.has(b.id)),
      );
      setSearchResults((old) => (old ? old.filter((b) => !deleted.has(b.id)) : old));
      setShowDeleteBroken(false);

      const failed = targets.length - deleted.size;
      if (failed > 0) {
        toast.error(`Deleted ${deleted.size} of ${targets.length} broken bookmarks`, {
          description: `${pluralize(failed, "bookmark")} couldn't be deleted. Try again.`,
        });
      } else {
        toast.success(`Deleted ${pluralize(deleted.size, "broken bookmark")}`);
      }
    } catch (error) {
      console.error("Failed to delete broken bookmarks:", error);
      toast.error("Failed to delete broken bookmarks");
    } finally {
      setIsDeletingBroken(false);
    }
  };

  const subtitle = isLoading
    ? "Loading…"
    : [
        pluralize(bookmarks.length, "bookmark"),
        unreadCount > 0 && `${unreadCount} unread`,
        brokenCount > 0 && `${brokenCount} broken`,
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <>
      <GridPageHeader
        title="Bookmarks"
        subtitle={subtitle}
        action={<NewItemButton label="New bookmark" onClick={() => setIsDialogOpen(true)} />}
      />

      <GridToolbar
        searchRef={searchInputRef}
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search bookmarks"
        searching={isSearching}
        tags={tagOptions}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        sort={sort}
        sortOptions={BOOKMARK_SORTS}
        onSortChange={setSort}
        filters={
          brokenCount > 0 || brokenOnly ? (
            <Chip tone="danger" active={brokenOnly} onClick={() => setBrokenOnly((v) => !v)}>
              <Unlink aria-hidden />
              Broken · {brokenCount}
            </Chip>
          ) : null
        }
      />

      {brokenOnly && brokenToDelete.length > 0 && (
        <div className="flex flex-col gap-3 rounded-card border border-red-500/30 bg-red-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {pluralize(brokenToDelete.length, "link")} no longer{" "}
              {brokenToDelete.length === 1 ? "loads" : "load"}.
            </span>{" "}
            Links are flagged after failing two checks in a row (page not found, server errors,
            or the site is unreachable).
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteBroken(true)}
            className="shrink-0 border-red-500/40 text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Delete {brokenToDelete.length === 1 ? "it" : `all ${brokenToDelete.length}`}
          </Button>
        </div>
      )}

      {isLoading ? (
        <ContentGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </ContentGrid>
      ) : bookmarks.length === 0 ? (
        <GridEmptyState
          icon={Globe}
          title="No bookmarks yet"
          description="Save your first link to start organizing your favorite content from anywhere."
          action={
            <Button onClick={() => setIsDialogOpen(true)}>
              <LinkIcon className="h-4 w-4" />
              Add your first bookmark
            </Button>
          }
        />
      ) : visibleBookmarks.length === 0 && hasFilters ? (
        isSearching ? null : <NoResults onReset={clearFilters} />
      ) : (
        <ContentGrid>
          {visibleBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onUpdate={handleUpdateBookmark}
              onDelete={handleDeleteBookmark}
            />
          ))}
        </ContentGrid>
      )}

      <MobileFab label="New bookmark" onClick={() => setIsDialogOpen(true)} />

      <AlertDialog open={showDeleteBroken} onOpenChange={setShowDeleteBroken}>
        <AlertDialogContent className="animate-in zoom-in-95 fade-in duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pluralize(brokenToDelete.length, "broken bookmark")}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes every bookmark currently shown under the Broken filter. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingBroken}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDeleteBroken();
              }}
              disabled={isDeletingBroken}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingBroken ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
    </>
  );
}
