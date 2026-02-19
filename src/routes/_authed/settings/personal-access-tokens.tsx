import { createFileRoute } from '@tanstack/react-router';
import { PersonalAccessTokens } from '@/components/settings/personal-access-tokens';
import { AppHeader } from '@/components/shared/app-header';

export const Route = createFileRoute(
  '/_authed/settings/personal-access-tokens',
)({
  ssr: 'data-only',
  component: PersonalAccessTokensPage,
});

function PersonalAccessTokensPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <div className="flex-1 w-full max-w-5xl mx-auto p-3 md:p-6 pt-4 md:pt-8 mobile-safe-area">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Personal Access Tokens
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Create and manage tokens for API integrations and developer tools.
          </p>
        </div>
        <PersonalAccessTokens />
      </div>
    </main>
  );
}
