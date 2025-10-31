import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteCodeSnippet, getCodeSnippets } from '@/lib/api';
import type { CodeSnippet } from '@/lib/types';
import {
  Code2,
  Copy,
  Download,
  Edit2,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CodeSnippetGridProps {
  onEdit: (snippetId: string) => void;
}

export function CodeSnippetGrid({ onEdit }: CodeSnippetGridProps) {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    try {
      setIsLoading(true);
      const data = await getCodeSnippets();
      setSnippets(data);
    } catch (error) {
      console.error('Failed to load code snippets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSnippetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!snippetToDelete) return;

    try {
      await deleteCodeSnippet(snippetToDelete);
      setSnippets((prev) => prev.filter((s) => s.id !== snippetToDelete));
      setDeleteDialogOpen(false);
      setSnippetToDelete(null);
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      alert('Failed to delete snippet. Please try again.');
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // You can add a toast notification here
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!snippets || snippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Code2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No code snippets yet</h3>
        <p className="text-muted-foreground text-sm text-center max-w-md">
          Create your first beautiful code screenshot by clicking the "New
          Screenshot" button above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {snippets.map((snippet) => (
        <CodeSnippetCard
          key={snippet.id}
          snippet={snippet}
          onEdit={onEdit}
          onDelete={handleDelete}
          onCopy={handleCopyCode}
        />
      ))}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Code Snippet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this code snippet? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSnippetToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CodeSnippetCardProps {
  snippet: CodeSnippet;
  onEdit: (snippetId: string) => void;
  onDelete: (snippetId: string) => void;
  onCopy: (code: string) => void;
}

function CodeSnippetCard({
  snippet,
  onEdit,
  onDelete,
  onCopy,
}: CodeSnippetCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleExport = async () => {
    // This will be implemented with proper rendering
    // For now, we'll download the code as a text file
    const blob = new Blob([snippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet.title.replace(/\s+/g, '-').toLowerCase()}.${snippet.language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="group relative bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all">
      <div
        className="p-6 h-48 flex items-center justify-center relative overflow-hidden"
        style={{
          background: snippet.background_value,
        }}
      >
        <div
          className="relative rounded-lg shadow-2xl overflow-hidden max-w-full"
          style={{
            padding: `${snippet.padding / 4}px`,
            backgroundColor: getThemeBackground(snippet.theme),
          }}
        >
          {snippet.window_style !== 'none' && (
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
              maxHeight: '140px',
            }}
          >
            <code className="line-clamp-6">{snippet.code}</code>
          </pre>
        </div>
      </div>

      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate mb-1">
              {snippet.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 bg-muted rounded">
                {snippet.language}
              </span>
              <span className="px-2 py-0.5 bg-muted rounded">
                {snippet.theme}
              </span>
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
    dracula: '#282a36',
    'one-dark': '#282c34',
    'github-dark': '#0d1117',
    'github-light': '#ffffff',
    monokai: '#272822',
    nord: '#2e3440',
    'solarized-dark': '#002b36',
    'solarized-light': '#fdf6e3',
  };
  return themes[theme] || themes.dracula;
}

function getThemeForeground(theme: string): string {
  const themes: Record<string, string> = {
    dracula: '#f8f8f2',
    'one-dark': '#abb2bf',
    'github-dark': '#c9d1d9',
    'github-light': '#24292f',
    monokai: '#f8f8f2',
    nord: '#d8dee9',
    'solarized-dark': '#839496',
    'solarized-light': '#657b83',
  };
  return themes[theme] || themes.dracula;
}
