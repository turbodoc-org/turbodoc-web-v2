import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BookmarkIcon,
  ChevronDown,
  Code2,
  Loader2,
  Plus,
  Sparkles,
  StickyNote,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/context";
import { deleteCodeSnippet, getBookmarks, getCodeSnippets, getNotes } from "@/lib/api";
import {
  useCreateAndOpenDiagram,
  useDeleteDiagram,
  useDiagrams,
  useDuplicateDiagram,
  useUpdateDiagram,
} from "@/lib/hooks/use-diagrams";
import { formatRelativeDate, pluralize, toDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bookmark, CodeSnippet, Diagram, Note } from "@/lib/types";
import { NoteCard } from "@/components/note/note-card";
import { BookmarkCard } from "@/components/bookmark/bookmark-card";
import { CodeSnippetCard } from "@/components/code-snippet/code-snippet-grid";
import { CodeSnippetEditor } from "@/components/code-snippet/code-snippet-editor";
import { DiagramCard } from "@/components/diagram/diagram-grid";
import { ContentCardSkeleton, ContentGrid, type ContentKind } from "@/components/shared/content-card";
import { Chip, GridEmptyState, GridPageHeader } from "@/components/shared/grid-page";
import { MobileFab } from "@/components/shared/module-nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

/**
 * Dashboard home (nano.design "Dashboard home — Redesign"): greeting + New menu, one tile per
 * module, "Jump back in" (recently edited across modules) and the unread-bookmark reading list.
 * Reads the same React Query caches as the module grids, so moving between pages is instant.
 */

const EMPTY: never[] = [];
const RECENT_LIMIT = 8;
const READING_LIST_LIMIT = 4;

type CreateKind = "note" | "bookmark" | "snippet" | "diagram";
type RecentFilter = "all" | ContentKind;

type RecentItem =
  | { kind: "note"; id: string; time: number; item: Note }
  | { kind: "bookmark"; id: string; time: number; item: Bookmark }
  | { kind: "code"; id: string; time: number; item: CodeSnippet }
  | { kind: "diagram"; id: string; time: number; item: Diagram };

type PendingDelete = { kind: "snippet" | "diagram"; id: string; title: string };

const RECENT_FILTERS: { value: RecentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "note", label: "Notes" },
  { value: "bookmark", label: "Bookmarks" },
  { value: "code", label: "Snippets" },
  { value: "diagram", label: "Diagrams" },
];

const CREATE_ACTIONS: { kind: CreateKind; label: string; icon: LucideIcon; iconClassName: string }[] = [
  { kind: "note", label: "Note", icon: StickyNote, iconClassName: "text-module-note" },
  { kind: "bookmark", label: "Bookmark", icon: BookmarkIcon, iconClassName: "text-module-bookmark" },
  { kind: "snippet", label: "Code snippet", icon: Code2, iconClassName: "text-module-code" },
  { kind: "diagram", label: "Diagram", icon: Workflow, iconClassName: "text-module-diagram" },
];

function timeOf(...values: (string | number | null | undefined)[]) {
  for (const value of values) {
    const time = toDate(value)?.getTime();
    if (time) return time;
  }
  return 0;
}

function latestTime(times: number[]) {
  return times.reduce((max, t) => (t > max ? t : max), 0);
}

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const notesQuery = useQuery({ queryKey: ["notes"], queryFn: getNotes });
  const bookmarksQuery = useQuery({ queryKey: ["bookmarks"], queryFn: getBookmarks });
  const snippetsQuery = useQuery({ queryKey: ["codeSnippets"], queryFn: getCodeSnippets });
  const diagramsQuery = useDiagrams();

  const notes = notesQuery.data ?? (EMPTY as Note[]);
  const bookmarks = bookmarksQuery.data ?? (EMPTY as Bookmark[]);
  const snippets = snippetsQuery.data ?? (EMPTY as CodeSnippet[]);
  const diagrams = diagramsQuery.data ?? (EMPTY as Diagram[]);
  const isLoading =
    notesQuery.isLoading || bookmarksQuery.isLoading || snippetsQuery.isLoading || diagramsQuery.isLoading;

  const { createAndOpen: createDiagram, isPending: isCreatingDiagram } = useCreateAndOpenDiagram();
  const duplicateDiagramMutation = useDuplicateDiagram();
  const updateDiagramMutation = useUpdateDiagram();
  const deleteDiagramMutation = useDeleteDiagram();
  const deleteSnippetMutation = useMutation({
    mutationFn: deleteCodeSnippet,
    onSuccess: (_, id) => {
      queryClient.setQueryData<CodeSnippet[]>(["codeSnippets"], (old = []) => old.filter((s) => s.id !== id));
    },
  });

  const [filter, setFilter] = React.useState<RecentFilter>("all");
  const [snippetEditor, setSnippetEditor] = React.useState<{ id: string | null } | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<PendingDelete | null>(null);
  const [renaming, setRenaming] = React.useState<{ id: string; title: string } | null>(null);

  /* ---------------------------------------------------------------------------------------------
   * Derived data
   * -------------------------------------------------------------------------------------------*/

  const recent = React.useMemo<RecentItem[]>(() => {
    const items: RecentItem[] = [
      ...notes.map((n) => ({ kind: "note" as const, id: n.id, time: timeOf(n.updated_at, n.created_at), item: n })),
      ...bookmarks.map((b) => ({
        kind: "bookmark" as const,
        id: b.id,
        time: timeOf(b.updated_at, b.created_at, b.time_added),
        item: b,
      })),
      ...snippets.map((s) => ({ kind: "code" as const, id: s.id, time: timeOf(s.updated_at, s.created_at), item: s })),
      ...diagrams.map((d) => ({ kind: "diagram" as const, id: d.id, time: timeOf(d.updated_at, d.created_at), item: d })),
    ];
    return items.sort((a, b) => b.time - a.time);
  }, [notes, bookmarks, snippets, diagrams]);

  const unread = React.useMemo(
    () =>
      bookmarks
        .filter((b) => b.status === "unread")
        .sort((a, b) => timeOf(b.time_added, b.created_at) - timeOf(a.time_added, a.created_at)),
    [bookmarks],
  );

  const visibleRecent = React.useMemo(() => {
    if (filter !== "all") return recent.filter((r) => r.kind === filter).slice(0, RECENT_LIMIT);
    // Bookmarks already shown in the reading list below don't need a second card here.
    const inReadingList = new Set(unread.slice(0, READING_LIST_LIMIT).map((b) => b.id));
    return recent
      .filter((r) => r.kind !== "bookmark" || !inReadingList.has(r.id))
      .slice(0, RECENT_LIMIT);
  }, [recent, filter, unread]);

  const editedToday = React.useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return recent.filter((r) => r.time >= startOfDay.getTime()).length;
  }, [recent]);

  const now = new Date();
  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0];
  const title = firstName ? `${greetingFor(now)}, ${firstName}` : "Welcome back";
  const date = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const activity = [
    unread.length > 0 && pluralize(unread.length, "unread bookmark"),
    editedToday > 0 && `${pluralize(editedToday, "item")} edited today`,
  ]
    .filter(Boolean)
    .join(" · ");
  // Phones drop the date to keep the line short.
  const subtitle = activity ? (
    <>
      <span className="hidden sm:inline">{date} · </span>
      {activity}
    </>
  ) : (
    date
  );

  const isEmpty = !isLoading && recent.length === 0;

  /* ---------------------------------------------------------------------------------------------
   * Actions
   * -------------------------------------------------------------------------------------------*/

  const handleCreate = (kind: CreateKind) => {
    if (kind === "note") navigate({ to: "/notes", search: { new: 1 } });
    else if (kind === "bookmark") navigate({ to: "/bookmarks", search: { new: 1 } });
    else if (kind === "snippet") setSnippetEditor({ id: null });
    else void createDiagram();
  };

  const handleNoteDeleted = (id: string, noteTitle: string) => {
    queryClient.setQueryData<Note[]>(["notes"], (old = []) => old.filter((n) => n.id !== id));
    toast.success("Note deleted", { description: `"${noteTitle || "Untitled note"}" has been removed.` });
  };

  const handleBookmarkUpdated = (updated: Bookmark) => {
    queryClient.setQueryData<Bookmark[]>(["bookmarks"], (old = []) =>
      old.map((b) => (b.id === updated.id ? updated : b)),
    );
  };

  const handleBookmarkDeleted = (id: string, bookmarkTitle: string) => {
    queryClient.setQueryData<Bookmark[]>(["bookmarks"], (old = []) => old.filter((b) => b.id !== id));
    toast.success("Bookmark deleted", { description: `"${bookmarkTitle}" has been removed.` });
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleCloseEditor = () => {
    setSnippetEditor(null);
    queryClient.invalidateQueries({ queryKey: ["codeSnippets"] });
  };

  const handleDuplicateDiagram = (id: string) => {
    duplicateDiagramMutation.mutate(id, {
      onSuccess: () => toast.success("Diagram duplicated"),
      onError: () => toast.error("Failed to duplicate diagram"),
    });
  };

  const handleSaveRename = () => {
    if (!renaming) return;
    const { id, title: nextTitle } = renaming;
    setRenaming(null);
    const trimmed = nextTitle.trim();
    const current = diagrams.find((d) => d.id === id)?.title;
    if (!trimmed || trimmed === current) return;
    updateDiagramMutation.mutate(
      { id, updates: { title: trimmed } },
      {
        onSuccess: () => toast.success("Diagram renamed"),
        onError: () => toast.error("Failed to rename diagram"),
      },
    );
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { kind, id, title: itemTitle } = pendingDelete;
    setPendingDelete(null);
    try {
      if (kind === "snippet") await deleteSnippetMutation.mutateAsync(id);
      else await deleteDiagramMutation.mutateAsync(id);
      toast.success(kind === "snippet" ? "Code snippet deleted" : "Diagram deleted", {
        description: `"${itemTitle}" has been removed.`,
      });
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error(kind === "snippet" ? "Failed to delete code snippet" : "Failed to delete diagram");
    }
  };

  const renderCard = (entry: RecentItem) => {
    switch (entry.kind) {
      case "note":
        return <NoteCard note={entry.item} onDelete={handleNoteDeleted} />;
      case "bookmark":
        return (
          <BookmarkCard bookmark={entry.item} onUpdate={handleBookmarkUpdated} onDelete={handleBookmarkDeleted} />
        );
      case "code":
        return (
          <CodeSnippetCard
            snippet={entry.item}
            onEdit={(id) => setSnippetEditor({ id })}
            onCopy={handleCopyCode}
            onDelete={(id) =>
              setPendingDelete({ kind: "snippet", id, title: entry.item.title || "Untitled snippet" })
            }
          />
        );
      case "diagram": {
        const diagram = entry.item;
        const isEditing = renaming?.id === diagram.id;
        return (
          <DiagramCard
            diagram={diagram}
            isEditing={isEditing}
            editingTitle={isEditing ? renaming.title : ""}
            onEditingTitleChange={(value) => setRenaming({ id: diagram.id, title: value })}
            onStartRename={() => setRenaming({ id: diagram.id, title: diagram.title })}
            onSaveRename={handleSaveRename}
            onCancelRename={() => setRenaming(null)}
            onDuplicate={() => handleDuplicateDiagram(diagram.id)}
            isDuplicating={duplicateDiagramMutation.isPending && duplicateDiagramMutation.variables === diagram.id}
            onDelete={() =>
              setPendingDelete({ kind: "diagram", id: diagram.id, title: diagram.title || "Untitled diagram" })
            }
          />
        );
      }
    }
  };

  /* ---------------------------------------------------------------------------------------------
   * Render
   * -------------------------------------------------------------------------------------------*/

  const tiles: ModuleTileProps[] = [
    {
      label: "Bookmarks",
      to: "/bookmarks",
      icon: BookmarkIcon,
      accent: "text-module-bookmark bg-module-bookmark/15",
      stats: bookmarksQuery.isLoading
        ? null
        : bookmarks.length === 0
          ? "No bookmarks yet"
          : [`${bookmarks.length} saved`, unread.length > 0 && `${unread.length} unread`].filter(Boolean).join(" · "),
      shortStats:
        bookmarks.length > 0
          ? [bookmarks.length, unread.length > 0 && `${unread.length} unread`].filter(Boolean).join(" · ")
          : undefined,
      onCreate: () => handleCreate("bookmark"),
      createLabel: "New bookmark",
    },
    {
      label: "Notes",
      to: "/notes",
      icon: StickyNote,
      accent: "text-module-note bg-module-note/15",
      stats: moduleStats(notesQuery.isLoading, notes.length, "note", notes.map((n) => timeOf(n.updated_at, n.created_at))),
      shortStats: notes.length > 0 ? pluralize(notes.length, "note") : undefined,
      onCreate: () => handleCreate("note"),
      createLabel: "New note",
    },
    {
      label: "Code snippets",
      shortLabel: "Snippets",
      to: "/code-snippets",
      icon: Code2,
      accent: "text-module-code bg-module-code/15",
      stats: moduleStats(
        snippetsQuery.isLoading,
        snippets.length,
        "snippet",
        snippets.map((s) => timeOf(s.updated_at, s.created_at)),
      ),
      shortStats: snippets.length > 0 ? pluralize(snippets.length, "snippet") : undefined,
      onCreate: () => handleCreate("snippet"),
      createLabel: "New code snippet",
    },
    {
      label: "Diagrams",
      to: "/diagrams",
      icon: Workflow,
      accent: "text-module-diagram bg-module-diagram/15",
      stats: moduleStats(
        diagramsQuery.isLoading,
        diagrams.length,
        "diagram",
        diagrams.map((d) => timeOf(d.updated_at, d.created_at)),
      ),
      shortStats: diagrams.length > 0 ? pluralize(diagrams.length, "diagram") : undefined,
      onCreate: () => handleCreate("diagram"),
      createLabel: "New diagram",
      creating: isCreatingDiagram,
    },
  ];

  return (
    <div className="flex flex-col gap-7 sm:gap-10">
      <GridPageHeader
        title={title}
        subtitle={subtitle}
        action={
          <NewMenu onCreate={handleCreate} creatingDiagram={isCreatingDiagram}>
            <Button className="h-[38px] gap-2 rounded-control px-3 font-[550] shadow-none">
              <Plus strokeWidth={2.2} />
              New
              <span aria-hidden className="ml-0.5 h-[18px] w-px bg-white/30" />
              <ChevronDown className="size-3.5" strokeWidth={2.2} />
            </Button>
          </NewMenu>
        }
      />

      <section aria-label="Modules" className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <ModuleTile key={tile.to} {...tile} />
        ))}
      </section>

      {isEmpty ? (
        <GridEmptyState
          icon={Sparkles}
          title="Your workspace is empty"
          description="Save a bookmark, write a note or start a diagram, and it will show up here."
        />
      ) : (
        <section aria-labelledby="recent-heading" className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between gap-4">
            <SectionTitle id="recent-heading" title="Jump back in" hint="Recently edited" />
            <div role="group" aria-label="Filter by type" className="hidden gap-1.5 sm:flex">
              {RECENT_FILTERS.map((option) => (
                <Chip key={option.value} active={filter === option.value} onClick={() => setFilter(option.value)}>
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Phones: a swipeable row. From 640px: the standard card grid (6 items, 8 at xl). */}
          <div
            className={cn(
              "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-none",
              "max-sm:[&_[data-slot=card-preview]]:aspect-[16/10]",
              "sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4",
            )}
          >
            {isLoading && visibleRecent.length === 0
              ? Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="w-[232px] shrink-0 sm:w-auto">
                    <ContentCardSkeleton />
                  </div>
                ))
              : visibleRecent.map((entry, index) => (
                  <div
                    key={`${entry.kind}:${entry.id}`}
                    className={cn(
                      "flex w-[232px] shrink-0 snap-start flex-col sm:w-auto [&>article]:flex-1",
                      index >= 6 && "sm:hidden xl:flex",
                    )}
                  >
                    {renderCard(entry)}
                  </div>
                ))}
          </div>
          {!isLoading && visibleRecent.length === 0 && (
            <p className="py-8 text-center text-sm text-faint">
              Nothing here yet.{" "}
              <button type="button" className="text-foreground underline-offset-4 hover:underline" onClick={() => setFilter("all")}>
                Show everything
              </button>
            </p>
          )}
        </section>
      )}

      {unread.length > 0 && (
        <section aria-labelledby="reading-heading" className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between gap-4">
            <SectionTitle
              id="reading-heading"
              title="Reading list"
              hint={
                <>
                  {unread.length} unread<span className="hidden sm:inline"> {unread.length === 1 ? "bookmark" : "bookmarks"}</span>
                </>
              }
            />
            <Link
              to="/bookmarks"
              className="flex shrink-0 items-center gap-1 rounded-md text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <ContentGrid>
            {unread.slice(0, READING_LIST_LIMIT).map((bookmark, index) => (
              <div key={bookmark.id} className={cn("flex flex-col [&>article]:flex-1", index === 3 && "lg:hidden xl:flex")}>
                <BookmarkCard bookmark={bookmark} onUpdate={handleBookmarkUpdated} onDelete={handleBookmarkDeleted} />
              </div>
            ))}
          </ContentGrid>
        </section>
      )}

      <NewMenu onCreate={handleCreate} creatingDiagram={isCreatingDiagram} side="top">
        <MobileFab label="New" />
      </NewMenu>

      {snippetEditor && <CodeSnippetEditor snippetId={snippetEditor.id} onClose={handleCloseEditor} />}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="animate-in zoom-in-95 fade-in duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.kind === "diagram" ? "Delete diagram" : "Delete code snippet"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{pendingDelete?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** "24 notes · edited today", "No notes yet", or null while loading. */
function moduleStats(loading: boolean, count: number, noun: string, times: number[]): string | null {
  if (loading) return null;
  if (count === 0) return `No ${noun}s yet`;
  const edited = formatRelativeDate(latestTime(times) || null);
  return [pluralize(count, noun), edited && `edited ${edited}`].filter(Boolean).join(" · ");
}

/* ------------------------------------------------------------------------------------------------
 * Pieces
 * ----------------------------------------------------------------------------------------------*/

function SectionTitle({ id, title, hint }: { id: string; title: string; hint?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-baseline gap-2 sm:gap-2.5">
      <h2 id={id} className="text-[17px] font-semibold leading-[22px] tracking-[-0.01em] text-foreground sm:text-lg sm:leading-6">
        {title}
      </h2>
      {hint && <span className="truncate text-xs text-faint sm:text-[13px]">{hint}</span>}
    </div>
  );
}

interface NewMenuProps {
  children: React.ReactElement;
  onCreate: (kind: CreateKind) => void;
  creatingDiagram?: boolean;
  side?: "top" | "bottom";
}

function NewMenu({ children, onCreate, creatingDiagram, side = "bottom" }: NewMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={side} className="w-48">
        {CREATE_ACTIONS.map(({ kind, label, icon: Icon, iconClassName }) => {
          const pending = kind === "diagram" && creatingDiagram;
          return (
            <DropdownMenuItem key={kind} disabled={pending} onSelect={() => onCreate(kind)}>
              {pending ? <Loader2 className="animate-spin" /> : <Icon className={iconClassName} />}
              {label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ModuleTileProps {
  label: string;
  /** Used on phones where tiles are narrow. */
  shortLabel?: string;
  to: "/bookmarks" | "/notes" | "/code-snippets" | "/diagrams";
  icon: LucideIcon;
  /** Text + tinted background classes for the icon chip. */
  accent: string;
  stats: string | null;
  /** Shorter stats line for phones; falls back to `stats`. */
  shortStats?: string;
  onCreate: () => void;
  createLabel: string;
  creating?: boolean;
}

/** Module shortcut: the whole tile links to the module; "+" (desktop) creates a new item. */
function ModuleTile({
  label,
  shortLabel,
  to,
  icon: Icon,
  accent,
  stats,
  shortStats,
  onCreate,
  createLabel,
  creating,
}: ModuleTileProps) {
  return (
    <div
      className={cn(
        "group relative flex min-w-0 items-center gap-2.5 rounded-card border border-border bg-card p-3",
        "sm:flex-col sm:items-stretch sm:gap-4 sm:p-4",
        "transition-[transform,box-shadow,border-color] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover motion-reduce:hover:translate-y-0",
        "has-[[data-tile-link]:focus-visible]:border-primary has-[[data-tile-link]:focus-visible]:ring-[3px] has-[[data-tile-link]:focus-visible]:ring-focus-ring",
      )}
    >
      <div className="flex shrink-0 items-center justify-between">
        <span aria-hidden className={cn("flex rounded-[10px] p-2 sm:p-[9px]", accent)}>
          <Icon className="size-[18px]" />
        </span>
        <button
          type="button"
          aria-label={createLabel}
          title={createLabel}
          onClick={onCreate}
          disabled={creating}
          className={cn(
            "relative z-10 hidden size-7 items-center justify-center rounded-lg border border-border text-muted-foreground sm:flex",
            "transition-colors hover:border-line-strong hover:bg-surface-2 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
          )}
        >
          {creating ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" strokeWidth={2.2} />}
        </button>
      </div>
      <div className="flex min-w-0 flex-col sm:gap-0.5">
        <Link
          to={to}
          data-tile-link
          className="truncate text-sm font-semibold leading-[18px] text-foreground outline-none after:absolute after:inset-0 after:rounded-card after:content-[''] sm:text-[15px] sm:leading-5"
        >
          {shortLabel ? (
            <>
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </>
          ) : (
            label
          )}
        </Link>
        {stats === null ? (
          <span aria-hidden className="mt-1 h-3 w-24 animate-pulse rounded bg-surface-2" />
        ) : (
          <span className="truncate text-xs leading-4 text-faint">
            {shortStats ? (
              <>
                <span className="sm:hidden">{shortStats}</span>
                <span className="hidden sm:inline">{stats}</span>
              </>
            ) : (
              stats
            )}
          </span>
        )}
      </div>
    </div>
  );
}
