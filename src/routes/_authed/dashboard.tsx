import { createFileRoute } from "@tanstack/react-router";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { GridPageLayout } from "@/components/shared/grid-page";

export const Route = createFileRoute("/_authed/dashboard")({
  // Client-rendered like the module grids: the greeting and "edited today" depend on local time.
  ssr: "data-only",
  component: Dashboard,
});

function Dashboard() {
  return (
    <GridPageLayout>
      <DashboardHome />
    </GridPageLayout>
  );
}
