import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCodeSnippet, getCodeSnippets } from "@/lib/api";
import type { CodeSnippet } from "@/lib/types";
import { Code2, Copy, Download, Edit2, Loader2, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function CodeSnippetCardSkeleton() {
  return (
    <div className="relative bg-card rounded-lg border border-border overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 border-t border-border space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

interface CodeSnippetGridProps {
  onEdit: (snippetId: string) => void;
}

export function CodeSnippetGrid({ onEdit }: CodeSnippetGridProps) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

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

  const handleDelete = async (id: string) => {
    setSnippetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!snippetToDelete) return;

    const snippet = snippets.find((s) => s.id === snippetToDelete);

    setRemovingIds((prev) => new Set(prev).add(snippetToDelete));
    setDeleteDialogOpen(false);

    toast.success("Code snippet deleted", {
      description: snippet
        ? `"${snippet.title}" has been removed.`
        : "The snippet has been removed.",
    });

    setTimeout(async () => {
      try {
        await deleteSnippetMutation.mutateAsync(snippetToDelete);
      } catch (error) {
        console.error("Failed to delete snippet:", error);
      } finally {
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(snippetToDelete);
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

  const visibleSnippets = snippets.filter((s) => !removingIds.has(s.id));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CodeSnippetCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!visibleSnippets || visibleSnippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Code2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No code snippets yet</h3>
        <p className="text-muted-foreground text-sm text-center max-w-md mb-6">
          Create your first beautiful code screenshot with syntax highlighting and custom styling.
        </p>
        <Button
          onClick={() => {
            // Dispatch a custom event or use a callback to open editor
            // Since we don't have direct access to parent's state here,
            // we'll rely on the parent route's New Screenshot button
            const event = new CustomEvent("openCodeEditor");
            window.dispatchEvent(event);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Screenshot
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {visibleSnippets.map((snippet, index) => (
        <div
          key={snippet.id}
          className="animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-forwards"
          style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
        >
          <CodeSnippetCard
            snippet={snippet}
            onEdit={onEdit}
            onDelete={handleDelete}
            onCopy={handleCopyCode}
          />
        </div>
      ))}

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
    </div>
  );
}

interface CodeSnippetCardProps {
  snippet: CodeSnippet;
  onEdit: (snippetId: string) => void;
  onDelete: (snippetId: string) => void;
  onCopy: (code: string) => void;
}

function CodeSnippetCard({ snippet, onEdit, onDelete, onCopy }: CodeSnippetCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleExport = async () => {
    // This will be implemented with proper rendering
    // For now, we'll download the code as a text file
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
    <div className="group relative bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div
        className="p-6 h-48 flex items-center justify-center relative overflow-hidden"
        style={{
          background: snippet.background_value,
        }}
      >
        <div
          className="relative rounded-lg shadow-2xl overflow-hidden max-w-full group-hover:scale-[1.02] transition-transform duration-300"
          style={{
            padding: `${snippet.padding / 4}px`,
            backgroundColor: getThemeBackground(snippet.theme),
          }}
        >
          {snippet.window_style !== "none" && (
            <div className="flex gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          )}
          <pre
            className="text-xs overflow-hidden"
            style={{
              fontFamily: snippet.font_family,
              fontSize: `${snippet.font_size * 0.75}px`,
              color: getThemeForeground(snippet.theme),
              maxHeight: "140px",
            }}
          >
            <code className="line-clamp-6">{snippet.code}</code>
          </pre>
        </div>
      </div>

      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate mb-1">{snippet.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 bg-muted rounded">{snippet.language}</span>
              <span className="px-2 py-0.5 bg-muted rounded">{snippet.theme}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(snippet.id)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy(snippet.code)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(snippet.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
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
