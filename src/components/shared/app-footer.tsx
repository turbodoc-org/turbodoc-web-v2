import { Link } from "@tanstack/react-router";

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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1 space-y-2">
            <div className="text-base font-semibold text-foreground">Turbodoc</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bookmarks, notes, code, and diagrams — for you and your AI agents.
            </p>
            <a
              href="https://github.com/turbodoc-org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Open source on GitHub
            </a>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <div className="text-sm font-semibold text-foreground mb-3">{column.heading}</div>
              <ul className="space-y-2">
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
        <div className="pt-6 border-t border-border/30 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Turbodoc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
