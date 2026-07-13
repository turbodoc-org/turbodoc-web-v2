import { describe, expect, it } from "vite-plus/test";
import { createNoteLineDiff } from "./note-diff";

describe("note revision line diff", () => {
  it("keeps following lines aligned after deleting one line", () => {
    const diff = createNoteLineDiff("one\ntwo\nthree\nfour", "one\nthree\nfour");

    expect(diff.map(({ kind, text }) => ({ kind, text }))).toEqual([
      { kind: "same", text: "one" },
      { kind: "removed", text: "two" },
      { kind: "same", text: "three" },
      { kind: "same", text: "four" },
    ]);
    expect(diff[2]).toMatchObject({ oldLine: 3, newLine: 2 });
  });

  it("marks only a deleted fenced code block as removed", () => {
    const previous = [
      "Introduction",
      "",
      "```ts",
      "const first = 1;",
      "const second = 2;",
      "```",
      "",
      "Conclusion",
    ].join("\n");
    const selected = ["Introduction", "", "Conclusion"].join("\n");

    const diff = createNoteLineDiff(previous, selected);
    const changed = diff.filter((line) => line.kind !== "same");

    expect(changed.map((line) => line.text)).toEqual([
      "```ts",
      "const first = 1;",
      "const second = 2;",
      "```",
      "",
    ]);
    expect(changed.every((line) => line.kind === "removed")).toBe(true);
    expect(diff.at(-1)).toMatchObject({ kind: "same", text: "Conclusion", newLine: 3 });
  });

  it("shows a changed line as one removal and one addition", () => {
    const diff = createNoteLineDiff("before\nold value\nafter", "before\nnew value\nafter");

    expect(diff.filter((line) => line.kind !== "same")).toEqual([
      { kind: "removed", text: "old value", oldLine: 2, newLine: null },
      { kind: "added", text: "new value", oldLine: null, newLine: 2 },
    ]);
  });
});
