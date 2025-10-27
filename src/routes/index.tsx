import { AuthButton } from '@/components/auth-button';
import { Logo } from '@/components/logo';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import {
  Sparkles,
  ArrowRight,
  BookmarkIcon,
  Github,
  Linkedin,
  Twitter,
  StickyNote,
  Smartphone,
} from 'lucide-react';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const { loading, user } = useAuth();
  return (
    <main className="min-h-screen flex flex-col bg-linear-to-br from-background via-background to-muted/20">
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-3 md:p-4 px-4 md:px-6">
          <div className="flex items-center gap-4 md:gap-6">
            <Logo size="md" />
            {!loading && user && (
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
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <StickyNote className="h-4 w-4" />
                  Notes
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

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-primary/5 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse delay-1000" />

        <div className="relative text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Beautiful • Fast • Open Source
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
              Save, organize, and access your content
              <span className="bg-linear-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                {' '}
                everywhere
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Turbodoc is a fast, beautiful bookmark and note manager for iOS
              and web. Keep your favorite links and markdown notes synchronized
              across all your devices.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 pt-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                asChild
                size="lg"
                className="text-base px-8 py-6 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Link to="/auth/sign-up" className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 border-border/50 hover:border-primary/50 hover:text-black transition-all duration-200"
              >
                <Link to="/auth/login">Sign In</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <span>✨</span> Free to use (while in beta)
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-linear-to-b from-muted/20 via-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything you need to stay organized
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you save, organize, and access
              your content effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Open Source */}
            <div className="group bg-background/60 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <BookmarkIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Proudly Open Source
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Turbodoc is built with love and transparency. Contribute to the
                project on GitHub and help shape its future.
              </p>
            </div>

            {/* Notes Feature */}
            <div className="group bg-background/60 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <StickyNote className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Markdown Notes
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Write beautiful notes with markdown support, real-time preview,
                and powerful organization features.
              </p>
            </div>

            {/* Cross-platform Feature */}
            <div className="group bg-background/60 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Cross-Platform
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Access your bookmarks and notes seamlessly across iOS, web, and
                browser extensions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Note Section */}
      <section className="py-16 md:py-24 relative">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative bg-linear-to-br from-background via-background to-muted/10 border border-border/50 rounded-2xl p-8 md:p-12 shadow-lg backdrop-blur-sm">
            {/* Subtle decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-primary/5 to-transparent rounded-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-primary/5 to-transparent rounded-2xl" />

            <div className="relative space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">
                Why I Built Turbodoc
              </h2>

              <div className="prose prose-lg max-w-none text-foreground space-y-6">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Like many of you, I found myself drowning in digital chaos.
                  Browser bookmarks scattered across different devices,
                  important links buried in random folders, and notes written on
                  whatever app was convenient at the moment.
                </p>

                <p className="text-lg leading-relaxed text-muted-foreground">
                  I tried everything - bookmark managers that were too
                  complicated, note apps that didn&apos;t sync properly, and
                  solutions that required me to change my entire workflow.
                  Nothing felt right. I wanted something simple yet powerful,
                  something that worked seamlessly across all my devices without
                  getting in my way.
                </p>

                <p className="text-lg leading-relaxed text-foreground font-medium">
                  So I built Turbodoc. Not because the world needed another
                  productivity app, but because I needed a tool that understood
                  how I actually work. A place where I could save that
                  interesting article I found at 2 AM, jot down quick thoughts
                  in markdown, and find everything instantly when I needed it.
                </p>

                <p className="text-lg leading-relaxed text-muted-foreground">
                  Turbodoc is for people who love saving things but hate losing
                  them. It&apos;s for those who appreciate beautiful design but
                  need rock-solid functionality. It&apos;s for anyone who
                  believes that organizing your digital life shouldn&apos;t be a
                  full-time job.
                </p>

                <p className="text-lg leading-relaxed font-medium text-primary my-0">
                  I hope it helps you stay organized and focused on what matters
                  most.
                </p>
              </div>

              {/* Profile section */}
              <div className="pt-8 border-t border-border/30">
                <div className="flex flex-col items-center space-y-6">
                  {/* Profile picture with subtle glow */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-primary/10 rounded-full blur-lg" />
                    <Image
                      src="/pic.jpg"
                      alt="Nico Botha"
                      width={80}
                      height={80}
                      className="relative rounded-full border-2 border-primary/20 shadow-lg"
                    />
                  </div>

                  {/* Social links with improved styling */}
                  <div className="flex items-center gap-3">
                    <a
                      href="https://x.com/nwbotha"
                      className="group text-muted-foreground hover:text-primary transition-all duration-200 p-3 hover:bg-primary/10 rounded-xl border border-transparent hover:border-primary/20"
                      aria-label="Twitter"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/nico-botha/"
                      className="group text-muted-foreground hover:text-primary transition-all duration-200 p-3 hover:bg-primary/10 rounded-xl border border-transparent hover:border-primary/20"
                      aria-label="LinkedIn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    </a>
                    <a
                      href="https://github.com/Ngineer101"
                      className="group text-muted-foreground hover:text-primary transition-all duration-200 p-3 hover:bg-primary/10 rounded-xl border border-transparent hover:border-primary/20"
                      aria-label="GitHub"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    </a>
                  </div>

                  {/* Signature */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground italic font-medium">
                      — Nico, Creator of Turbodoc
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-linear-to-t from-muted/40 to-muted/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-sm text-muted-foreground">
                © 2025 Turbodoc. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-8">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
