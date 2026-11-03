import { useEffect, useMemo, useState } from "react";
import { Check, CircleDot, Copy, ExternalLink, PenLine, Trash2, Unlink } from "lucide-react";
import { toast } from "sonner";
import type { Bookmark } from "@/lib/types";
import { deleteBookmark, getOgImage, updateBookmark } from "@/lib/api";
import { describeLinkFailure, formatRelativeDate, getDomain } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  CardActionButton,
  CardBadge,
  ContentCard,
  DESTRUCTIVE_MENU_ITEM,
} from "@/components/shared/content-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onUpdate: (bookmark: Bookmark) => void;
  onDelete: (id: string, title: string) => void;
}

export function BookmarkCard({ bookmark, onUpdate, onDelete }: BookmarkCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editTags, setEditTags] = useState(bookmark.tags || "");
  const [editTitle, setEditTitle] = useState(bookmark.title);
  const [ogImage, setOgImage] = useState<string | null>(bookmark.ogImage || null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const domain = getDomain(bookmark.url);
  const isUnread = bookmark.status === "unread";
  const isBroken = bookmark.link_status === "broken";

  // Fetch OG image if not already available (dead links have nothing to fetch)
  useEffect(() => {
    const fetchOgImage = async () => {
      if (!ogImage && !imageLoading && !imageError && !isBroken) {
        setImageLoading(true);
        try {
          const result = await getOgImage(bookmark.url);
          if (result.ogImage) {
            setOgImage(result.ogImage);
          } else {
            setImageError(true);
          }
        } catch (error) {
          console.error("Failed to fetch OG image:", error);
          setImageError(true);
        } finally {
          setImageLoading(false);
        }
      }
    };

    fetchOgImage();
  }, [bookmark.url, ogImage, imageLoading, imageError, isBroken]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBookmark(bookmark.id);
      setShowDeleteDialog(false);
      onDelete(bookmark.id, bookmark.title);
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
      toast.error("Failed to delete bookmark");
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
      toast.success("Bookmark updated");
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      toast.error("Failed to update bookmark");
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = bookmark.status === "read" ? "unread" : "read";
      const updated = await updateBookmark(bookmark.id, { status: newStatus });
      onUpdate(updated);
      toast.success(newStatus === "read" ? "Marked as read" : "Marked as unread");
    } catch (error) {
      console.error("Failed to update bookmark status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const saved = formatRelativeDate(bookmark.time_added);
  const showImage = Boolean(ogImage) && !imageError;

  const brokenReason = isBroken
    ? describeLinkFailure(bookmark.link_status_code, bookmark.link_error)
    : null;

  const details = isBroken ? (
    <>
      <span className="font-medium text-red-600 dark:text-red-400">{brokenReason}</span>
      {` · ${domain}`}
    </>
  ) : (
    [domain, saved && `Saved ${saved}`].filter(Boolean).join(" · ")
  );

  return (
    <>
      <ContentCard
        kind="bookmark"
        title={bookmark.title || domain}
        details={details}
        href={bookmark.url}
        external
        className={cn(
          isBroken &&
            "border-red-500/50 hover:border-red-500/80 dark:border-red-500/40 dark:hover:border-red-500/70",
        )}
        // Desaturate the artwork so broken cards stand out at a glance in the grid.
        previewClassName={cn(
          isBroken &&
            "[&>img]:opacity-50 [&>img]:grayscale [&>.domain-fallback]:opacity-60 [&>.domain-fallback]:grayscale",
        )}
        preview={
          showImage ? (
            <img
              src={ogImage!}
              alt=""
              loading="lazy"
              onError={() => setImageError(true)}
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          ) : imageLoading ? (
            <Skeleton className="absolute inset-0 rounded-none" />
          ) : (
            <DomainFallback domain={domain} />
          )
        }
        badge={
          isBroken ? (
            <CardBadge className="bg-red-600/95 dark:bg-red-500/95">
              <Unlink aria-hidden className="size-3" />
              Broken link
            </CardBadge>
          ) : isUnread ? (
            <CardBadge dotClassName="bg-blue-400">Unread</CardBadge>
          ) : bookmark.status === "archived" ? (
            <CardBadge>Archived</CardBadge>
          ) : null
        }
        quickActions={
          <CardActionButton
            label={isUnread ? "Mark as read" : "Mark as unread"}
            onClick={handleToggleStatus}
          >
            {isUnread ? <Check /> : <CircleDot />}
          </CardActionButton>
        }
        menuItems={
          <>
            <DropdownMenuItem onSelect={() => window.open(bookmark.url, "_blank", "noopener")}>
              <ExternalLink />
              Open link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleCopyLink}>
              <Copy />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setIsEditing(true)}>
              <PenLine />
              Edit bookmark
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleToggleStatus}>
              {isUnread ? <Check /> : <CircleDot />}
              {isUnread ? "Mark as read" : "Mark as unread"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={DESTRUCTIVE_MENU_ITEM}
              disabled={isDeleting}
              onSelect={() => setShowDeleteDialog(true)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </>
        }
      />

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="animate-in zoom-in-95 fade-in duration-200">
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${bookmark.id}`}>Title</Label>
              <Input
                id={`title-${bookmark.id}`}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`tags-${bookmark.id}`}>Tags (pipe-separated)</Label>
              <Input
                id={`tags-${bookmark.id}`}
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
        <AlertDialogContent className="animate-in zoom-in-95 fade-in duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bookmark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{bookmark.title}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Stable hue per domain so fallback tiles are distinguishable without fetching favicons. */
function hueFor(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

function DomainFallback({ domain }: { domain: string }) {
  const hue = useMemo(() => hueFor(domain), [domain]);
  const letter = domain.replace(/^www\./, "").charAt(0).toUpperCase() || "?";

  return (
    <div
      className="domain-fallback absolute inset-0 flex flex-col items-center justify-center gap-2"
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 75% 55% / 0.2), hsl(${(hue + 50) % 360} 75% 55% / 0.06))`,
      }}
    >
      <span
        aria-hidden
        className="flex size-9 items-center justify-center rounded-[10px] text-base font-semibold text-white shadow-sm"
        style={{ backgroundColor: `hsl(${hue} 55% 45%)` }}
      >
        {letter}
      </span>
      <span className="max-w-[85%] truncate text-xs font-medium text-thumb-text">{domain}</span>
    </div>
  );
}
