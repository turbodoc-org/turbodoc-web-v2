import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse tags from a value that may be a string array, a JSON-stringified
 * array (`"[]"`, `"[\"a\",\"b\"]"`), a comma-separated string
 * ("tag1, tag2, tag3"), or a pipe-separated string ("tag1|tag2").
 * Returns a deduplicated list of trimmed, non-empty tags.
 */
export function parseTags(tags: string | string[] | null | undefined): string[] {
  if (!tags) return [];

  let arr: string[];
  if (Array.isArray(tags)) {
    arr = tags;
  } else {
    const trimmed = tags.trim();
    // Handle JSON-stringified arrays like "[]" or "[\"a\",\"b\"]"
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          arr = parsed.map((t) => String(t));
        } else {
          arr = [trimmed];
        }
      } catch {
        arr = [trimmed];
      }
    } else {
      arr = trimmed.split(/[,|]/);
    }
  }

  const cleaned = arr.map((t) => String(t).trim()).filter(Boolean);
  return Array.from(new Set(cleaned));
}
