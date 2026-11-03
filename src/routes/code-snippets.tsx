import { AppHeader } from "@/components/shared/app-header";
import { AppFooter } from "@/components/shared/app-footer";
import { CodeSnippetEditor } from "@/components/code-snippet/code-snippet-editor";
import { CodeSnippetGrid } from "@/components/code-snippet/code-snippet-grid";
import { GridPageLayout } from "@/components/shared/grid-page";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/context";

export const Route = createFileRoute("/code-snippets")({
  component: CodeSnippets,
});

function CodeSnippets() {
  const { user } = useAuth();
  const [isEditorOpen, setIsEditorOpen] = useState(!user); // Auto-open for anonymous users
  const [editingSnippet, setEditingSnippet] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
    // Pick up anything the editor saved
    queryClient.invalidateQueries({ queryKey: ["codeSnippets"] });
  };

  const editor = isEditorOpen && (
    <CodeSnippetEditor snippetId={editingSnippet} onClose={handleClose} />
  );

  if (user) {
    return (
      <GridPageLayout footer={<AppFooter />}>
        <CodeSnippetGrid
          onEdit={handleEdit}
          onCreate={handleCreateNew}
          shortcutsEnabled={!isEditorOpen}
        />
        {editor}
      </GridPageLayout>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      {/* Show message for anonymous users when editor is closed */}
      {!isEditorOpen && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Create Beautiful Code Screenshots
            </h1>
            <p className="text-muted-foreground max-w-md">
              Create stunning code screenshots with syntax highlighting and custom styling. Login to
              save your work!
            </p>
            <Button onClick={handleCreateNew} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Create Screenshot
            </Button>
          </div>
        </div>
      )}

      {editor}

      <AppFooter />
    </main>
  );
}
