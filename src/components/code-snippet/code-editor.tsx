'use client';

import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { php } from '@codemirror/lang-php';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { sql } from '@codemirror/lang-sql';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { EditorView as CMEditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// Create custom themes for the ones not available as packages
const draculaTheme = [
  CMEditorView.theme(
    {
      '&': {
        backgroundColor: '#282a36',
        color: '#f8f8f2',
      },
      '.cm-content': {
        caretColor: '#f8f8f0',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: '#f8f8f0',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: '#44475a',
        },
      '.cm-activeLine': {
        backgroundColor: '#44475a50',
      },
      '.cm-gutters': {
        backgroundColor: '#282a36',
        color: '#6272a4',
        border: 'none',
      },
    },
    { dark: true },
  ),
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.keyword, color: '#ff79c6' },
      {
        tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: '#f8f8f2',
      },
      { tag: [t.function(t.variableName), t.labelName], color: '#50fa7b' },
      {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: '#bd93f9',
      },
      { tag: [t.definition(t.name), t.separator], color: '#f8f8f2' },
      {
        tag: [
          t.typeName,
          t.className,
          t.number,
          t.changed,
          t.annotation,
          t.modifier,
          t.self,
          t.namespace,
        ],
        color: '#bd93f9',
      },
      {
        tag: [
          t.operator,
          t.operatorKeyword,
          t.url,
          t.escape,
          t.regexp,
          t.link,
          t.special(t.string),
        ],
        color: '#ff79c6',
      },
      { tag: [t.meta, t.comment], color: '#6272a4' },
      { tag: t.strong, fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: t.strikethrough, textDecoration: 'line-through' },
      { tag: t.link, color: '#6272a4', textDecoration: 'underline' },
      { tag: t.heading, fontWeight: 'bold', color: '#ff79c6' },
      { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#bd93f9' },
      {
        tag: [t.processingInstruction, t.string, t.inserted],
        color: '#f1fa8c',
      },
      { tag: t.invalid, color: '#ff5555' },
    ]),
  ),
];

const monokaiTheme = [
  CMEditorView.theme(
    {
      '&': {
        backgroundColor: '#272822',
        color: '#f8f8f2',
      },
      '.cm-content': {
        caretColor: '#f8f8f0',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: '#f8f8f0',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: '#49483e',
        },
      '.cm-activeLine': {
        backgroundColor: '#3e3d32',
      },
      '.cm-gutters': {
        backgroundColor: '#272822',
        color: '#90908a',
        border: 'none',
      },
    },
    { dark: true },
  ),
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.keyword, color: '#f92672' },
      {
        tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: '#f8f8f2',
      },
      { tag: [t.function(t.variableName), t.labelName], color: '#a6e22e' },
      {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: '#ae81ff',
      },
      { tag: [t.definition(t.name), t.separator], color: '#f8f8f2' },
      {
        tag: [
          t.typeName,
          t.className,
          t.number,
          t.changed,
          t.annotation,
          t.modifier,
          t.self,
          t.namespace,
        ],
        color: '#ae81ff',
      },
      {
        tag: [
          t.operator,
          t.operatorKeyword,
          t.url,
          t.escape,
          t.regexp,
          t.link,
          t.special(t.string),
        ],
        color: '#f92672',
      },
      { tag: [t.meta, t.comment], color: '#75715e' },
      { tag: t.strong, fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: t.strikethrough, textDecoration: 'line-through' },
      { tag: t.link, color: '#75715e', textDecoration: 'underline' },
      { tag: t.heading, fontWeight: 'bold', color: '#f92672' },
      { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#ae81ff' },
      {
        tag: [t.processingInstruction, t.string, t.inserted],
        color: '#e6db74',
      },
      { tag: t.invalid, color: '#f92672' },
    ]),
  ),
];

const nordTheme = [
  CMEditorView.theme(
    {
      '&': {
        backgroundColor: '#2e3440',
        color: '#d8dee9',
      },
      '.cm-content': {
        caretColor: '#d8dee9',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: '#d8dee9',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: '#434c5e',
        },
      '.cm-activeLine': {
        backgroundColor: '#3b4252',
      },
      '.cm-gutters': {
        backgroundColor: '#2e3440',
        color: '#4c566a',
        border: 'none',
      },
    },
    { dark: true },
  ),
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.keyword, color: '#81a1c1' },
      {
        tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: '#d8dee9',
      },
      { tag: [t.function(t.variableName), t.labelName], color: '#88c0d0' },
      {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: '#b48ead',
      },
      { tag: [t.definition(t.name), t.separator], color: '#d8dee9' },
      {
        tag: [
          t.typeName,
          t.className,
          t.number,
          t.changed,
          t.annotation,
          t.modifier,
          t.self,
          t.namespace,
        ],
        color: '#b48ead',
      },
      {
        tag: [
          t.operator,
          t.operatorKeyword,
          t.url,
          t.escape,
          t.regexp,
          t.link,
          t.special(t.string),
        ],
        color: '#81a1c1',
      },
      { tag: [t.meta, t.comment], color: '#616e88' },
      { tag: t.strong, fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: t.strikethrough, textDecoration: 'line-through' },
      { tag: t.link, color: '#616e88', textDecoration: 'underline' },
      { tag: t.heading, fontWeight: 'bold', color: '#81a1c1' },
      { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#b48ead' },
      {
        tag: [t.processingInstruction, t.string, t.inserted],
        color: '#a3be8c',
      },
      { tag: t.invalid, color: '#bf616a' },
    ]),
  ),
];

const solarizedDarkTheme = [
  CMEditorView.theme(
    {
      '&': {
        backgroundColor: '#002b36',
        color: '#839496',
      },
      '.cm-content': {
        caretColor: '#839496',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: '#839496',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: '#073642',
        },
      '.cm-activeLine': {
        backgroundColor: '#073642',
      },
      '.cm-gutters': {
        backgroundColor: '#002b36',
        color: '#586e75',
        border: 'none',
      },
    },
    { dark: true },
  ),
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.keyword, color: '#859900' },
      {
        tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: '#839496',
      },
      { tag: [t.function(t.variableName), t.labelName], color: '#268bd2' },
      {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: '#cb4b16',
      },
      { tag: [t.definition(t.name), t.separator], color: '#839496' },
      {
        tag: [
          t.typeName,
          t.className,
          t.number,
          t.changed,
          t.annotation,
          t.modifier,
          t.self,
          t.namespace,
        ],
        color: '#cb4b16',
      },
      {
        tag: [
          t.operator,
          t.operatorKeyword,
          t.url,
          t.escape,
          t.regexp,
          t.link,
          t.special(t.string),
        ],
        color: '#859900',
      },
      { tag: [t.meta, t.comment], color: '#586e75' },
      { tag: t.strong, fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: t.strikethrough, textDecoration: 'line-through' },
      { tag: t.link, color: '#586e75', textDecoration: 'underline' },
      { tag: t.heading, fontWeight: 'bold', color: '#859900' },
      { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#cb4b16' },
      {
        tag: [t.processingInstruction, t.string, t.inserted],
        color: '#2aa198',
      },
      { tag: t.invalid, color: '#dc322f' },
    ]),
  ),
];

const solarizedLightTheme = [
  CMEditorView.theme(
    {
      '&': {
        backgroundColor: '#fdf6e3',
        color: '#657b83',
      },
      '.cm-content': {
        caretColor: '#657b83',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: '#657b83',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
        {
          backgroundColor: '#eee8d5',
        },
      '.cm-activeLine': {
        backgroundColor: '#eee8d5',
      },
      '.cm-gutters': {
        backgroundColor: '#fdf6e3',
        color: '#93a1a1',
        border: 'none',
      },
    },
    { dark: false },
  ),
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.keyword, color: '#859900' },
      {
        tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
        color: '#657b83',
      },
      { tag: [t.function(t.variableName), t.labelName], color: '#268bd2' },
      {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: '#cb4b16',
      },
      { tag: [t.definition(t.name), t.separator], color: '#657b83' },
      {
        tag: [
          t.typeName,
          t.className,
          t.number,
          t.changed,
          t.annotation,
          t.modifier,
          t.self,
          t.namespace,
        ],
        color: '#cb4b16',
      },
      {
        tag: [
          t.operator,
          t.operatorKeyword,
          t.url,
          t.escape,
          t.regexp,
          t.link,
          t.special(t.string),
        ],
        color: '#859900',
      },
      { tag: [t.meta, t.comment], color: '#93a1a1' },
      { tag: t.strong, fontWeight: 'bold' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: t.strikethrough, textDecoration: 'line-through' },
      { tag: t.link, color: '#93a1a1', textDecoration: 'underline' },
      { tag: t.heading, fontWeight: 'bold', color: '#859900' },
      { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#cb4b16' },
      {
        tag: [t.processingInstruction, t.string, t.inserted],
        color: '#2aa198',
      },
      { tag: t.invalid, color: '#dc322f' },
    ]),
  ),
];

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme: string;
  fontSize: number;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
}

const getLanguageSupport = (language: string) => {
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'jsx':
      return javascript({ jsx: true });
    case 'typescript':
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'python':
      return python();
    case 'java':
      return java();
    case 'csharp':
    case 'cpp':
      return cpp();
    case 'rust':
      return rust();
    case 'php':
      return php();
    case 'html':
      return html();
    case 'css':
      return css();
    case 'json':
      return json();
    case 'markdown':
      return markdown();
    case 'sql':
      return sql();
    default:
      return javascript();
  }
};

const getThemeExtension = (themeName: string) => {
  switch (themeName) {
    case 'dracula':
      return draculaTheme;
    case 'one-dark':
      return oneDark;
    case 'github-dark':
      return githubDark;
    case 'github-light':
      return githubLight;
    case 'monokai':
      return monokaiTheme;
    case 'nord':
      return nordTheme;
    case 'solarized-dark':
      return solarizedDarkTheme;
    case 'solarized-light':
      return solarizedLightTheme;
    default:
      return oneDark;
  }
};

export function CodeEditor({
  value,
  onChange,
  language,
  theme,
  fontSize,
  fontFamily,
  backgroundColor,
  textColor,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const customTheme = EditorView.theme({
      '&': {
        backgroundColor: 'transparent',
        fontSize: `${fontSize}px`,
        fontFamily: `${fontFamily}, monospace`,
        height: '100%',
      },
      '.cm-content': {
        caretColor: textColor,
        fontFamily: `${fontFamily}, monospace`,
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: `${fontFamily}, monospace`,
      },
      '&.cm-focused': {
        outline: 'none',
      },
      '.cm-line': {
        fontFamily: `${fontFamily}, monospace`,
      },
    });

    const startState = EditorState.create({
      doc: value,
      extensions: [
        getLanguageSupport(language),
        getThemeExtension(theme),
        customTheme,
        lineNumbers(),
        autocompletion(),
        closeBrackets(),
        keymap.of([...defaultKeymap, ...closeBracketsKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language, theme, fontSize, fontFamily, backgroundColor, textColor]);

  // Update content when value changes externally
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return <div ref={editorRef} className="h-full w-full min-h-[200px]" />;
}
