"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  Separator,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  ListsToggle,
  InsertCodeBlock,
  addComposerChild$,
  realmPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { toEditorMarkdown, toStoredMarkdown } from "@/lib/mdx-blanklines";
import { EmptyParagraphPlugin } from "./empty-paragraph-plugin";

const emptyParagraphPlugin = realmPlugin({
  init(realm) {
    realm.pubIn({ [addComposerChild$]: EmptyParagraphPlugin });
  },
});

interface MDXEditorWrapperProps extends Omit<MDXEditorProps, "plugins"> {
  editorRef?: React.Ref<MDXEditorMethods>;
  showToolbar?: boolean;
}

export const MDXEditorWrapper = forwardRef<MDXEditorMethods, MDXEditorWrapperProps>(
  ({ editorRef, markdown = "", onChange, showToolbar = false, ...props }, ref) => {
    const innerRef = useRef<MDXEditorMethods>(null);

    // Wrap the imperative handle so every markdown in/out boundary runs through
    // the blank-line preservation helpers. Consumers can keep dealing with the
    // clean "stored" form of the markdown while the editor internally works with
    // the NBSP-paragraph-encoded form.
    useImperativeHandle<MDXEditorMethods, MDXEditorMethods>(
      ref ?? editorRef ?? null,
      () => {
        const inner = () => innerRef.current;
        return {
          getMarkdown: () => toStoredMarkdown(inner()?.getMarkdown() ?? ""),
          setMarkdown: (value: string) => inner()?.setMarkdown(toEditorMarkdown(value)),
          insertMarkdown: (value: string) => inner()?.insertMarkdown(toEditorMarkdown(value)),
          focus: (callbackFn, opts) => inner()?.focus(callbackFn, opts),
          getContentEditableHTML: () => inner()?.getContentEditableHTML() ?? "",
          getSelectionMarkdown: () => toStoredMarkdown(inner()?.getSelectionMarkdown() ?? ""),
        };
      },
      [],
    );

    return (
      <MDXEditor
        {...props}
        ref={innerRef}
        markdown={toEditorMarkdown(markdown)}
        onChange={(value, initialNormalize) =>
          onChange?.(toStoredMarkdown(value), initialNormalize)
        }
        toMarkdownOptions={{
          bullet: "-",
          bulletOther: "*",
        }}
        trim={false}
        plugins={[
          // Headings, lists, quotes
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          emptyParagraphPlugin(),

          // Links
          linkPlugin(),
          linkDialogPlugin(),

          // Tables
          tablePlugin(),

          // Code blocks with syntax highlighting
          codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: "JavaScript",
              ts: "TypeScript",
              tsx: "TypeScript (React)",
              jsx: "JavaScript (React)",
              css: "CSS",
              html: "HTML",
              json: "JSON",
              md: "Markdown",
              mermaid: "Mermaid",
              python: "Python",
              bash: "Bash",
              sql: "SQL",
            },
          }),

          // Markdown shortcuts (e.g., ## for heading)
          markdownShortcutPlugin(),

          // Diff/Source view toggle
          diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),

          ...(showToolbar
            ? [
                toolbarPlugin({
                  toolbarClassName: "note-format-toolbar",
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <Separator />
                      <BlockTypeSelect />
                      <Separator />
                      <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
                      <CodeToggle />
                      <CreateLink />
                      <Separator />
                      <ListsToggle />
                      <InsertCodeBlock />
                    </>
                  ),
                }),
              ]
            : []),
        ]}
        contentEditableClassName="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert"
      />
    );
  },
);

MDXEditorWrapper.displayName = "MDXEditorWrapper";
