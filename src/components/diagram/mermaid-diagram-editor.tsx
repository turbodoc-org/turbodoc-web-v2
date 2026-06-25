"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { AppHeader } from "@/components/shared/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MermaidDiagram } from "@/components/markdown/mermaid-diagram";
import { updateDiagram } from "@/lib/api";
import type { Diagram } from "@/lib/types";

interface MermaidDiagramEditorProps {
  diagram: Diagram;
}

export function MermaidDiagramEditor({ diagram }: MermaidDiagramEditorProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(diagram.title);
  const [source, setSource] = useState(diagram.mermaid_source || "");
  const [debouncedTitle] = useDebounce(title, 1000);
  const [debouncedSource] = useDebounce(source, 1000);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    const titleChanged = debouncedTitle !== diagram.title;
    const sourceChanged = debouncedSource !== (diagram.mermaid_source || "");

    if (!titleChanged && !sourceChanged) return;

    const saveDiagram = async () => {
      setIsSaving(true);
      try {
        await updateDiagram(diagram.id, {
          title: debouncedTitle || "Untitled Diagram",
          diagram_type: "mermaid",
          mermaid_source: debouncedSource,
          shapes: [],
          connections: [],
        });
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Failed to save Mermaid diagram:", error);
        toast.error("Failed to save diagram");
      } finally {
        setIsSaving(false);
      }
    };

    saveDiagram();
  }, [debouncedTitle, debouncedSource, diagram.id, diagram.title, diagram.mermaid_source]);

  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      await updateDiagram(diagram.id, {
        title: title || "Untitled Diagram",
        diagram_type: "mermaid",
        mermaid_source: source,
        shapes: [],
        connections: [],
      });
      setLastSavedAt(new Date());
      toast.success("Diagram saved");
    } catch (error) {
      console.error("Failed to save Mermaid diagram:", error);
      toast.error("Failed to save diagram");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/diagrams" })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Diagrams
            </Button>
            <div className="min-w-0">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-8 border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                placeholder="Untitled Diagram"
              />
              <p className="text-xs text-muted-foreground">
                {isSaving
                  ? "Saving…"
                  : lastSavedAt
                    ? `Saved ${lastSavedAt.toLocaleTimeString()}`
                    : "Mermaid diagram"}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleManualSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </header>

      <section className="flex-1 grid gap-4 p-4 md:grid-cols-2 md:p-6 max-w-7xl w-full mx-auto">
        <div className="flex min-h-[500px] flex-col rounded-lg border border-border bg-card p-4 shadow-sm">
          <Label htmlFor="mermaid-source" className="mb-3 text-sm font-medium">
            Mermaid source
          </Label>
          <Textarea
            id="mermaid-source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            className="flex-1 resize-none font-mono text-sm"
            placeholder="flowchart TD\n    A[Start] --> B[End]"
          />
        </div>

        <div className="min-h-[500px] rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-medium text-foreground">Preview</h2>
          {source.trim() ? (
            <MermaidDiagram chart={source} className="min-h-[420px]" />
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
              Add Mermaid source to preview your diagram.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
