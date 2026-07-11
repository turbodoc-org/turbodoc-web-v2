export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD requires a raw script tag; data is static, developer-authored content
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Turbodoc",
  url: "https://turbodoc.ai",
  logo: "https://turbodoc.ai/logo.png",
  sameAs: ["https://github.com/turbodoc-org"],
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Turbodoc",
  url: "https://turbodoc.ai",
  description:
    "A fast, open-source knowledge base for humans and AI agents: bookmarks, markdown notes, code snippets, and diagrams, synced across web, iOS, and browser extensions. Connects to Claude, Cursor, and any MCP client.",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web, iOS, Chrome, Firefox",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: "Classic Apps Co",
  },
  sameAs: [
    "https://apps.apple.com/nl/app/turbodoc/id6749333065",
    "https://chromewebstore.google.com/detail/turbodoc/fjncckldanedaaaoeapkponpplkahbdg",
    "https://addons.mozilla.org/en-US/firefox/addon/turbodoc/",
    "https://github.com/turbodoc-org",
  ],
};
