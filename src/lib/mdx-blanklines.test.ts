import { describe, expect, it } from "vitest";
import { convertAutolinks } from "./mdx-blanklines";

describe("convertAutolinks", () => {
  it("rewrites URL autolinks as markdown links", () => {
    expect(convertAutolinks("see <https://claude.ai/a/b>")).toBe(
      "see [https://claude.ai/a/b](https://claude.ai/a/b)",
    );
  });

  it("rewrites email autolinks as mailto links", () => {
    expect(convertAutolinks("<me@example.com>")).toBe("[me@example.com](mailto:me@example.com)");
  });

  it("leaves inline code and fenced code blocks untouched", () => {
    const md = "`<https://a.com>`\n\n```\n<https://b.com>\n```\n";
    expect(convertAutolinks(md)).toBe(md);
  });

  it("leaves HTML/JSX tags alone", () => {
    expect(convertAutolinks("<div>hi</div>")).toBe("<div>hi</div>");
  });
});
