'use client';

import { forwardRef } from 'react';
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
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface MDXEditorWrapperProps extends Omit<MDXEditorProps, 'plugins'> {
  editorRef?: React.Ref<MDXEditorMethods>;
}

export const MDXEditorWrapper = forwardRef<
  MDXEditorMethods,
  MDXEditorWrapperProps
>(({ editorRef, ...props }, ref) => {
  return (
    <MDXEditor
      {...props}
      ref={ref || editorRef}
      toMarkdownOptions={{
        bullet: '-',
        bulletOther: '*',
      }}
      plugins={[
        // Headings, lists, quotes
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),

        // Links
        linkPlugin(),
        linkDialogPlugin(),

        // Tables
        tablePlugin(),

        // Code blocks with syntax highlighting
        codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            js: 'JavaScript',
            ts: 'TypeScript',
            tsx: 'TypeScript (React)',
            jsx: 'JavaScript (React)',
            css: 'CSS',
            html: 'HTML',
            json: 'JSON',
            md: 'Markdown',
            python: 'Python',
            bash: 'Bash',
            sql: 'SQL',
          },
        }),

        // Markdown shortcuts (e.g., ## for heading)
        markdownShortcutPlugin(),

        // Diff/Source view toggle
        diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
      ]}
      contentEditableClassName="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert"
    />
  );
});

MDXEditorWrapper.displayName = 'MDXEditorWrapper';
