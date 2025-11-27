import { AppHeader } from '@/components/shared/app-header';
import { AppFooter } from '@/components/shared/app-footer';
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
  Code2,
  Workflow,
} from 'lucide-react';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const { loading, user } = useAuth();
  return (
    <main className="min-h-screen flex flex-col bg-linear-to-br from-background via-background to-muted/20">
      <AppHeader showNavLinks={!loading && !!user} />

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
              One place for bookmarks, notes, code, and diagrams. Fast,
              beautiful, and always in sync.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 pt-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                asChild
                size="lg"
                className="text-base px-8 py-6 bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Link
                  to={user ? '/bookmarks' : '/auth/sign-up'}
                  className="flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {!user && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6"
                >
                  <Link to="/auth/login">Sign In</Link>
                </Button>
              )}
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
            {/* Bookmarks */}
            <div className="group bg-background/60 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <BookmarkIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Smart Bookmarks
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Save links with auto titles, descriptions, and thumbnails. Find
                anything fast with full-text search.
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
                Write in Markdown with instant preview. Organize ideas without
                friction.
              </p>
            </div>

            {/* Code Snippets */}
            <div className="group bg-background/60 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Code Snippets
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your personal code library. Save and reuse snippets with syntax
                highlighting and one-click copy.
              </p>
            </div>

            {/* Diagrams */}
            <div className="group bg-background/60 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <Workflow className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Visual Diagrams
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Sketch ideas fast. Build flowcharts and architecture diagrams
                with drag-and-drop. Export PNG or PDF.
              </p>
            </div>

            {/* Cross-platform Feature */}
            <div className="group bg-background/60 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Cross-Platform Sync
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Start on your phone, finish on your laptop. Everything syncs
                instantly across mobile, web, and browser extensions. Always up
                to date.
              </p>
            </div>

            {/* Open Source */}
            <div className="group bg-background/60 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <Github className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Open Source
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Open source and privacy-first. Your data, your control. Join us
                on{' '}
                <a
                  href="https://github.com/turbodoc-org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-background via-muted/10 to-background" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Four powerful tools in one
                </span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Your complete digital workspace
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One app, four tools. Bookmark articles, write docs, save code, and
              map ideas — organized and accessible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Bookmarks & Notes */}
            <div className="group bg-linear-to-br from-background via-background to-muted/5 border border-border/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-2xl">
                    <BookmarkIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Bookmarks & Notes
                    </h3>
                    <p className="text-muted-foreground">
                      Save any link with auto metadata, then write rich Markdown
                      — searchable and in sync.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Auto titles, descriptions, and favicons
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Live Markdown preview
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Full-text search across everything
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Snippets */}
            <div className="group bg-linear-to-br from-background via-background to-muted/5 border border-border/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-linear-to-br from-green-500/10 to-emerald-500/10 rounded-2xl">
                    <Code2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Code Snippets
                    </h3>
                    <p className="text-muted-foreground">
                      Your code, organized. Save snippets with language
                      formatting, syntax highlighting, and one-click copy.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Language formatting for 100+ languages
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Beautiful syntax highlighting
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      One-click copy to clipboard
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagrams - Full Width */}
          <div className="bg-linear-to-br from-background via-background to-muted/5 border border-border/50 rounded-2xl p-8 shadow-lg backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-linear-to-br from-orange-500/10 to-red-500/10 rounded-2xl">
                    <Workflow className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Visual Diagrams
                    </h3>
                    <p className="text-muted-foreground">
                      Think visually, work faster. Create flowcharts,
                      wireframes, and architecture diagrams with an intuitive
                      editor. Export high-quality PNG/PDF when you&apos;re ready
                      to share.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Drag-and-drop canvas
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Shapes, connectors, and text
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Auto-routed connections
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Export to high-res PNG or PDF
                    </span>
                  </div>
                </div>

                <Button
                  asChild
                  className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/20"
                >
                  <Link to="/auth/sign-up" className="flex items-center gap-2">
                    Try Diagram Editor
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Visual representation */}
              <div className="flex-1 lg:max-w-md">
                <div className="relative bg-muted/30 rounded-xl p-6 border border-border/30">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-blue-500/20 border-2 border-blue-500/40 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <div className="w-16 h-12 bg-green-500/20 border-2 border-green-500/40 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-px h-8 bg-border" />
                    </div>
                    <div className="flex justify-center">
                      <div className="w-20 h-14 bg-orange-500/20 border-2 border-orange-500/40 rounded-lg flex items-center justify-center transform rotate-45">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browser Extensions Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Save from anywhere
                </span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Browser Extensions for Chrome & Firefox
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Save any webpage instantly while you browse. No context switching,
              no copy-pasting URLs — just one click and it&apos;s saved forever.
            </p>
          </div>

          <div className="relative bg-linear-to-br from-background via-background to-muted/10 border border-border/50 rounded-2xl p-8 md:p-12 shadow-xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-primary/10 to-transparent rounded-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-primary/10 to-transparent rounded-2xl" />

            <div className="relative grid md:grid-cols-2 gap-8">
              {/* Chrome Extension */}
              <div className="group space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-linear-to-br from-red-500/10 to-yellow-500/10 rounded-2xl">
                    <Image
                      src="/chrome.png"
                      alt="Chrome"
                      className="h-10 w-10 object-contain"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      Chrome Extension
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Available on Chrome Web Store
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-primary/10 rounded-full">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      One-click bookmarking from any webpage
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-primary/10 rounded-full">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Auto-fetch titles and metadata
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-primary/10 rounded-full">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Instant sync across all devices
                    </span>
                  </li>
                </ul>

                <Button
                  asChild
                  className="w-full bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
                >
                  <a
                    href="https://chromewebstore.google.com/detail/turbodoc/fjncckldanedaaaoeapkponpplkahbdg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    Install for Chrome
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Firefox Extension */}
              <div className="group space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-linear-to-br from-orange-500/10 to-purple-500/10 rounded-2xl">
                    <Image
                      src="/firefox.png"
                      alt="Firefox"
                      className="h-10 w-10 object-contain"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      Firefox Extension
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Available on Firefox Add-ons
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-primary/10 rounded-full">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      One-click bookmarking from any webpage
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-primary/10 rounded-full">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Auto-fetch titles and metadata
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-primary/10 rounded-full">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Instant sync across all devices
                    </span>
                  </li>
                </ul>

                <Button
                  asChild
                  className="w-full bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
                >
                  <a
                    href="https://addons.mozilla.org/en-US/firefox/addon/turbodoc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    Install for Firefox
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Bottom note */}
            <div className="relative mt-8 pt-8 border-t border-border/30 text-center">
              <p className="text-sm text-muted-foreground">
                Free to install • Lightweight • Privacy-focused
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* iOS App Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Smartphone className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Available Now
                </span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Turbodoc for iPhone & iPad
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your digital life, organized and accessible from anywhere. Stop
              drowning in browser tabs and scattered notes.
            </p>
          </div>

          {/* Main iOS Content Card */}
          <div className="relative bg-linear-to-br from-background via-background to-muted/10 border border-border/50 rounded-2xl p-8 md:p-12 shadow-xl backdrop-blur-sm mb-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-primary/10 to-transparent rounded-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-primary/10 to-transparent rounded-2xl" />

            <div className="relative">
              {/* Header with App Icon and Download */}
              <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 mb-8 pb-8 border-b border-border/30">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-2xl">
                    <svg
                      className="h-12 w-12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      Turbodoc for iOS
                    </h3>
                    <p className="text-muted-foreground">
                      Organize your digital life on the go
                    </p>
                  </div>
                </div>

                <a
                  href="https://apps.apple.com/nl/app/turbodoc/id6749333065"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Image
                    src="/app-store.svg"
                    alt="Download on the App Store"
                    width={160}
                    height={48}
                    className="h-12 w-auto hover:opacity-90 transition-opacity"
                  />
                </a>
              </div>

              {/* Key Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Voice to Text */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-blue-500/10 rounded-lg">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Capture Ideas by Voice
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Record voice notes while walking, driving, or whenever
                        typing isn&apos;t practical. Automatic transcription
                        turns your words into searchable text instantly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image to Text */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-purple-500/10 rounded-lg">
                      <svg
                        className="h-5 w-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Digitize Physical Notes
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Snap photos of whiteboards, book pages, or receipts.
                        Advanced text recognition extracts content you can edit,
                        search, and organize.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Smart Bookmarks */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-green-500/10 rounded-lg">
                      <BookmarkIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Never Lose a Link
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Save websites, articles, and videos from any app.
                        Automatic metadata fetching creates a visual, organized
                        collection you can find in seconds.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Share Extension */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-orange-500/10 rounded-lg">
                      <svg
                        className="h-5 w-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Save from Anywhere
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Use the iOS share sheet to save content from Safari,
                        Instagram, YouTube, or any app. One tap, and it&apos;s
                        saved forever.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Offline First */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-red-500/10 rounded-lg">
                      <svg
                        className="h-5 w-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Works Without Internet
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Access everything offline. Changes sync automatically
                        when you&apos;re back online. Your content is always
                        ready, no matter where you are.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Widgets */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-pink-500/10 rounded-lg">
                      <svg
                        className="h-5 w-5 text-pink-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Home Screen Widgets
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Quick actions right on your home screen. Add bookmarks,
                        create notes, or jump to recent items without opening
                        the app.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshots - Desktop Only */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="flex gap-4 overflow-hidden justify-center items-center">
                    <div className="shrink-0 w-[220px] pb-16">
                      <Image
                        src="/ios/1.png"
                        alt="Turbodoc iOS App - Bookmarks"
                        width={220}
                        height={476}
                        className="rounded-2xl border shadow-2xl border-border dark:border-border/20"
                      />
                    </div>
                    <div className="shrink-0 w-[220px] pb-16">
                      <Image
                        src="/ios/2.png"
                        alt="Turbodoc iOS App - Notes"
                        width={220}
                        height={476}
                        className="rounded-2xl border shadow-2xl border-border dark:border-border/20"
                      />
                    </div>
                    <div className="shrink-0 w-[220px] pb-16">
                      <Image
                        src="/ios/3.png"
                        alt="Turbodoc iOS App - Voice Notes"
                        width={220}
                        height={476}
                        className="rounded-2xl border shadow-2xl border-border dark:border-border/20"
                      />
                    </div>
                    <div className="shrink-0 w-[220px] pb-16">
                      <Image
                        src="/ios/4.png"
                        alt="Turbodoc iOS App - Search"
                        width={220}
                        height={476}
                        className="rounded-2xl border shadow-2xl border-border dark:border-border/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <a
                  href="https://apps.apple.com/nl/app/turbodoc/id6749333065"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Image
                    src="/app-store.svg"
                    alt="Download on the App Store"
                    width={160}
                    height={48}
                    className="h-12 w-auto hover:opacity-90 transition-opacity"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Android Coming Soon - Compact Card */}
          <div className="relative bg-linear-to-br from-background via-background to-muted/5 border border-border/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-linear-to-br from-green-500/10 to-emerald-500/10 rounded-xl">
                  <svg
                    className="h-8 w-8"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.5 11.5 0 0 0-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C2.92 11.03 1 14.22 1 17.8h22c0-3.58-1.92-6.77-5.4-8.32zM8.06 15.2c-.66 0-1.2-.54-1.2-1.2 0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2 0 .66-.54 1.2-1.2 1.2zm7.88 0c-.66 0-1.2-.54-1.2-1.2 0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2 0 .66-.54 1.2-1.2 1.2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Android App
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Coming soon to Google Play Store
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  In Development
                </span>
              </div>
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

      {/* Open Source Contribution Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-background via-muted/10 to-background" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Github className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  100% Open Source
                </span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Built in the open
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every line of code is open source. Contribute on GitHub and help
              us build the best content organizer out there.
            </p>
          </div>

          <div className="relative bg-linear-to-br from-background via-background to-muted/10 border border-border/50 rounded-2xl p-8 md:p-12 shadow-xl backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-bl from-primary/10 to-transparent rounded-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-linear-to-tr from-primary/10 to-transparent rounded-2xl" />

            <div className="relative grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Github className="h-5 w-5 text-primary" />
                    Why contribute?
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      <span className="text-muted-foreground">
                        Learn modern tech: React, TypeScript, TanStack, Supabase
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      <span className="text-muted-foreground">
                        Build features used by thousands of people
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      <span className="text-muted-foreground">
                        Join a welcoming community of makers
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      <span className="text-muted-foreground">
                        Get credit for your work in a real product
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    All repositories
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      <span className="text-muted-foreground">
                        Web app (React, TypeScript, TanStack)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      <span className="text-muted-foreground">
                        API (Cloudflare Workers, Hono)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      <span className="text-muted-foreground">
                        Browser extensions (Chrome, Firefox)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                      <span className="text-muted-foreground">
                        iOS and Android apps (native Swift & Kotlin - coming
                        soon)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-border/30">
              <Button
                asChild
                size="lg"
                className="bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
              >
                <a
                  href="https://github.com/turbodoc-org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-5 w-5" />
                  View on GitHub
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">
                Star • Fork • Submit PRs • Report issues
              </p>
            </div>
          </div>
        </div>
      </section>

      <AppFooter />
    </main>
  );
}
