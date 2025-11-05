import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDiagram } from '@/lib/hooks/use-diagrams';
import DiagramCanvas from '@/components/diagram/diagram-canvas';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_authed/diagram/$diagramId')({
  ssr: false,
  component: DiagramEditorPage,
});

function DiagramEditorPage() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const { data: diagram, isLoading, error } = useDiagram(params.diagramId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading diagram...</p>
        </div>
      </div>
    );
  }

  if (error || !diagram) {
    // Navigate back to diagrams list if diagram not found
    navigate({ to: '/diagrams' });
    return null;
  }

  return (
    <main className="h-screen w-full overflow-hidden">
      <DiagramCanvas initialDiagram={diagram} />
    </main>
  );
}
