import * as React from "react";
import { Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/shared/app-header";
import { AppFooter } from "@/components/shared/app-footer";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, StickyNote, Workflow, Code2, Home, ArrowLeft, Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-16 text-center">
          {/* Animated radar illustration */}
          <div className="relative w-32 h-32 mx-auto mb-10">
            {/* Outer dashed ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-[spin_12s_linear_infinite]" />
            {/* Middle dashed ring */}
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-primary/15 animate-[spin_8s_linear_infinite_reverse]" />
            {/* Inner ring */}
            <div className="absolute inset-8 rounded-full border border-primary/10" />
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Search className="h-7 w-7 text-primary" />
                </div>
              </div>
            </div>
            {/* Floating dots */}
            <div
              className="absolute top-2 right-4 w-2 h-2 bg-primary/30 rounded-full animate-bounce"
              style={{ animationDelay: "0ms", animationDuration: "3s" }}
            />
            <div
              className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce"
              style={{ animationDelay: "1s", animationDuration: "4s" }}
            />
            <div
              className="absolute top-10 left-2 w-1 h-1 bg-primary/25 rounded-full animate-bounce"
              style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">Page not found</h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto mb-10">
            It might have been moved, deleted, or perhaps it never existed in the first place.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg min-w-[160px]"
              size="lg"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button
              variant="outline"
              className="min-w-[160px]"
              size="lg"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Quick links */}
          <div className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground mb-5">Or jump to one of your collections</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <QuickLink
                to="/bookmarks"
                icon={<BookmarkIcon className="h-4 w-4" />}
                label="Bookmarks"
              />
              <QuickLink to="/notes" icon={<StickyNote className="h-4 w-4" />} label="Notes" />
              <QuickLink to="/diagrams" icon={<Workflow className="h-4 w-4" />} label="Diagrams" />
              <QuickLink to="/code-snippets" icon={<Code2 className="h-4 w-4" />} label="Code" />
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm transition-all duration-200"
    >
      {icon}
      {label}
    </Link>
  );
}
