import { AppHeader } from '@/components/app-header';
import { CodeSnippetEditor } from '@/components/code-snippet-editor';
import { CodeSnippetGrid } from '@/components/code-snippet-grid';
import { Button } from '@/components/ui/button';
import { createFileRoute } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/_authed/code-snippets')({
  ssr: 'data-only',
  component: CodeSnippets,
});

function CodeSnippets() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateNew = () => {
    setEditingSnippet(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (snippetId: string) => {
    setEditingSnippet(snippetId);
    setIsEditorOpen(true);
  };

  const handleClose = () => {
    setIsEditorOpen(false);
    setEditingSnippet(null);
    // Trigger a refresh of the grid
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <div className="flex-1 w-full max-w-7xl mx-auto p-3 md:p-6 pt-4 md:pt-8 mobile-safe-area">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Code Screenshots
            </h1>
            <Button
              onClick={handleCreateNew}
              className="flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Screenshot</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Create beautiful code screenshots with syntax highlighting and
            custom styling
          </p>
        </div>

        <div className="relative">
          <CodeSnippetGrid key={refreshKey} onEdit={handleEdit} />
        </div>
      </div>

      {isEditorOpen && (
        <CodeSnippetEditor snippetId={editingSnippet} onClose={handleClose} />
      )}
    </main>
  );
}
