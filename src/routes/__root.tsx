import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth/context";
import { NotFoundPage } from "@/components/shared/not-found";
import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export const Route = createRootRoute({
  notFoundComponent: NotFoundPage,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Turbodoc - Save and organize your content",
      },
      {
        name: "description",
        content:
          "A fast, beautiful bookmark manager for iOS and web. Save, organize, and search through your favorite links from anywhere.",
      },
      { name: "theme-color", content: "#0a0a0a" },
      { property: "og:site_name", content: "Turbodoc" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Turbodoc - Save and organize your content" },
      {
        property: "og:description",
        content:
          "One place for bookmarks, notes, code, and diagrams — for you and your AI agents. Fast, open source, and always in sync.",
      },
      { property: "og:url", content: "https://turbodoc.ai/" },
      { property: "og:image", content: "https://turbodoc.ai/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Turbodoc - Save and organize your content" },
      {
        name: "twitter:description",
        content:
          "One place for bookmarks, notes, code, and diagrams — for you and your AI agents. Fast, open source, and always in sync.",
      },
      { name: "twitter:image", content: "https://turbodoc.ai/og.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: import.meta.env.VITE_CF_ANALYTICS_TOKEN
      ? [
          {
            src: "https://static.cloudflareinsights.com/beacon.min.js",
            defer: true,
            "data-cf-beacon": JSON.stringify({
              token: import.meta.env.VITE_CF_ANALYTICS_TOKEN,
            }),
          },
        ]
      : [],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>{children}</AuthProvider>
            <Scripts />
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
