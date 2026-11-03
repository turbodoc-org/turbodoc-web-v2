import { NoteGrid } from "@/components/note/note-grid";
import {
  GridPageLayout,
  newItemSearchSchema,
  useNewItemIntent,
} from "@/components/shared/grid-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/notes")({
  ssr: "data-only",
  validateSearch: newItemSearchSchema,
  component: Notes,
});

function Notes() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const openCreate = useNewItemIntent(search.new === 1, () =>
    navigate({ search: {}, replace: true }),
  );

  return (
    <GridPageLayout>
      <NoteGrid initialCreateOpen={openCreate} />
    </GridPageLayout>
  );
}
