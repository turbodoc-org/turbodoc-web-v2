import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDiagram } from "@/lib/hooks/use-diagrams";
import DiagramCanvas from "@/components/diagram/diagram-canvas";
import { MermaidDiagramEditor } from "@/components/diagram/mermaid-diagram-editor";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authed/diagram/$diagramId")({
  ssr: false,
  component: DiagramEditorPage,
});

function DiagramEditorPage() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const { data: diagram, isLoading, error } = useDiagram(params.diagramId);

  useEffect(() => {
    if (error || (!isLoading && !diagram)) {
      navigate({ to: "/diagrams" });
    }
  }, [error, isLoading, diagram, navigate]);

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
    return null;
  }

  if (diagram.diagram_type === "mermaid") {
    return <MermaidDiagramEditor diagram={diagram} />;
  }

  return (
    <main className="h-screen w-full overflow-hidden">
      <DiagramCanvas initialDiagram={diagram} />
    </main>
  );
}
