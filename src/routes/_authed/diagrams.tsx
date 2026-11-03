import { DiagramGrid } from "@/components/diagram/diagram-grid";
import { GridPageLayout } from "@/components/shared/grid-page";
import { createFileRoute } from "@tanstack/react-router";
import { useCreateAndOpenDiagram } from "@/lib/hooks/use-diagrams";

export const Route = createFileRoute("/_authed/diagrams")({
  component: Diagrams,
});

function Diagrams() {
  const { createAndOpen, isPending } = useCreateAndOpenDiagram();

  return (
    <GridPageLayout>
      <DiagramGrid onCreate={createAndOpen} isCreating={isPending} />
    </GridPageLayout>
  );
}
