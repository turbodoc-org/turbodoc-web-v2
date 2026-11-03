import { AuthButton } from "@/components/auth/auth-button";
import { Logo } from "@/components/shared/logo";
import { ModuleTabs } from "@/components/shared/module-nav";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { useAuth } from "@/lib/auth/context";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";

interface AppHeaderProps {
  showNavLinks?: boolean;
  /**
   * "dashboard" (default) shows a single Dashboard link; "modules" shows the
   * Bookmarks / Notes / Snippets / Diagrams tabs used on the module grid pages.
   */
  nav?: "dashboard" | "modules";
}

export function AppHeader({ showNavLinks = true, nav = "dashboard" }: AppHeaderProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { user } = useAuth();
  // Signed-in users treat the dashboard as home.
  const homeHref = user ? "/dashboard" : "/";

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-lg border-b border-border shadow-sm mobile-safe-area">
      <div
        className={
          nav === "modules"
            ? "mx-auto flex h-14 w-full max-w-[1248px] items-center justify-between px-4 sm:h-16 sm:px-6"
            : "w-full max-w-7xl mx-auto flex justify-between items-center p-3 md:p-4 px-4 md:px-6"
        }
      >
        <div className="flex items-center gap-4 md:gap-6">
          {nav === "modules" ? (
            <Logo size="sm" href="/dashboard" />
          ) : (
            <Logo size="md" href={homeHref} />
          )}
          {showNavLinks && nav === "modules" && <ModuleTabs />}
          {showNavLinks && nav === "dashboard" && (
            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
