import { AppHeader } from '@/components/app-header';
import { Logo } from '@/components/logo';
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
                className="text-base px-8 py-6"
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
              One click to save any webpage. Install our browser extension and
              bookmark content instantly without leaving your browser.
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
                Free to install • Lightweight • Privacy-focused • Works offline
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
