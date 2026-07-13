import { diffLines } from "diff";

export interface NoteDiffLine {
  kind: "same" | "added" | "removed";
  text: string;
  oldLine: number | null;
  newLine: number | null;
}

function splitLines(value: string): string[] {
  if (!value) return [];
  const lines = value.split("\n");
  if (value.endsWith("\n")) lines.pop();
  return lines.map((line) => line.replace(/\r$/, ""));
}

export function createNoteLineDiff(previous: string, selected: string): NoteDiffLine[] {
  let oldLine = 1;
  let newLine = 1;
  const result: NoteDiffLine[] = [];

  for (const change of diffLines(previous, selected)) {
    const kind = change.added ? "added" : change.removed ? "removed" : "same";

    for (const text of splitLines(change.value)) {
      result.push({
        kind,
        text,
        oldLine: kind === "added" ? null : oldLine,
        newLine: kind === "removed" ? null : newLine,
      });

      if (kind !== "added") oldLine += 1;
      if (kind !== "removed") newLine += 1;
    }
  }

  return result;
}
