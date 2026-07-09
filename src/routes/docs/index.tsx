import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleLayout } from "@/components/shared/article-layout";

const PAGES = [
  {
    to: "/docs/mcp",
    title: "MCP setup guide",
    description:
      "Connect Claude, Claude Code, Cursor, VS Code, or Windsurf to your Turbodoc library, step by step.",
  },
  {
    to: "/docs/api",
    title: "REST API",
    description: "Build on the Turbodoc API: authentication, endpoints, and the OpenAPI spec.",
  },
  {
    to: "/mcp",
    title: "MCP server overview",
    description: "What the Turbodoc MCP server is, all 22 tools, and why it exists.",
  },
  {
    to: "/use-cases/agent-memory",
    title: "Use case: agent memory",
    description: "Give AI agents a persistent, user-owned memory store.",
  },
  {
    to: "/use-cases/knowledge-base",
    title: "Use case: personal knowledge base",
    description: "One searchable library for links, notes, code, and diagrams.",
  },
  {
    to: "/use-cases/save-from-ai-chats",
    title: "Use case: save from AI chats",
    description: "Capture links, notes, and code directly from Claude or ChatGPT conversations.",
  },
] as const;

export const Route = createFileRoute("/docs/")({
  head: () => ({
    meta: [
      { title: "Documentation - Turbodoc" },
      {
        name: "description",
        content:
          "Guides for Turbodoc: connect AI assistants via MCP, use the REST API, and get the most out of your knowledge base.",
      },
    ],
    links: [{ rel: "canonical", href: "https://turbodoc.ai/docs" }],
  }),
  component: DocsIndex,
});

function DocsIndex() {
  return (
    <ArticleLayout
      eyebrow="Documentation"
      title="Turbodoc docs"
      intro="Everything you need to use Turbodoc from the apps, from your AI assistant, or from your own code."
    >
      <div className="grid gap-4">
        {PAGES.map((page) => (
          <Link
            key={page.to}
            to={page.to}
            className="group bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200"
          >
            <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
              {page.title}
            </h2>
            <p className="text-sm text-muted-foreground">{page.description}</p>
          </Link>
        ))}
        <a
          href="https://api.turbodoc.ai/swagger"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200"
        >
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
            API reference (Swagger)
          </h2>
          <p className="text-sm text-muted-foreground">
            Interactive OpenAPI documentation for every endpoint.
          </p>
        </a>
      </div>
    </ArticleLayout>
  );
}
