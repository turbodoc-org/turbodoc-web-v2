/**
 * Helpers that preserve blank lines between blocks through MDXEditor's
 * markdown round-trip (parse <-> serialize).
 *
 * Background: `mdast-util-from-markdown` collapses runs of blank lines between
 * blocks into a single separator, because blank lines have no representation
 * in the mdast tree. So a note saved with visible empty lines loses them on
 * reload — the editor parses `# H\n\n\n\ntext` back to `[heading, paragraph]`
 * with no empty paragraph in between.
 *
 * To work around this, blank line runs are encoded, before they reach the
 * editor, as paragraphs containing a single non-breaking space (U+00A0). Those
 * paragraphs have "content" so they survive parsing and serialize back
 * symmetrically. On the way out (save / `onChange`), the markers are stripped
 * back to blank lines so the stored markdown stays clean and readable.
 *
 * Round-trip mapping (per `mdast-util-to-markdown` behaviour):
 *   1 empty paragraph  <=>  `\n\n\n\n` (4 newlines) between two blocks
 *   K empty paragraphs <=>  `\n` * (2 + 2K) newlines between two blocks
 */

const NBSP = "\u00A0";

/**
 * Encodes blank lines for the editor.
 *
 * Each maximal run of N consecutive newlines (N >= 2) is rewritten as the
 * standard `\n\n` block separator followed by `ceil((N - 2) / 2)` NBSP
 * paragraphs (one per "visible blank line" the user intended).
 */
export function toEditorMarkdown(markdown: string): string {
  return markdown.replace(/\n{2,}/g, (match) => {
    const newlines = match.length;
    const blankLines = Math.max(0, Math.ceil((newlines - 2) / 2));
    return "\n\n" + `${NBSP}\n\n`.repeat(blankLines);
  });
}

/**
 * Decodes the editor's markdown back to a clean stored form.
 *
 * Each paragraph containing only a non-breaking space is turned back into an
 * extra blank line (`\n`) — i.e. one more newline so the run grows back to the
 * `mdast-util-to-markdown` convention of `2 + 2K` newlines for K empty
 * paragraphs.
 */
export function toStoredMarkdown(markdown: string): string {
  return markdown.replace(new RegExp(`${NBSP}\\n`, "g"), "\n").replace(new RegExp(`${NBSP}$`), "");
}
