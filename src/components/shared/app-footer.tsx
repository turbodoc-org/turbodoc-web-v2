import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { GithubIcon } from "@/components/shared/brand-icons";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { to: "/", label: "Home" },
      { to: "/mcp", label: "MCP Server" },
      { to: "/docs", label: "Docs" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Use cases",
    links: [
      { to: "/use-cases/agent-memory", label: "Agent memory" },
      { to: "/use-cases/knowledge-base", label: "Knowledge base" },
      { to: "/use-cases/save-from-ai-chats", label: "Save from AI chats" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
] as const;

export function AppFooter() {
  return (
    <footer className="border-t border-border/50 bg-linear-to-t from-muted/40 to-muted/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          {/* Brand */}
          <div className="md:max-w-xs space-y-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Turbodoc logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg shadow-sm"
              />
              <span className="text-lg font-bold text-foreground tracking-tight">Turbodoc</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bookmarks, notes, code, and diagrams — one knowledge base for you and your AI agents.
            </p>
            <a
              href="https://github.com/turbodoc-org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <GithubIcon className="h-4 w-4" />
              Open source on GitHub
            </a>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <div className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-4">
                  {column.heading}
                </div>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col-reverse sm:flex-row items-center sm:justify-between gap-3 text-center sm:text-left">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Turbodoc. All rights reserved.
          </div>
          <div className="text-sm text-muted-foreground">
            Free &amp; open source <span className="mx-1.5 text-border">·</span>
            <Link to="/mcp" className="hover:text-foreground transition-colors duration-200">
              Works with Claude &amp; MCP
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
