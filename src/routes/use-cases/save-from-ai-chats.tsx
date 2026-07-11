import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleLayout, ArticleSection, ArticleCode } from "@/components/shared/article-layout";
import { JsonLd } from "@/components/shared/json-ld";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Save links, notes, and code directly from AI conversations",
  description:
    "Stop losing what your AI conversations produce. With Turbodoc's MCP server, Claude and other assistants can save links, summaries, and code snippets to your library without leaving the chat.",
  author: { "@type": "Organization", name: "Turbodoc" },
  publisher: { "@type": "Organization", name: "Turbodoc", url: "https://turbodoc.ai" },
};

export const Route = createFileRoute("/use-cases/save-from-ai-chats")({
  head: () => ({
    meta: [
      { title: "Save Links, Notes & Code from Claude Conversations - Turbodoc" },
      {
        name: "description",
        content:
          "Your best AI conversations vanish when the chat ends. Connect Turbodoc via MCP and ask Claude to save links, summaries, and code snippets to your permanent library — without leaving the conversation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://turbodoc.ai/use-cases/save-from-ai-chats" }],
  }),
  component: SaveFromAiChats,
});

function SaveFromAiChats() {
  return (
    <ArticleLayout
      eyebrow="Use case"
      title="Never lose what your AI conversations produce"
      intro="You ask Claude to research something. It finds great sources, writes a sharp summary, produces working code — and all of it evaporates when the chat scrolls away. With Turbodoc connected, saving is part of the conversation."
      ctaLabel="Connect your assistant"
    >
      <JsonLd data={articleSchema} />

      <ArticleSection title="The copy-paste tax">
        <p>
          The current workflow for keeping anything from an AI chat is manual: select, copy, switch
          apps, paste, format, name it, file it. So mostly, nobody does. Valuable output gets
          regenerated over and over because saving it was friction.
        </p>
      </ArticleSection>

      <ArticleSection title="Saving becomes a sentence">
        <p>
          Connect Turbodoc's{" "}
          <Link to="/mcp" className="text-primary hover:underline">
            MCP server
          </Link>{" "}
          and the assistant does the filing. Mid-conversation:
        </p>
        <ArticleCode>{`"Bookmark those three sources in Turbodoc, tagged 'pricing-research'."`}</ArticleCode>
        <ArticleCode>{`"Save your summary as a Turbodoc note titled 'Pricing research – July 2026'."`}</ArticleCode>
        <ArticleCode>{`"Store that migration script as a code snippet, language SQL."`}</ArticleCode>
        <p>
          Each one lands in your library with proper titles, tags, and formatting — no app
          switching, no paste. Links get their metadata fetched automatically; notes are stored as
          real markdown; snippets keep their language and highlighting.
        </p>
      </ArticleSection>

      <ArticleSection title="And it flows back into future chats">
        <p>
          Because agents can read the library too, everything you capture compounds. Next week's
          conversation can start with “check my 'pricing-research' bookmarks and pick up where we
          left off” — in Claude, in Cursor, or in whatever client you use next. The chat is
          ephemeral; your library isn't.
        </p>
      </ArticleSection>

      <ArticleSection title="Works everywhere you chat">
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong className="text-foreground">Claude (web & desktop)</strong> — add Turbodoc as a
            custom connector.
          </li>
          <li>
            <strong className="text-foreground">Claude Code, Cursor, VS Code, Windsurf</strong> —
            one config entry each; see the{" "}
            <Link to="/docs/mcp" className="text-primary hover:underline">
              setup guide
            </Link>
            .
          </li>
          <li>
            <strong className="text-foreground">Everything else</strong> — the browser extension and
            iOS share sheet cover the moments you're not in an AI chat at all.
          </li>
        </ul>
        <p>
          Authentication is OAuth 2.0 — you sign in with your Turbodoc account once, and there are
          no API keys to manage.
        </p>
      </ArticleSection>
    </ArticleLayout>
  );
}
