import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/shared/app-header";
import { AppFooter } from "@/components/shared/app-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";

interface ArticleLayoutProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  ctaLabel?: string;
}

export function ArticleLayout({ eyebrow, title, intro, children, ctaLabel }: ArticleLayoutProps) {
  const { loading, user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader showNavLinks={!loading && !!user} />
      <div className="flex-1 container max-w-3xl mx-auto px-4 py-12 md:py-16">
        <header className="mb-10">
          {eyebrow && (
            <p className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            {title}
          </h1>
          {intro && <p className="text-lg text-muted-foreground leading-relaxed">{intro}</p>}
        </header>

        <div className="space-y-8">{children}</div>

        <div className="mt-14 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Turbodoc is free while in beta — and 100% open source.
          </p>
          <Button asChild>
            <Link to={user ? "/dashboard" : "/auth/sign-up"} className="flex items-center gap-2">
              {ctaLabel ?? "Get started free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

export function ArticleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export function ArticleCode({ children }: { children: string }) {
  return (
    <pre className="bg-muted/40 border border-border/40 rounded-xl p-4 overflow-x-auto">
      <code className="text-sm text-foreground">{children}</code>
    </pre>
  );
}
