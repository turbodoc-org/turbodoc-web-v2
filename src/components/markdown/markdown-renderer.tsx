"use client";

import ReactMarkdown from "react-markdown";
import { MermaidDiagram } from "@/components/markdown/mermaid-diagram";

interface MarkdownRendererProps {
  children: string;
  preview?: boolean;
}

export function MarkdownRenderer({ children, preview = false }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className={preview ? "mb-1" : "mb-3"}>{children}</p>,
        h1: ({ children }) => <h1 className={preview ? "text-sm font-bold mb-1" : "text-2xl font-bold mb-3"}>{children}</h1>,
        h2: ({ children }) => <h2 className={preview ? "text-sm font-semibold mb-1" : "text-xl font-semibold mb-3"}>{children}</h2>,
        h3: ({ children }) => <h3 className={preview ? "text-xs font-semibold mb-1" : "text-lg font-semibold mb-2"}>{children}</h3>,
        ul: ({ children }) => <ul className={preview ? "list-disc ml-3 mb-1" : "list-disc ml-6 mb-3"}>{children}</ul>,
        ol: ({ children }) => <ol className={preview ? "list-decimal ml-3 mb-1" : "list-decimal ml-6 mb-3"}>{children}</ol>,
        li: ({ children }) => <li className={preview ? "mb-0" : "mb-1"}>{children}</li>,
        code: ({ children, className }) => {
          const language = /language-(\w+)/.exec(className || "")?.[1]?.toLowerCase();
          const code = String(children).replace(/\n$/, "");

          if (language === "mermaid") {
            return <MermaidDiagram chart={code} className={preview ? "text-xs bg-muted p-1 rounded mb-1 overflow-hidden" : "bg-muted p-3 rounded-md overflow-x-auto"} />;
          }

          return <code className={preview ? "text-xs bg-muted px-1 rounded" : className}>{children}</code>;
        },
        pre: ({ children }) => <>{children}</>,
        blockquote: ({ children }) => <blockquote className={preview ? "border-l-2 border-primary pl-2 italic mb-1" : "border-l-4 border-primary pl-4 italic mb-3"}>{children}</blockquote>,
        a: ({ children, href }) => <a href={href} className="text-primary underline" onClick={(event) => event.stopPropagation()}>{children}</a>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
