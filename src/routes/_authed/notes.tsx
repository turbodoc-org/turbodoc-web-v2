import { AuthButton } from '@/components/auth-button';
import { Logo } from '@/components/logo';
import { NoteGrid } from '@/components/note-grid';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BookmarkIcon, StickyNote } from 'lucide-react';

export const Route = createFileRoute('/_authed/notes')({
  ssr: 'data-only',
  component: Notes,
});

function Notes() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <nav className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-lg border-b border-border shadow-sm mobile-safe-area">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-3 md:p-4 px-4 md:px-6">
          <div className="flex items-center gap-4 md:gap-6">
            <Logo size="md" />
            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/bookmarks"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <BookmarkIcon className="h-4 w-4" />
                Bookmarks
              </Link>
              <Link
                to="/notes"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-muted text-foreground transition-colors"
              >
                <StickyNote className="h-4 w-4" />
                Notes
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-7xl mx-auto p-3 md:p-6 pt-4 md:pt-8 mobile-safe-area">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              My Notes
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Create, organize, and manage your markdown notes
          </p>
        </div>

        <div className="relative">
          <NoteGrid />
        </div>
      </div>
    </main>
  );
}
