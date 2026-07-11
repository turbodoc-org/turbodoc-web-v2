import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleLayout, ArticleSection, ArticleCode } from "@/components/shared/article-layout";
import { JsonLd } from "@/components/shared/json-ld";

const MCP_ENDPOINT = "https://api.turbodoc.ai/mcp";

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to connect an AI assistant to Turbodoc via MCP",
  description:
    "Connect Claude, Claude Code, Cursor, VS Code, or Windsurf to your Turbodoc bookmarks, notes, code snippets, and diagrams using the hosted MCP server.",
  step: [
    {
      "@type": "HowToStep",
      name: "Create a Turbodoc account",
      text: "Sign up for free at turbodoc.ai.",
    },
    {
      "@type": "HowToStep",
      name: "Add the MCP server to your client",
      text: "Add https://api.turbodoc.ai/mcp as a remote MCP server (Streamable HTTP) in Claude, Claude Code, Cursor, VS Code, or Windsurf.",
    },
    {
      "@type": "HowToStep",
      name: "Authenticate with OAuth",
      text: "When the client connects for the first time, sign in with your Turbodoc account and approve access.",
    },
    {
      "@type": "HowToStep",
      name: "Start prompting",
      text: "Ask your assistant to save bookmarks, write notes, store code snippets, or create diagrams in Turbodoc.",
    },
  ],
};

export const Route = createFileRoute("/docs/mcp")({
  head: () => ({
    meta: [
      { title: "MCP Setup Guide - Connect Claude, Cursor & VS Code to Turbodoc" },
      {
        name: "description",
        content:
          "Step-by-step guide to connecting Claude, Claude Code, Cursor, VS Code, and Windsurf to Turbodoc's hosted MCP server, with troubleshooting and example prompts.",
      },
    ],
    links: [{ rel: "canonical", href: "https://turbodoc.ai/docs/mcp" }],
  }),
  component: McpGuide,
});

function McpGuide() {
  return (
    <ArticleLayout
      eyebrow="Guide"
      title="Connect your AI assistant to Turbodoc"
      intro="Turbodoc exposes your entire library — bookmarks, notes, code snippets, and diagrams — through a hosted MCP (Model Context Protocol) server. This guide walks through setup for each major client."
      ctaLabel="Create your free account"
    >
      <JsonLd data={howToSchema} />

      <ArticleSection title="Before you start">
        <p>
          You need a free Turbodoc account —{" "}
          <Link to="/auth/sign-up" className="text-primary hover:underline">
            sign up here
          </Link>
          . That's it. Authentication happens through OAuth 2.0: the first time your client
          connects, a browser window opens where you sign in and approve access. There are no API
          keys.
        </p>
        <p>The server endpoint for every client is:</p>
        <ArticleCode>{MCP_ENDPOINT}</ArticleCode>
      </ArticleSection>

      <ArticleSection title="Claude (web and desktop)">
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Open <strong className="text-foreground">Settings → Connectors</strong>.
          </li>
          <li>
            Click <strong className="text-foreground">Add custom connector</strong>.
          </li>
          <li>
            Name it <em>Turbodoc</em> and paste the endpoint URL above.
          </li>
          <li>Click connect and sign in with your Turbodoc account when prompted.</li>
        </ol>
        <p>
          Turbodoc tools then appear in Claude's tool menu for every conversation where the
          connector is enabled.
        </p>
      </ArticleSection>

      <ArticleSection title="Claude Code">
        <p>Run this in your terminal:</p>
        <ArticleCode>{`claude mcp add --transport http turbodoc ${MCP_ENDPOINT}`}</ArticleCode>
        <p>
          Then inside a Claude Code session, run <code className="text-foreground">/mcp</code> and
          follow the authentication prompt. Add{" "}
          <code className="text-foreground">--scope user</code> to the command above to make the
          server available in every project.
        </p>
      </ArticleSection>

      <ArticleSection title="Cursor">
        <p>
          Add this to <code className="text-foreground">~/.cursor/mcp.json</code> (global) or{" "}
          <code className="text-foreground">.cursor/mcp.json</code> in a project:
        </p>
        <ArticleCode>{`{
  "mcpServers": {
    "turbodoc": {
      "url": "${MCP_ENDPOINT}"
    }
  }
}`}</ArticleCode>
        <p>
          Cursor detects the change, shows Turbodoc under{" "}
          <strong className="text-foreground">Settings → MCP</strong>, and opens the OAuth sign-in
          when the server is first used.
        </p>
      </ArticleSection>

      <ArticleSection title="VS Code">
        <p>
          Run the <strong className="text-foreground">MCP: Add Server</strong> command from the
          command palette, choose <em>HTTP</em>, and paste the endpoint. Or add it to{" "}
          <code className="text-foreground">.vscode/mcp.json</code>:
        </p>
        <ArticleCode>{`{
  "servers": {
    "turbodoc": {
      "type": "http",
      "url": "${MCP_ENDPOINT}"
    }
  }
}`}</ArticleCode>
      </ArticleSection>

      <ArticleSection title="Windsurf">
        <p>
          Add this to <code className="text-foreground">~/.codeium/windsurf/mcp_config.json</code>:
        </p>
        <ArticleCode>{`{
  "mcpServers": {
    "turbodoc": {
      "serverUrl": "${MCP_ENDPOINT}"
    }
  }
}`}</ArticleCode>
      </ArticleSection>

      <ArticleSection title="Example prompts">
        <ul className="list-disc list-inside space-y-2">
          <li>“Save this article to Turbodoc and tag it with 'design-systems'.”</li>
          <li>“What did I bookmark about Postgres in the last three months?”</li>
          <li>“Summarize our conversation and store it as a note called 'Q3 planning'.”</li>
          <li>“Save this function as a code snippet, language TypeScript.”</li>
          <li>“Create a Mermaid sequence diagram of this flow and save it to my diagrams.”</li>
          <li>“List my unread bookmarks and archive the ones about tools I no longer use.”</li>
        </ul>
      </ArticleSection>

      <ArticleSection title="Troubleshooting">
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-foreground">Authentication loop or 401 errors:</strong> remove
            the server from your client, re-add it, and complete the OAuth flow again to refresh
            tokens.
          </li>
          <li>
            <strong className="text-foreground">Client doesn't support remote servers:</strong>{" "}
            Turbodoc uses Streamable HTTP transport. Older clients that only support stdio servers
            can bridge with <code className="text-foreground">npx mcp-remote {MCP_ENDPOINT}</code>.
          </li>
          <li>
            <strong className="text-foreground">Tools not appearing:</strong> make sure the
            connector/server is enabled for the current conversation or workspace, then start a new
            conversation.
          </li>
          <li>
            Still stuck?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact us
            </Link>{" "}
            — we read everything.
          </li>
        </ul>
      </ArticleSection>

      <ArticleSection title="What your assistant can do">
        <p>
          The server exposes 22 tools covering full create, read, update, and delete operations on
          bookmarks, notes, code snippets, and diagrams, plus tag listing and batch operations. See
          the{" "}
          <Link to="/mcp" className="text-primary hover:underline">
            complete tool catalog
          </Link>
          .
        </p>
      </ArticleSection>
    </ArticleLayout>
  );
}
