import { describe, expect, it } from "vite-plus/test";
import { EMPTY_PARAGRAPH_MARKER, toEditorMarkdown, toStoredMarkdown } from "./mdx-blanklines";

describe("MDX blank-line preservation", () => {
  it("round-trips empty paragraphs between existing blocks", () => {
    const markdown = "first\n\n\n\nsecond";

    expect(toStoredMarkdown(toEditorMarkdown(markdown))).toBe(markdown);
  });

  it("turns an editor-created trailing empty paragraph into stored markdown", () => {
    const editorMarkdown = `first\n\n${EMPTY_PARAGRAPH_MARKER}`;

    expect(toStoredMarkdown(editorMarkdown)).toBe("first\n\n\n");
    expect(toEditorMarkdown(toStoredMarkdown(editorMarkdown)).trim()).toBe(editorMarkdown);
  });

  it("does not alter ordinary markdown", () => {
    const markdown = "# Heading\n\nParagraph";

    expect(toStoredMarkdown(toEditorMarkdown(markdown))).toBe(markdown);
  });
});
