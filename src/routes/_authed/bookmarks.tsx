import { AppHeader } from '@/components/app-header';
import { BookmarkGrid } from '@/components/bookmark-grid';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/bookmarks')({
  ssr: 'data-only',
  component: Bookmarks,
});

function Bookmarks() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <div className="flex-1 w-full max-w-7xl mx-auto p-3 md:p-6 pt-4 md:pt-8 mobile-safe-area">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              My Bookmarks
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Save, organize, and access your favorite links from anywhere
          </p>
        </div>

        <div className="relative">
          <BookmarkGrid />
        </div>
      </div>
    </main>
  );
}
