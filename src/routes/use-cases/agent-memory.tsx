import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleLayout, ArticleSection, ArticleCode } from "@/components/shared/article-layout";
import { JsonLd } from "@/components/shared/json-ld";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Persistent memory for AI agents with Turbodoc and MCP",
  description:
    "How to give AI agents a persistent, user-owned memory store using Turbodoc's hosted MCP server: bookmarks, notes, code snippets, and diagrams that survive across sessions and tools.",
  author: { "@type": "Organization", name: "Turbodoc" },
  publisher: { "@type": "Organization", name: "Turbodoc", url: "https://turbodoc.ai" },
};

export const Route = createFileRoute("/use-cases/agent-memory")({
  head: () => ({
    meta: [
      { title: "Persistent Memory for AI Agents - Turbodoc MCP" },
      {
        name: "description",
        content:
          "Give your AI agents a persistent, user-owned memory store. Turbodoc's MCP server lets Claude, Cursor, and any agent save and recall bookmarks, notes, code, and diagrams across sessions and tools.",
      },
    ],
    links: [{ rel: "canonical", href: "https://turbodoc.ai/use-cases/agent-memory" }],
  }),
  component: AgentMemory,
});

function AgentMemory() {
  return (
    <ArticleLayout
      eyebrow="Use case"
      title="Persistent memory for AI agents"
      intro="Every AI conversation starts from zero. Turbodoc gives your agents a durable, user-owned place to store what matters — so what one session learns, every future session can use."
      ctaLabel="Set up agent memory"
    >
      <JsonLd data={articleSchema} />

      <ArticleSection title="The problem: agents forget everything">
        <p>
          LLM context windows end. Sessions expire. The research your assistant did on Monday is
          gone by Tuesday, and each new chat re-explains the same preferences, links, and decisions.
          Most "memory" features are locked inside one vendor's product: what Claude remembers,
          Cursor can't see, and you can't browse, edit, or export any of it.
        </p>
      </ArticleSection>

      <ArticleSection title="The fix: a shared store both you and your agents own">
        <p>
          Turbodoc is a knowledge base with a hosted{" "}
          <Link to="/mcp" className="text-primary hover:underline">
            MCP server
          </Link>
          . Any MCP-compatible agent — Claude, Claude Code, Cursor, VS Code, Windsurf — gets 22
          tools to create, search, update, and organize four content types:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-foreground">Bookmarks</strong> — every source an agent finds,
            with tags, read status, and automatic metadata.
          </li>
          <li>
            <strong className="text-foreground">Notes</strong> — markdown summaries, decisions, and
            long-term context an agent should recall later.
          </li>
          <li>
            <strong className="text-foreground">Code snippets</strong> — reusable functions,
            configs, and commands with syntax highlighting.
          </li>
          <li>
            <strong className="text-foreground">Diagrams</strong> — Mermaid diagrams an agent can
            generate to document an architecture or flow.
          </li>
        </ul>
        <p>
          Because the store lives outside any single AI product, it's shared memory: your coding
          agent saves a snippet, your chat assistant recalls it next week, and you can read and edit
          all of it in the Turbodoc apps on web and iOS.
        </p>
      </ArticleSection>

      <ArticleSection title="How it works in practice">
        <p>During a research session:</p>
        <ArticleCode>{`"Search for recent papers on RAG evaluation, bookmark the
best five in Turbodoc tagged 'rag-eval', and write a note
summarizing the main approaches."`}</ArticleCode>
        <p>A week later, in a completely new conversation — or a different tool:</p>
        <ArticleCode>{`"Check my Turbodoc notes and bookmarks tagged 'rag-eval'
and draft an evaluation plan based on what we found."`}</ArticleCode>
        <p>
          The agent calls <code className="text-foreground">search_bookmarks</code> and{" "}
          <code className="text-foreground">list_notes</code>, retrieves exactly what was saved, and
          continues where the last session stopped.
        </p>
      </ArticleSection>

      <ArticleSection title="Why not just a database or a vector store?">
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-foreground">Human-readable by design.</strong> Memory an agent
            writes is a library you actually use — browsable, searchable, and editable in a real
            app, not rows in a table.
          </li>
          <li>
            <strong className="text-foreground">Zero infrastructure.</strong> No database to host,
            no embeddings pipeline to maintain. Connect the MCP endpoint and you're done.
          </li>
          <li>
            <strong className="text-foreground">OAuth-scoped security.</strong> Agents authenticate
            as you, see only your data, and access is revocable at any time.
          </li>
          <li>
            <strong className="text-foreground">Open source.</strong> The entire stack is public at
            github.com/turbodoc-org — no lock-in on the thing holding your memory.
          </li>
        </ul>
      </ArticleSection>

      <ArticleSection title="Set it up in two minutes">
        <p>
          Create a free account, then follow the{" "}
          <Link to="/docs/mcp" className="text-primary hover:underline">
            MCP setup guide
          </Link>{" "}
          for your client. For Claude Code it's one line:
        </p>
        <ArticleCode>
          claude mcp add --transport http turbodoc https://api.turbodoc.ai/mcp
        </ArticleCode>
      </ArticleSection>
    </ArticleLayout>
  );
}
