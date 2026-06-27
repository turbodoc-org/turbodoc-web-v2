"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, definition: string) => Promise<{ svg: string }> | { svg: string };
};

declare global {
  interface Window {
    mermaid?: MermaidApi;
  }
}

const MERMAID_SCRIPT_ID = "turbodoc-mermaid-js";
const MERMAID_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";

let mermaidLoadPromise: Promise<MermaidApi> | null = null;
let mermaidInitialized = false;

function loadMermaid() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mermaid can only render in the browser."));
  }

  if (window.mermaid) {
    return Promise.resolve(window.mermaid);
  }

  if (mermaidLoadPromise) {
    return mermaidLoadPromise;
  }

  mermaidLoadPromise = new Promise<MermaidApi>((resolve, reject) => {
    const existingScript = document.getElementById(MERMAID_SCRIPT_ID) as HTMLScriptElement | null;

    const handleLoad = () => {
      if (window.mermaid) {
        resolve(window.mermaid);
      } else {
        reject(new Error("Mermaid loaded without exposing a browser API."));
      }
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Mermaid.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = MERMAID_SCRIPT_ID;
    script.src = MERMAID_SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load Mermaid.")), { once: true });
    document.head.appendChild(script);
  });

  return mermaidLoadPromise;
}

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const reactId = useId();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const renderId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    setSvg("");
    setError(null);

    loadMermaid()
      .then(async (mermaid) => {
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
          });
          mermaidInitialized = true;
        }

        const result = await mermaid.render(renderId, chart);
        if (isCurrent) {
          setSvg(result.svg);
        }
      })
      .catch((renderError: unknown) => {
        if (isCurrent) {
          setError(renderError instanceof Error ? renderError.message : "Unable to render diagram.");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [chart, reactId]);

  if (error) {
    return (
      <pre className={className} data-mermaid-error={error}>
        <code>{chart}</code>
      </pre>
    );
  }

  if (!svg) {
    return <div className={cn("my-3 rounded-md border border-border bg-muted/30 p-4 text-xs text-muted-foreground", className)}>Rendering diagram…</div>;
  }

  return (
    <div
      className={cn("my-3 overflow-x-auto rounded-md border border-border bg-background p-3 [&_svg]:mx-auto [&_svg]:max-w-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
