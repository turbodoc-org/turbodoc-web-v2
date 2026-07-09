import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/shared/app-header";
import { AppFooter } from "@/components/shared/app-footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { ArrowRight, Bot, Lock, Zap } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";

const MCP_ENDPOINT = "https://api.turbodoc.ai/mcp";

const TOOL_GROUPS: { group: string; tools: { name: string; description: string }[] }[] = [
  {
    group: "Bookmarks",
    tools: [
      { name: "list_bookmarks", description: "List bookmarks with filters and sorting." },
      { name: "get_bookmark", description: "Get one bookmark by ID." },
      { name: "search_bookmarks", description: "Search bookmarks by title, URL, or tags." },
      {
        name: "create_bookmark",
        description: "Create a bookmark and enqueue content processing.",
      },
      { name: "update_bookmark", description: "Update a bookmark's fields, tags, or status." },
      { name: "delete_bookmark", description: "Delete one bookmark by ID." },
      {
        name: "batch_bookmarks",
        description: "Run up to 100 bookmark operations in one call.",
      },
      {
        name: "get_bookmark_og_image",
        description: "Fetch Open Graph image and title metadata for a URL.",
      },
    ],
  },
  {
    group: "Notes",
    tools: [
      { name: "list_notes", description: "List notes with search, filters, and pagination." },
      { name: "get_note", description: "Get one note by ID." },
      { name: "create_note", description: "Create a markdown note." },
      { name: "update_note", description: "Update a note with optimistic locking." },
      { name: "delete_note", description: "Delete one note by ID." },
      { name: "batch_notes", description: "Run up to 100 note operations in one call." },
    ],
  },
  {
    group: "Code snippets",
    tools: [
      { name: "list_code_snippets", description: "List saved code snippets." },
      { name: "get_code_snippet", description: "Get one code snippet by ID." },
      {
        name: "create_code_snippet",
        description: "Save a snippet with language and styling options.",
      },
      { name: "update_code_snippet", description: "Update a code snippet." },
      { name: "delete_code_snippet", description: "Delete one code snippet by ID." },
    ],
  },
  {
    group: "Diagrams",
    tools: [
      { name: "list_diagrams", description: "List canvas and Mermaid diagrams." },
      { name: "get_diagram", description: "Get one diagram by ID." },
      { name: "create_diagram", description: "Create a canvas or Mermaid diagram." },
      { name: "update_diagram", description: "Update a canvas or Mermaid diagram." },
      { name: "delete_diagram", description: "Delete one diagram by ID." },
      { name: "duplicate_diagram", description: "Duplicate an existing diagram." },
    ],
  },
  {
    group: "Tags",
    tools: [{ name: "list_tags", description: "List your most-used bookmark tags with counts." }],
  },
];

const FAQ = [
  {
    q: "What is the Turbodoc MCP server?",
    a: "It's a hosted Model Context Protocol server at https://api.turbodoc.ai/mcp that lets AI assistants like Claude, Cursor, and VS Code read and write your Turbodoc library — bookmarks, notes, code snippets, and diagrams — on your behalf.",
  },
  {
    q: "Do I need an API key?",
    a: "No. The server uses OAuth 2.0. The first time your assistant connects, you'll be redirected to sign in with your Turbodoc account and approve access. There are no keys to create, rotate, or leak.",
  },
  {
    q: "Which AI tools are supported?",
    a: "Any MCP client that supports remote servers over Streamable HTTP: Claude (web and desktop), Claude Code, Cursor, VS Code, Windsurf, and others.",
  },
  {
    q: "Is it free?",
    a: "Yes — Turbodoc, including the MCP server, is free while in beta. The entire product is open source at github.com/turbodoc-org.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const Route = createFileRoute("/mcp")({
  head: () => ({
    meta: [
      {
        title: "Turbodoc MCP Server - Connect Claude, Cursor & any AI agent to your bookmarks",
      },
      {
        name: "description",
        content:
          "Turbodoc's hosted MCP server gives AI assistants 22 tools to save, search, and organize your bookmarks, notes, code snippets, and diagrams. OAuth 2.0, no API keys. Works with Claude, Claude Code, Cursor, VS Code, and Windsurf.",
      },
      { property: "og:title", content: "Turbodoc MCP Server" },
      {
        property: "og:description",
        content:
          "Give Claude, Cursor, or any MCP client full access to your bookmarks, notes, code snippets, and diagrams.",
      },
      { property: "og:url", content: "https://turbodoc.ai/mcp" },
    ],
    links: [{ rel: "canonical", href: "https://turbodoc.ai/mcp" }],
  }),
  component: McpPage,
});

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted/40 border border-border/40 rounded-xl p-4 overflow-x-auto">
      <code className="text-sm text-foreground">{children}</code>
    </pre>
  );
}

function McpPage() {
  const { loading, user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <JsonLd data={faqSchema} />
      <AppHeader showNavLinks={!loading && !!user} />

      {/* Hero */}
      <section className="relative px-4 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Model Context Protocol</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
            Your knowledge base, in every AI conversation
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Turbodoc ships a hosted MCP server with 22 tools. Connect Claude, Cursor, or any
            MCP-compatible assistant and let it save, search, and organize your bookmarks, notes,
            code snippets, and diagrams.
          </p>
          <div className="max-w-2xl mx-auto text-left">
            <CodeBlock>{MCP_ENDPOINT}</CodeBlock>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg">
              <Link to={user ? "/dashboard" : "/auth/sign-up"} className="flex items-center gap-2">
                Create a free account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/docs/mcp">Read the setup guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border/50 rounded-xl p-6 space-y-2">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Agent memory that you own</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ask your assistant to remember a link, a snippet, or a decision — it lands in your
              Turbodoc library, readable by you on web, iOS, and browser extensions, and by any
              other agent you connect.
            </p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-6 space-y-2">
            <Bot className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Full read-write access</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Not just search: create, update, batch-edit, and delete across all four content types.
              Your assistant can triage your reading list or file notes while you talk.
            </p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-6 space-y-2">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">OAuth 2.0, no API keys</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in with your Turbodoc account when your client connects. Access is scoped to your
              data and revocable — nothing to paste into config files.
            </p>
          </div>
        </div>
      </section>

      {/* Setup */}
      <section className="px-4 py-12" id="setup">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-foreground">Connect your client</h2>
            <p className="text-muted-foreground">
              Every client below prompts you to sign in with your Turbodoc account on first use.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border/50 rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Claude (web & desktop)</h3>
              <p className="text-sm text-muted-foreground">
                Go to{" "}
                <span className="font-medium text-foreground">
                  Settings → Connectors → Add custom connector
                </span>{" "}
                and paste the endpoint URL:
              </p>
              <CodeBlock>{MCP_ENDPOINT}</CodeBlock>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Claude Code</h3>
              <p className="text-sm text-muted-foreground">
                Run this in your terminal, then use <code className="text-foreground">/mcp</code> to
                authenticate:
              </p>
              <CodeBlock>{`claude mcp add --transport http turbodoc ${MCP_ENDPOINT}`}</CodeBlock>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Cursor</h3>
              <p className="text-sm text-muted-foreground">
                Add this to <code className="text-foreground">~/.cursor/mcp.json</code> (or via{" "}
                <span className="font-medium text-foreground">Settings → MCP</span>):
              </p>
              <CodeBlock>{`{
  "mcpServers": {
    "turbodoc": {
      "url": "${MCP_ENDPOINT}"
    }
  }
}`}</CodeBlock>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground">VS Code</h3>
              <p className="text-sm text-muted-foreground">
                Run the <span className="font-medium text-foreground">MCP: Add Server</span>{" "}
                command, choose HTTP, and use the endpoint URL — or add to{" "}
                <code className="text-foreground">.vscode/mcp.json</code>:
              </p>
              <CodeBlock>{`{
  "servers": {
    "turbodoc": {
      "type": "http",
      "url": "${MCP_ENDPOINT}"
    }
  }
}`}</CodeBlock>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Windsurf</h3>
              <p className="text-sm text-muted-foreground">
                Add this to{" "}
                <code className="text-foreground">~/.codeium/windsurf/mcp_config.json</code>:
              </p>
              <CodeBlock>{`{
  "mcpServers": {
    "turbodoc": {
      "serverUrl": "${MCP_ENDPOINT}"
    }
  }
}`}</CodeBlock>
            </div>
          </div>
        </div>
      </section>

      {/* Tool catalog */}
      <section className="px-4 py-12" id="tools">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-foreground">All 22 tools</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything your assistant can do with your library. Tools operate only on your own
              data, authenticated via OAuth.
            </p>
          </div>

          <div className="space-y-8">
            {TOOL_GROUPS.map((group) => (
              <div key={group.group}>
                <h3 className="text-xl font-semibold text-foreground mb-4">{group.group}</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {group.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="bg-card border border-border/50 rounded-lg p-4 flex flex-col gap-1"
                    >
                      <code className="text-sm font-semibold text-primary">{tool.name}</code>
                      <span className="text-sm text-muted-foreground">{tool.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example prompts */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-foreground text-center">Things to try</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Save this article to Turbodoc and tag it 'ai-research'.",
              "What did I bookmark about TypeScript last month?",
              "Turn our discussion into a markdown note in Turbodoc.",
              "Save this SQL query as a code snippet called 'monthly cohorts'.",
              "Create a Mermaid diagram of this architecture and store it.",
              "Go through my unread bookmarks and archive anything older than a year.",
            ].map((prompt) => (
              <div
                key={prompt}
                className="bg-muted/30 border border-border/40 rounded-lg p-4 text-sm text-muted-foreground italic"
              >
                “{prompt}”
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-foreground text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Give your assistant a memory worth keeping
          </h2>
          <p className="text-muted-foreground">
            Free while in beta. Open source. Works on web, iOS, Chrome, and Firefox.
          </p>
          <Button asChild size="lg">
            <Link to={user ? "/dashboard" : "/auth/sign-up"} className="flex items-center gap-2">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
