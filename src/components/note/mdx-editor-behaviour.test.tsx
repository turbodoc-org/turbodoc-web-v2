// @vitest-environment jsdom
import { createRef } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { MDXEditorWrapper } from "./mdx-editor-wrapper";
import { preserveSourceFormatting } from "./preserve-formatting";

// The note editor relies on two MDXEditor behaviours. If an upgrade changes
// either, these tests fail before users' notes get reformatted.
describe("MDXEditor behaviour the note editor relies on", () => {
  const source = "# Groceries\n\n* milk\n* eggs\n\nSome *emphasis* here.\n";

  it("setMarkdown emits no change event, and getMarkdown returns its serialisation once committed", async () => {
    const ref = createRef<MDXEditorMethods>();
    const onChange = vi.fn();
    render(<MDXEditorWrapper ref={ref} markdown="" onChange={onChange} />);
    onChange.mockClear();

    act(() => ref.current!.setMarkdown(source));
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(onChange).not.toHaveBeenCalled();
    const loaded = ref.current!.getMarkdown();
    expect(loaded).not.toBe(source); // the editor does reformat
    expect(loaded).toContain("- milk");
    // With nothing edited, the original markdown is what gets stored.
    expect(preserveSourceFormatting(source, loaded, loaded)).toBe(source);
  });
});
