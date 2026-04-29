import { AppHeader } from "@/components/shared/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getDigestPreferences, updateDigestPreferences, type DigestPreferences } from "@/lib/api";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/settings/digest")({
  ssr: "data-only",
  component: DigestSettings,
});

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

/** Postgres TIME (HH:MM:SS) → HH:MM for <input type="time">. */
function toInputTime(time: string): string {
  return time.length >= 5 ? time.slice(0, 5) : "10:00";
}

function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function supportedTimeZones(): string[] {
  // Intl.supportedValuesOf is available in all evergreen browsers.
  const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
  if (typeof fn === "function") {
    try {
      return fn("timeZone");
    } catch {
      /* fall through */
    }
  }
  return ["UTC"];
}

function formatLastSent(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DigestSettings() {
  const [prefs, setPrefs] = useState<DigestPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const timezones = useMemo(supportedTimeZones, []);
  const detectedTz = useMemo(browserTimeZone, []);

  useEffect(() => {
    let cancelled = false;
    getDigestPreferences()
      .then((data) => {
        if (cancelled) return;
        // On first load, nudge the saved timezone toward the browser's if they
        // still have the UTC default — reduces setup friction.
        if (data.timezone === "UTC") {
          const tz = browserTimeZone();
          if (tz !== "UTC") data = { ...data, timezone: tz };
        }
        setPrefs(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load digest preferences");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave() {
    if (!prefs) return;
    setSaving(true);
    try {
      const saved = await updateDigestPreferences({
        enabled: prefs.enabled,
        day_of_week: prefs.day_of_week,
        send_time: prefs.send_time,
        timezone: prefs.timezone,
      });
      setPrefs(saved);
      toast.success("Digest preferences saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save digest preferences");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <div className="flex-1 w-full max-w-2xl mx-auto p-3 md:p-6 pt-4 md:pt-8 mobile-safe-area">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Weekly digest</h1>
          <p className="text-muted-foreground text-sm">
            Get a weekly email summarising the bookmarks you saved that week.
          </p>
        </div>

        {loading || !prefs ? (
          <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Checkbox
                id="digest-enabled"
                checked={prefs.enabled}
                onCheckedChange={(checked) => setPrefs({ ...prefs, enabled: checked === true })}
              />
              <Label htmlFor="digest-enabled" className="cursor-pointer">
                Send me a weekly digest
              </Label>
            </div>

            <div
              aria-hidden={!prefs.enabled}
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                prefs.enabled
                  ? "grid-rows-[1fr] opacity-100 mt-6"
                  : "grid-rows-[0fr] opacity-0 mt-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="digest-day">Day</Label>
                      <select
                        id="digest-day"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={prefs.day_of_week}
                        onChange={(e) =>
                          setPrefs({
                            ...prefs,
                            day_of_week: Number(e.target.value),
                          })
                        }
                      >
                        {DAYS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="digest-time">Time</Label>
                      <input
                        id="digest-time"
                        type="time"
                        step={300}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={toInputTime(prefs.send_time)}
                        onChange={(e) =>
                          setPrefs({
                            ...prefs,
                            send_time: `${e.target.value}:00`,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="digest-timezone">Timezone</Label>
                    <select
                      id="digest-timezone"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={prefs.timezone}
                      onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
                    >
                      {/* Keep the saved value selectable even if the runtime
                          doesn't enumerate it. */}
                      {!timezones.includes(prefs.timezone) && (
                        <option value={prefs.timezone}>{prefs.timezone}</option>
                      )}
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                    {prefs.timezone !== detectedTz && (
                      <p className="text-xs text-muted-foreground">
                        Detected:{" "}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => setPrefs({ ...prefs, timezone: detectedTz })}
                        >
                          {detectedTz}
                        </button>
                      </p>
                    )}
                  </div>

                  {prefs.last_sent_at && (
                    <p className="text-xs text-muted-foreground">
                      Last digest sent: {formatLastSent(prefs.last_sent_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button onClick={onSave} disabled={saving}>
                {saving ? "Saving…" : "Save preferences"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
