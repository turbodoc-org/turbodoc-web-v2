import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookmarkIcon, Code2, House, Plus, StickyNote, Workflow, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModuleId = "bookmarks" | "notes" | "snippets" | "diagrams";

interface ModuleNavItem {
  id: ModuleId;
  label: string;
  to: "/bookmarks" | "/notes" | "/code-snippets" | "/diagrams";
  icon: LucideIcon;
  /** Path prefixes that count as "inside" this module (detail pages). */
  match: string[];
}

export const MODULE_NAV: ModuleNavItem[] = [
  { id: "bookmarks", label: "Bookmarks", to: "/bookmarks", icon: BookmarkIcon, match: ["/bookmarks"] },
  { id: "notes", label: "Notes", to: "/notes", icon: StickyNote, match: ["/notes", "/note/"] },
  { id: "snippets", label: "Snippets", to: "/code-snippets", icon: Code2, match: ["/code-snippets"] },
  { id: "diagrams", label: "Diagrams", to: "/diagrams", icon: Workflow, match: ["/diagrams", "/diagram/"] },
];

function useActiveModule(): ModuleId | null {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return MODULE_NAV.find((item) => item.match.some((prefix) => pathname.startsWith(prefix)))?.id ?? null;
}

/** Desktop header tabs: Bookmarks · Notes · Snippets · Diagrams. */
export function ModuleTabs() {
  const active = useActiveModule();

  return (
    <nav aria-label="Modules" className="hidden items-center gap-0.5 sm:flex">
      {MODULE_NAV.map((item) => {
        const isActive = item.id === active;
        return (
          <Link
            key={item.id}
            to={item.to}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-[7px] text-sm transition-colors",
              isActive
                ? "bg-surface-2 font-medium text-foreground"
                : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

const HOME_TAB = { id: "home", label: "Home", to: "/dashboard", icon: House } as const;

/** Fixed bottom tab bar for phones (hidden from 640px up): Home + the four modules. */
export function MobileTabBar() {
  const active = useActiveModule();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const tabs = [HOME_TAB, ...MODULE_NAV];

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg sm:hidden"
    >
      <div className="grid grid-cols-5">
        {tabs.map((item) => {
          const isActive = item.id === "home" ? pathname === "/dashboard" : item.id === active;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] leading-none transition-colors",
                isActive ? "font-medium text-foreground" : "text-faint",
              )}
            >
              <Icon aria-hidden className="size-5" strokeWidth={isActive ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

interface MobileFabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

/** Floating "new item" button above the mobile tab bar. Forwards props so it can be a menu trigger. */
export const MobileFab = React.forwardRef<HTMLButtonElement, MobileFabProps>(
  ({ label, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex size-14 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-[0_10px_24px_-8px_rgb(37_99_235/0.6)] transition-transform active:scale-95",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60 sm:hidden",
        className,
      )}
      {...props}
    >
      <Plus aria-hidden className="size-6" strokeWidth={2.2} />
    </button>
  ),
);
MobileFab.displayName = "MobileFab";
