import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, History, Loader2, RotateCcw, Tag, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getDocumentRevisions, nameDocumentRevision } from "@/lib/api";
import type { DocumentRevision, Note } from "@/lib/types";
import { Button } from "@/components/ui/button";

function lineDiff(previous: string, selected: string) {
  const before = previous.split("\n");
  const after = selected.split("\n");
  const max = Math.max(before.length, after.length);
  return Array.from({ length: max }, (_, index) => {
    if (before[index] === after[index]) return { kind: "same", text: after[index] ?? "" };
    return [
      ...(before[index] === undefined ? [] : [{ kind: "removed", text: before[index] }]),
      ...(after[index] === undefined ? [] : [{ kind: "added", text: after[index] }]),
    ];
  }).flat();
}

export function NoteHistory({
  note,
  onClose,
  onRestore,
}: {
  note: Note;
  onClose: () => void;
  onRestore: (revision: DocumentRevision) => Promise<Note>;
}) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>();
  const [namingId, setNamingId] = useState<string>();
  const [name, setName] = useState("");
  const { data: revisions = [], isLoading } = useQuery({
    queryKey: ["document-revisions", note.id],
    queryFn: () => getDocumentRevisions(note.id),
  });
  const selected = revisions.find((revision) => revision.id === selectedId) ?? revisions[0];
  const selectedIndex = selected
    ? revisions.findIndex((revision) => revision.id === selected.id)
    : -1;
  const previous = selectedIndex >= 0 ? revisions[selectedIndex + 1] : undefined;
  const diff = useMemo(
    () => lineDiff(previous?.markdown ?? "", selected?.markdown ?? ""),
    [previous?.markdown, selected?.markdown],
  );

  const restore = useMutation({
    mutationFn: onRestore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-revisions", note.id] });
      onClose();
    },
  });
  const rename = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      nameDocumentRevision(note.id, id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-revisions", note.id] });
      setNamingId(undefined);
      setName("");
    },
  });

  return (
    <div
      className="fixed inset-0 z-[70] flex bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Version history"
    >
      <button className="flex-1 cursor-default" onClick={onClose} aria-label="Close history" />
      <section className="flex h-full w-full max-w-5xl flex-col bg-background shadow-2xl md:w-[82vw]">
        <header className="flex h-16 items-center justify-between border-b px-5">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Version history</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </header>
        <div className="grid min-h-0 flex-1 md:grid-cols-[19rem_1fr]">
          <aside className="overflow-y-auto border-r p-3">
            {isLoading ? (
              <Loader2 className="m-5 h-5 w-5 animate-spin" />
            ) : (
              revisions.map((revision) => (
                <button
                  key={revision.id}
                  onClick={() => setSelectedId(revision.id)}
                  className={`mb-1 w-full rounded-lg p-3 text-left text-sm ${selected?.id === revision.id ? "bg-primary/10 text-foreground" : "hover:bg-muted"}`}
                >
                  <div className="font-medium">
                    {revision.name || `Version ${revision.revision_number}`}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(revision.created_at).toLocaleString()}
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {revision.change_summary || revision.device_id || "Automatic revision"}
                  </div>
                </button>
              ))
            )}
          </aside>
          <main className="flex min-h-0 flex-col">
            {selected ? (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
                  {namingId === selected.id ? (
                    <>
                      <input
                        autoFocus
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Revision name"
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                      />
                      <Button
                        size="sm"
                        disabled={!name.trim() || rename.isPending}
                        onClick={() => rename.mutate({ id: selected.id, value: name.trim() })}
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNamingId(selected.id);
                        setName(selected.name ?? "");
                      }}
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      Name version
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="ml-auto"
                    disabled={restore.isPending || selected.id === note.head_revision_id}
                    onClick={() => restore.mutate(selected)}
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Restore as new version
                  </Button>
                </div>
                <div className="min-h-0 flex-1 overflow-auto p-5 font-mono text-xs leading-6">
                  <div className="mb-4 font-sans">
                    <h3 className="text-lg font-semibold">{selected.title || "Untitled Note"}</h3>
                    <p className="text-xs text-muted-foreground">
                      Changes from the preceding revision
                    </p>
                  </div>
                  {diff.map((line, index) => (
                    <div
                      key={`${index}-${line.kind}`}
                      className={`whitespace-pre-wrap px-2 ${line.kind === "added" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : line.kind === "removed" ? "bg-red-500/15 text-red-700 line-through dark:text-red-300" : "text-muted-foreground"}`}
                    >
                      <span className="mr-3 select-none opacity-50">
                        {line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}
                      </span>
                      {line.text || " "}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="m-auto text-sm text-muted-foreground">No revisions yet.</div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
