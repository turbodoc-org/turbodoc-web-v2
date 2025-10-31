import { AuthButton } from '@/components/auth-button';
import { Logo } from '@/components/logo';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Link, useRouterState } from '@tanstack/react-router';
import { BookmarkIcon, Code2, StickyNote } from 'lucide-react';

interface AppHeaderProps {
  showNavLinks?: boolean;
}

export function AppHeader({ showNavLinks = true }: AppHeaderProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-lg border-b border-border shadow-sm mobile-safe-area">
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-3 md:p-4 px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Logo size="md" />
          {showNavLinks && (
            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/bookmarks"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/bookmarks')
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <BookmarkIcon className="h-4 w-4" />
                Bookmarks
              </Link>
              <Link
                to="/notes"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/notes')
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <StickyNote className="h-4 w-4" />
                Notes
              </Link>
              <Link
                to="/code-snippets"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/code-snippets')
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Code2 className="h-4 w-4" />
                Code
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
