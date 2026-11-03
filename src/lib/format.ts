const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Normalise the timestamps the API returns (ISO strings, epoch seconds or epoch
 * milliseconds) into a Date. Returns null for missing or unparsable values.
 */
export function toDate(value: string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;

  let date: Date;
  if (typeof value === "number" || /^\d+$/.test(String(value))) {
    let ts = Number(value);
    // Values before Jan 1 2000 in ms are almost certainly epoch seconds.
    if (ts < 946684800000) ts *= 1000;
    date = new Date(ts);
  } else {
    date = new Date(value);
  }

  return isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Short, human relative date used in card metadata:
 * "today", "yesterday", "3d ago", "Sep 18", "Sep 18, 2024".
 */
export function formatRelativeDate(
  value: string | number | null | undefined,
  now: Date = new Date(),
): string | null {
  const date = toDate(value);
  if (!date) return null;

  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

/** "1 note", "24 notes" */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Hostname without a leading "www.", or the raw input if it isn't a URL. */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  rust: "Rust",
  go: "Go",
  php: "PHP",
  ruby: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  sql: "SQL",
  markdown: "Markdown",
  bash: "Bash",
  shell: "Shell",
  yaml: "YAML",
};

export function formatLanguage(language: string | null | undefined): string {
  if (!language) return "Plain text";
  const key = language.toLowerCase();
  return LANGUAGE_LABELS[key] ?? language.charAt(0).toUpperCase() + language.slice(1);
}

/** Count markdown task list items ("- [ ]" / "- [x]"). */
export function countTasks(markdown: string): { done: number; total: number } {
  const matches = markdown.match(/^\s*[-*+]\s+\[( |x|X)\]/gm) ?? [];
  const done = matches.filter((m) => /\[(x|X)\]/.test(m)).length;
  return { done, total: matches.length };
}

const HTTP_REASONS: Record<number, string> = {
  404: "Not found",
  410: "Gone",
  500: "Server error",
  502: "Bad gateway",
  503: "Unavailable",
  504: "Gateway timeout",
};

/**
 * Why a bookmark's link is considered broken, from the link checker's last
 * result: "404 Not found", "Timed out", "DNS lookup failed", or "Unreachable".
 */
export function describeLinkFailure(statusCode?: number | null, error?: string | null): string {
  if (statusCode) {
    const reason = HTTP_REASONS[statusCode] ?? (statusCode >= 500 ? "Server error" : null);
    return reason ? `${statusCode} ${reason}` : `HTTP ${statusCode}`;
  }
  return error?.trim() || "Unreachable";
}
