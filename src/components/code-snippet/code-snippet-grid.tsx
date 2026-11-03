import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Code2, Copy, Download, Loader2, PenLine, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  CardActionButton,
  ContentCard,
  ContentCardSkeleton,
  ContentGrid,
  DESTRUCTIVE_MENU_ITEM,
} from "@/components/shared/content-card";
import {
  GridEmptyState,
  GridPageHeader,
  GridToolbar,
  NewItemButton,
  NoResults,
  useGridShortcuts,
  usePersistentOption,
} from "@/components/shared/grid-page";
import { MobileFab } from "@/components/shared/module-nav";
import { deleteCodeSnippet, getCodeSnippets } from "@/lib/api";
import { formatLanguage, formatRelativeDate, pluralize, toDate } from "@/lib/format";
import type { CodeSnippet } from "@/lib/types";

type SnippetSort = "updated" | "created" | "title";

const SNIPPET_SORTS: { value: SnippetSort; label: string }[] = [
  { value: "updated", label: "Last edited" },
  { value: "created", label: "Created" },
  { value: "title", label: "A–Z" },
];

function timeOf(value: string | null | undefined) {
  return toDate(value)?.getTime() ?? 0;
}

interface CodeSnippetGridProps {
  onEdit: (snippetId: string) => void;
  onCreate: () => void;
  /** False while the editor overlay is open, so grid shortcuts don't fire behind it. */
  shortcutsEnabled?: boolean;
}

export function CodeSnippetGrid({ onEdit, onCreate, shortcutsEnabled = true }: CodeSnippetGridProps) {
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = usePersistentOption<SnippetSort>(
    "turbodoc:snippets:sort",
    "updated",
    SNIPPET_SORTS.map((o) => o.value),
  );

  // Fetch snippets with React Query
  const { data: snippets = [], isLoading } = useQuery({
    queryKey: ["codeSnippets"],
    queryFn: getCodeSnippets,
  });

  // Delete snippet mutation
  const deleteSnippetMutation = useMutation({
    mutationFn: deleteCodeSnippet,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<CodeSnippet[]>(["codeSnippets"], (old = []) =>
        old.filter((s) => s.id !== deletedId),
      );
    },
    onError: () => {
      toast.error("Failed to delete code snippet");
    },
  });

  useGridShortcuts({ searchRef: searchInputRef, onNew: onCreate, enabled: shortcutsEnabled });

  const handleDelete = (id: string) => {
    setSnippetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!snippetToDelete) return;

    const id = snippetToDelete;
    const snippet = snippets.find((s) => s.id === id);

    setRemovingIds((prev) => new Set(prev).add(id));
    setDeleteDialogOpen(false);

    toast.success("Code snippet deleted", {
      description: snippet ? `"${snippet.title}" has been removed.` : "The snippet has been removed.",
    });

    setTimeout(async () => {
      try {
        await deleteSnippetMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete snippet:", error);
      } finally {
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setSnippetToDelete(null);
      }
    }, 250);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    } catch (error) {
      console.error("Failed to copy code:", error);
      toast.error("Failed to copy code");
    }
  };

  const visibleSnippets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = snippets.filter((s) => {
      if (removingIds.has(s.id)) return false;
      if (!term) return true;
      return (
        s.title.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        s.language.toLowerCase().includes(term)
      );
    });
    return filtered.sort((a, b) => {
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      if (sort === "created") return timeOf(b.created_at) - timeOf(a.created_at);
      return timeOf(b.updated_at ?? b.created_at) - timeOf(a.updated_at ?? a.created_at);
    });
  }, [snippets, removingIds, searchTerm, sort]);

  const subtitle = isLoading
    ? "Loading…"
    : `${pluralize(snippets.length, "snippet")} · code screenshots with syntax highlighting`;

  return (
    <>
      <GridPageHeader
        title="Snippets"
        subtitle={subtitle}
        action={<NewItemButton label="New snippet" onClick={onCreate} />}
      />

      <GridToolbar
        searchRef={searchInputRef}
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search snippets"
        sort={sort}
        sortOptions={SNIPPET_SORTS}
        onSortChange={setSort}
      />

      {isLoading ? (
        <ContentGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </ContentGrid>
      ) : snippets.length === 0 ? (
        <GridEmptyState
          icon={Code2}
          title="No code snippets yet"
          description="Create your first beautiful code screenshot with syntax highlighting and custom styling."
          action={
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Create your first snippet
            </Button>
          }
        />
      ) : visibleSnippets.length === 0 && searchTerm.trim() ? (
        <NoResults onReset={() => setSearchTerm("")} />
      ) : (
        <ContentGrid>
          {visibleSnippets.map((snippet) => (
            <CodeSnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={onEdit}
              onDelete={handleDelete}
              onCopy={handleCopyCode}
            />
          ))}
        </ContentGrid>
      )}

      <MobileFab label="New snippet" onClick={onCreate} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="animate-in zoom-in-95 fade-in duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Code Snippet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this code snippet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setSnippetToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteSnippetMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteSnippetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface CodeSnippetCardProps {
  snippet: CodeSnippet;
  onEdit: (snippetId: string) => void;
  onDelete: (snippetId: string) => void;
  onCopy: (code: string) => void;
}

// Enough lines to fill the thumbnail.
const PREVIEW_LINES = 14;

export function CodeSnippetCard({ snippet, onEdit, onDelete, onCopy }: CodeSnippetCardProps) {
  const lineCount = useMemo(() => snippet.code.split("\n").length, [snippet.code]);
  const previewCode = useMemo(
    () => snippet.code.split("\n").slice(0, PREVIEW_LINES).join("\n"),
    [snippet.code],
  );

  const language = formatLanguage(snippet.language);
  const edited = formatRelativeDate(snippet.updated_at ?? snippet.created_at);
  const details = [language, pluralize(lineCount, "line"), edited && `Edited ${edited}`]
    .filter(Boolean)
    .join(" · ");

  const themeBackground = getThemeBackground(snippet.theme);

  const handleExport = () => {
    const blob = new Blob([snippet.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${snippet.title.replace(/\s+/g, "-").toLowerCase()}.${snippet.language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code exported");
  };

  return (
    <ContentCard
      kind="code"
      title={snippet.title || "Untitled snippet"}
      details={details}
      onOpen={() => onEdit(snippet.id)}
      previewClassName="border-transparent"
      // The user's chosen screenshot styling: background, code theme and window chrome.
      previewStyle={{ background: snippet.background_value }}
      preview={
        <>
          <div className="absolute inset-0 flex items-center justify-center p-[7%]">
            <div
              className="relative flex max-h-full w-full flex-col overflow-hidden rounded-md shadow-xl transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
              style={{
                backgroundColor: themeBackground,
                padding: `${Math.min(Math.max(snippet.padding / 4, 6), 12)}px`,
              }}
            >
              {snippet.window_style !== "none" && (
                <div aria-hidden className="mb-2 flex shrink-0 gap-1">
                  <span className="size-[7px] rounded-full bg-[#ff5f57]" />
                  <span className="size-[7px] rounded-full bg-[#febc2e]" />
                  <span className="size-[7px] rounded-full bg-[#28c840]" />
                </div>
              )}
              <pre
                className="min-h-0 overflow-hidden whitespace-pre text-[10px] leading-[15px]"
                style={{
                  fontFamily: `${snippet.font_family}, ui-monospace, SFMono-Regular, Menlo, monospace`,
                  color: getThemeForeground(snippet.theme),
                }}
              >
                <code>{previewCode}</code>
              </pre>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
                style={{ background: `linear-gradient(to bottom, transparent, ${themeBackground})` }}
              />
            </div>
          </div>
          <span className="absolute bottom-2.5 right-2.5 rounded-[5px] bg-black/55 px-[7px] py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {language}
          </span>
        </>
      }
      quickActions={
        <CardActionButton label="Copy code" onClick={() => onCopy(snippet.code)}>
          <Copy />
        </CardActionButton>
      }
      menuItems={
        <>
          <DropdownMenuItem onSelect={() => onEdit(snippet.id)}>
            <PenLine />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onCopy(snippet.code)}>
            <Copy />
            Copy code
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExport}>
            <Download />
            Export
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className={DESTRUCTIVE_MENU_ITEM} onSelect={() => onDelete(snippet.id)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </>
      }
    />
  );
}

// Theme color mappings
function getThemeBackground(theme: string): string {
  const themes: Record<string, string> = {
    dracula: "#282a36",
    "one-dark": "#282c34",
    "github-dark": "#0d1117",
    "github-light": "#ffffff",
    monokai: "#272822",
    nord: "#2e3440",
    "solarized-dark": "#002b36",
    "solarized-light": "#fdf6e3",
  };
  return themes[theme] || themes.dracula;
}

function getThemeForeground(theme: string): string {
  const themes: Record<string, string> = {
    dracula: "#f8f8f2",
    "one-dark": "#abb2bf",
    "github-dark": "#c9d1d9",
    "github-light": "#24292f",
    monokai: "#f8f8f2",
    nord: "#d8dee9",
    "solarized-dark": "#839496",
    "solarized-light": "#657b83",
  };
  return themes[theme] || themes.dracula;
}
