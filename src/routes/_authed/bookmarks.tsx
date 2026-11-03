import { BookmarkGrid } from "@/components/bookmark/bookmark-grid";
import {
  GridPageLayout,
  newItemSearchSchema,
  useNewItemIntent,
} from "@/components/shared/grid-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/bookmarks")({
  ssr: "data-only",
  validateSearch: newItemSearchSchema,
  component: Bookmarks,
});

function Bookmarks() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const openCreate = useNewItemIntent(search.new === 1, () =>
    navigate({ search: {}, replace: true }),
  );

  return (
    <GridPageLayout>
      <BookmarkGrid initialCreateOpen={openCreate} />
    </GridPageLayout>
  );
}
