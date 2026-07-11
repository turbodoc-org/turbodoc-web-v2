import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleLayout, ArticleSection } from "@/components/shared/article-layout";
import { JsonLd } from "@/components/shared/json-ld";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "A personal knowledge base for humans and AI agents",
  description:
    "Turbodoc combines bookmarks, markdown notes, code snippets, and diagrams into one searchable knowledge base that both you and your AI assistants can read and write.",
  author: { "@type": "Organization", name: "Turbodoc" },
  publisher: { "@type": "Organization", name: "Turbodoc", url: "https://turbodoc.ai" },
};

export const Route = createFileRoute("/use-cases/knowledge-base")({
  head: () => ({
    meta: [
      { title: "Personal Knowledge Base for Humans & AI Agents - Turbodoc" },
      {
        name: "description",
        content:
          "One searchable library for bookmarks, markdown notes, code snippets, and diagrams — synced across web, iOS, and browser extensions, and readable by Claude, Cursor, or any MCP-compatible AI assistant.",
      },
    ],
    links: [{ rel: "canonical", href: "https://turbodoc.ai/use-cases/knowledge-base" }],
  }),
  component: KnowledgeBase,
});

function KnowledgeBase() {
  return (
    <ArticleLayout
      eyebrow="Use case"
      title="One knowledge base for you and your AI"
      intro="Your knowledge is scattered: bookmarks in one browser, notes in three apps, snippets in gists, diagrams in screenshots. Turbodoc puts all four in one searchable place — one that your AI assistants can use too."
      ctaLabel="Start your knowledge base"
    >
      <JsonLd data={articleSchema} />

      <ArticleSection title="Four content types, one library">
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-foreground">Bookmarks</strong> with automatic titles,
            thumbnails, and metadata. Tag them, favorite them, track read/unread status.
          </li>
          <li>
            <strong className="text-foreground">Markdown notes</strong> with live preview — meeting
            notes, research summaries, ideas at 2 AM.
          </li>
          <li>
            <strong className="text-foreground">Code snippets</strong> with syntax highlighting for
            100+ languages and one-click copy.
          </li>
          <li>
            <strong className="text-foreground">Diagrams</strong> — drag-and-drop canvas or Mermaid
            syntax, exportable to PNG and PDF.
          </li>
        </ul>
        <p>
          Full-text search works across everything, so “that article about database indexing” is
          three keystrokes away, whether it was a bookmark, a note, or a snippet.
        </p>
      </ArticleSection>

      <ArticleSection title="Capture from wherever you are">
        <p>
          A knowledge base only works if saving is effortless. Turbodoc meets you at every capture
          point:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-foreground">Browser extensions</strong> for Chrome and Firefox —
            one click saves the current page.
          </li>
          <li>
            <strong className="text-foreground">iOS app</strong> with a share-sheet extension,
            home-screen widgets, voice-to-text notes, and photo-to-text OCR for whiteboards and book
            pages.
          </li>
          <li>
            <strong className="text-foreground">Web app</strong> for organizing, editing, and
            searching your whole library.
          </li>
          <li>
            <strong className="text-foreground">Your AI assistant</strong> — via the{" "}
            <Link to="/mcp" className="text-primary hover:underline">
              MCP server
            </Link>
            , Claude or Cursor can file things for you mid-conversation.
          </li>
        </ul>
        <p>Everything syncs instantly, and the iOS app works offline.</p>
      </ArticleSection>

      <ArticleSection title="The part most tools miss: agents as first-class users">
        <p>
          Notion, Obsidian, and Pocket were built for human hands. Turbodoc treats AI agents as
          equal citizens: the same library you browse is exposed through 22 MCP tools, so an
          assistant can search your research before answering, save its own findings, and keep your
          reading list tidy. You maintain one knowledge base, and every tool you use — human or AI —
          reads from and writes to it.
        </p>
      </ArticleSection>

      <ArticleSection title="Stay on top of it without trying">
        <p>
          A weekly email digest resurfaces what you saved recently, so bookmarks don't become a
          write-only graveyard. And because everything is tagged and searchable, periodic cleanup is
          a single prompt: “archive my unread bookmarks older than six months.”
        </p>
      </ArticleSection>

      <ArticleSection title="Free, open source, no lock-in">
        <p>
          Turbodoc is free while in beta and 100% open source at{" "}
          <a
            href="https://github.com/turbodoc-org"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/turbodoc-org
          </a>
          . Your knowledge base shouldn't be a hostage — the API is open, documented, and yours to
          build on.
        </p>
      </ArticleSection>
    </ArticleLayout>
  );
}
