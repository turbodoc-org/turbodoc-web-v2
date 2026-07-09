import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleLayout, ArticleSection, ArticleCode } from "@/components/shared/article-layout";

export const Route = createFileRoute("/docs/api")({
  head: () => ({
    meta: [
      { title: "REST API - Turbodoc Developer Docs" },
      {
        name: "description",
        content:
          "Overview of the Turbodoc REST API: authentication, resources (bookmarks, notes, code snippets, diagrams, tags), and the OpenAPI specification.",
      },
    ],
    links: [{ rel: "canonical", href: "https://turbodoc.ai/docs/api" }],
  }),
  component: ApiDocs,
});

function ApiDocs() {
  return (
    <ArticleLayout
      eyebrow="Developers"
      title="The Turbodoc REST API"
      intro="The same API that powers the Turbodoc web app, iOS app, and browser extensions is documented and open. Everything Turbodoc does, your code can do too."
    >
      <ArticleSection title="Base URL and spec">
        <ArticleCode>https://api.turbodoc.ai</ArticleCode>
        <p>
          The full, machine-readable OpenAPI specification lives at{" "}
          <a
            href="https://api.turbodoc.ai/swagger.json"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            /swagger.json
          </a>
          , with interactive documentation at{" "}
          <a
            href="https://api.turbodoc.ai/swagger"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            /swagger
          </a>
          .
        </p>
      </ArticleSection>

      <ArticleSection title="Authentication">
        <p>
          All endpoints (except the public contact form) require a Supabase Auth JWT, sent as a
          bearer token:
        </p>
        <ArticleCode>{`Authorization: Bearer <your-supabase-jwt>`}</ArticleCode>
        <p>
          Tokens are issued when a user signs in to Turbodoc. If you're building an AI-assistant
          integration, you likely don't need to handle tokens at all — use the{" "}
          <Link to="/docs/mcp" className="text-primary hover:underline">
            MCP server
          </Link>{" "}
          instead, which wraps the same functionality behind OAuth 2.0.
        </p>
      </ArticleSection>

      <ArticleSection title="Resources">
        <ul className="list-disc list-inside space-y-2">
          <li>
            <code className="text-foreground">/v1/bookmarks</code> — CRUD, full-text search, batch
            operations (up to 100), and Open Graph metadata fetching.
          </li>
          <li>
            <code className="text-foreground">/v1/notes</code> — markdown notes with optimistic
            locking, batch operations, and audio transcription.
          </li>
          <li>
            <code className="text-foreground">/v1/code-snippets</code> — snippets with language,
            theme, and styling metadata.
          </li>
          <li>
            <code className="text-foreground">/v1/diagrams</code> — canvas and Mermaid diagrams,
            including duplication.
          </li>
          <li>
            <code className="text-foreground">/v1/tags</code> — most-used bookmark tags with counts.
          </li>
        </ul>
      </ArticleSection>

      <ArticleSection title="Example: create a bookmark">
        <ArticleCode>{`curl -X POST https://api.turbodoc.ai/v1/bookmarks \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/article",
    "title": "An interesting article",
    "tags": "reading|ai",
    "status": "unread"
  }'`}</ArticleCode>
      </ArticleSection>

      <ArticleSection title="Open source">
        <p>
          The API is a Cloudflare Worker built with Hono, and the entire codebase — API, web app,
          iOS app, and browser extensions — is open source at{" "}
          <a
            href="https://github.com/turbodoc-org"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/turbodoc-org
          </a>
          . Issues and pull requests welcome.
        </p>
      </ArticleSection>
    </ArticleLayout>
  );
}
