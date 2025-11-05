import { AppHeader } from '@/components/shared/app-header';
import { DiagramGrid } from '@/components/diagram/diagram-grid';
import { Button } from '@/components/ui/button';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCreateDiagram } from '@/lib/hooks/use-diagrams';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authed/diagrams')({
  component: Diagrams,
});

function Diagrams() {
  const navigate = useNavigate();
  const createDiagramMutation = useCreateDiagram();

  const handleNewDiagram = async () => {
    try {
      // Create a new diagram with default title
      const timestamp = new Date().toLocaleDateString();
      const newDiagram = await createDiagramMutation.mutateAsync({
        title: `Diagram ${timestamp}`,
        shapes: [],
        connections: [],
      });

      // Navigate to the new diagram
      navigate({
        to: '/diagram/$diagramId',
        params: { diagramId: newDiagram.id },
      });
    } catch (error) {
      console.error('Failed to create new diagram:', error);
      toast.error('Failed to create new diagram. Please try again.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <div className="flex-1 w-full max-w-7xl mx-auto p-3 md:p-6 pt-4 md:pt-8 mobile-safe-area">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Diagrams
            </h1>
            <Button
              onClick={handleNewDiagram}
              disabled={createDiagramMutation.isPending}
              className="flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Diagram</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Create and manage your diagrams with powerful drawing tools
          </p>
        </div>

        <div className="relative">
          <DiagramGrid />
        </div>
      </div>
    </main>
  );
}
