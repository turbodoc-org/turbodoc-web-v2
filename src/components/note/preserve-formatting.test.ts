import { describe, expect, it } from "vitest";
import { preserveSourceFormatting } from "./preserve-formatting";

// Markdown as written on iOS or by an agent, and how MDXEditor re-serialises it.
const source = "# Groceries\n\n* milk\n* eggs\n\nSome *emphasis* here.\n";
const loadedAsEdited = "# Groceries\n\n- milk\n- eggs\n\nSome _emphasis_ here.";

describe("preserveSourceFormatting", () => {
  it("returns the source unchanged when the user has not edited anything", () => {
    expect(preserveSourceFormatting(source, loadedAsEdited, loadedAsEdited)).toBe(source);
  });

  it("applies an edit without reformatting untouched lines", () => {
    const edited = "# Groceries for Sunday\n\n- milk\n- eggs\n\nSome _emphasis_ here.";
    expect(preserveSourceFormatting(source, loadedAsEdited, edited)).toBe(
      "# Groceries for Sunday\n\n* milk\n* eggs\n\nSome *emphasis* here.\n",
    );
  });

  it("keeps an added line in the editor's form and the rest as written", () => {
    const edited = "# Groceries\n\n- milk\n- eggs\n- bread\n\nSome _emphasis_ here.";
    expect(preserveSourceFormatting(source, loadedAsEdited, edited)).toBe(
      "# Groceries\n\n* milk\n* eggs\n- bread\n\nSome *emphasis* here.\n",
    );
  });

  it("uses the edited version of a line the editor also reformatted", () => {
    const edited = "# Groceries\n\n- oat milk\n- eggs\n\nSome _emphasis_ here.";
    expect(preserveSourceFormatting(source, loadedAsEdited, edited)).toBe(
      "# Groceries\n\n- oat milk\n* eggs\n\nSome *emphasis* here.\n",
    );
  });

  it("passes edits through when the editor did not reformat anything", () => {
    expect(preserveSourceFormatting("a\nb", "a\nb", "a\nB")).toBe("a\nB");
  });
});
