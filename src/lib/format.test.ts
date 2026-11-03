import { describe, expect, it } from "vitest";
import {
  countTasks,
  describeLinkFailure,
  formatRelativeDate,
  getDomain,
  pluralize,
  toDate,
} from "./format";

const now = new Date(2026, 10, 3, 15, 0, 0); // Nov 3 2026, local time

describe("toDate", () => {
  it("parses ISO strings, epoch seconds and epoch ms", () => {
    const ms = new Date(2026, 0, 2).getTime();
    expect(toDate(new Date(ms).toISOString())?.getTime()).toBe(ms);
    expect(toDate(ms)?.getTime()).toBe(ms);
    expect(toDate(Math.floor(ms / 1000))?.getTime()).toBe(ms);
    expect(toDate(String(Math.floor(ms / 1000)))?.getTime()).toBe(ms);
  });

  it("returns null for empty or invalid values", () => {
    expect(toDate(null)).toBeNull();
    expect(toDate("")).toBeNull();
    expect(toDate("not a date")).toBeNull();
  });
});

describe("formatRelativeDate", () => {
  it("uses today / yesterday / Nd ago for recent dates", () => {
    expect(formatRelativeDate(new Date(2026, 10, 3, 1).toISOString(), now)).toBe("today");
    expect(formatRelativeDate(new Date(2026, 10, 2, 23).toISOString(), now)).toBe("yesterday");
    expect(formatRelativeDate(new Date(2026, 9, 30).toISOString(), now)).toBe("4d ago");
  });

  it("falls back to a short date, adding the year when it differs", () => {
    expect(formatRelativeDate(new Date(2026, 8, 18).toISOString(), now)).toBe("Sep 18");
    expect(formatRelativeDate(new Date(2024, 8, 18).toISOString(), now)).toBe("Sep 18, 2024");
  });

  it("returns null for missing dates", () => {
    expect(formatRelativeDate(null, now)).toBeNull();
  });
});

describe("helpers", () => {
  it("pluralizes", () => {
    expect(pluralize(1, "note")).toBe("1 note");
    expect(pluralize(24, "note")).toBe("24 notes");
  });

  it("strips www from domains", () => {
    expect(getDomain("https://www.figma.com/blog/x")).toBe("figma.com");
    expect(getDomain("nope")).toBe("nope");
  });

  it("counts markdown tasks", () => {
    expect(countTasks("- [x] Cap\n- [X] Goggles\n- [ ] Wetsuit\n* [ ] Helmet\nplain")).toEqual({
      done: 2,
      total: 4,
    });
  });
});

describe("describeLinkFailure", () => {
  it("names common HTTP failures", () => {
    expect(describeLinkFailure(404, null)).toBe("404 Not found");
    expect(describeLinkFailure(410, null)).toBe("410 Gone");
    expect(describeLinkFailure(599, null)).toBe("599 Server error");
  });

  it("falls back to the network error, then to a generic reason", () => {
    expect(describeLinkFailure(null, "Timed out")).toBe("Timed out");
    expect(describeLinkFailure(null, "  ")).toBe("Unreachable");
    expect(describeLinkFailure(undefined, undefined)).toBe("Unreachable");
  });
});
