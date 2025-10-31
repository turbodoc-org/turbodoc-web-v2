'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CodeEditor } from '@/components/code-snippet/code-editor';
import {
  createCodeSnippet,
  getCodeSnippets,
  updateCodeSnippet,
} from '@/lib/api';
import { Check, Download, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { toPng, toSvg } from 'html-to-image';

interface CodeSnippetEditorProps {
  snippetId: string | null;
  onClose: () => void;
}

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'html',
  'css',
  'sql',
  'bash',
  'json',
  'yaml',
  'markdown',
];

const THEMES = [
  { value: 'dracula', label: 'Dracula', bg: '#282a36', fg: '#f8f8f2' },
  { value: 'one-dark', label: 'One Dark', bg: '#282c34', fg: '#abb2bf' },
  { value: 'github-dark', label: 'GitHub Dark', bg: '#0d1117', fg: '#c9d1d9' },
  {
    value: 'github-light',
    label: 'GitHub Light',
    bg: '#ffffff',
    fg: '#24292f',
  },
  { value: 'monokai', label: 'Monokai', bg: '#272822', fg: '#f8f8f2' },
  { value: 'nord', label: 'Nord', bg: '#2e3440', fg: '#d8dee9' },
  {
    value: 'solarized-dark',
    label: 'Solarized Dark',
    bg: '#002b36',
    fg: '#839496',
  },
  {
    value: 'solarized-light',
    label: 'Solarized Light',
    bg: '#fdf6e3',
    fg: '#657b83',
  },
];

const BACKGROUND_PRESETS = [
  {
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    label: 'Purple Dream',
  },
  {
    type: 'gradient',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    label: 'Pink Sunset',
  },
  {
    type: 'gradient',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    label: 'Ocean Blue',
  },
  {
    type: 'gradient',
    value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    label: 'Mint Fresh',
  },
  {
    type: 'gradient',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    label: 'Sunrise',
  },
  {
    type: 'gradient',
    value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    label: 'Deep Ocean',
  },
  {
    type: 'gradient',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    label: 'Pastel Dream',
  },
  {
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 55%, #fecfef 100%)',
    label: 'Cotton Candy',
  },
];

const FONTS = [
  'Fira Code',
  'JetBrains Mono',
  'Monaco',
  'Consolas',
  'Courier New',
];

const WINDOW_STYLES = [
  { value: 'mac', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
  { value: 'none', label: 'None' },
];

export function CodeSnippetEditor({
  snippetId,
  onClose,
}: CodeSnippetEditorProps) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'saved' | 'saving' | 'idle'
  >('idle');
  const previewRef = useRef<HTMLDivElement>(null);
  const currentSnippetIdRef = useRef<string | null>(snippetId);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    language: 'javascript',
    theme: 'dracula',
    background_type: 'gradient',
    background_value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: 64,
    show_line_numbers: true,
    font_family: 'Fira Code',
    font_size: 14,
    window_style: 'mac',
  });

  // Debounce form data for auto-save
  const debouncedFormData = useDebounce(formData, 1000);

  // Fetch snippet if editing
  const { data: snippets } = useQuery({
    queryKey: ['codeSnippets'],
    queryFn: getCodeSnippets,
    enabled: !!snippetId,
  });

  // Initialize form data when snippet loads
  useEffect(() => {
    if (snippetId && snippets) {
      const snippet = snippets.find((s) => s.id === snippetId);
      if (snippet) {
        setFormData({
          title: snippet.title,
          code: snippet.code,
          language: snippet.language,
          theme: snippet.theme,
          background_type: snippet.background_type,
          background_value: snippet.background_value,
          padding: snippet.padding,
          show_line_numbers: snippet.show_line_numbers,
          font_family: snippet.font_family,
          font_size: snippet.font_size,
          window_style: snippet.window_style,
        });
        currentSnippetIdRef.current = snippetId;
      }
    }
  }, [snippetId, snippets]);

  // Create snippet mutation
  const createSnippetMutation = useMutation({
    mutationFn: createCodeSnippet,
    onSuccess: (newSnippet) => {
      queryClient.setQueryData(['codeSnippets'], (old: any[] = []) => [
        newSnippet,
        ...old,
      ]);
      currentSnippetIdRef.current = newSnippet.id;
    },
  });

  // Update snippet mutation
  const updateSnippetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCodeSnippet(id, data),
    onSuccess: (updatedSnippet) => {
      queryClient.setQueryData(['codeSnippets'], (old: any[] = []) =>
        old.map((s) => (s.id === updatedSnippet.id ? updatedSnippet : s)),
      );
    },
  });

  // Auto-save effect
  useEffect(() => {
    // Don't auto-save if there's no code or if this is the initial load
    if (!debouncedFormData.code.trim() || autoSaveStatus === 'idle') {
      return;
    }

    const autoSave = async () => {
      try {
        setAutoSaveStatus('saving');

        // Generate a title if empty
        const title =
          debouncedFormData.title.trim() ||
          `Untitled ${debouncedFormData.language} snippet`;
        const dataToSave = { ...debouncedFormData, title };

        if (currentSnippetIdRef.current) {
          // Update existing
          await updateSnippetMutation.mutateAsync({
            id: currentSnippetIdRef.current,
            data: dataToSave,
          });
        } else {
          // Create new and store the ID
          await createSnippetMutation.mutateAsync(dataToSave);
        }

        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('idle');
      }
    };

    autoSave();
  }, [
    debouncedFormData,
    autoSaveStatus,
    createSnippetMutation,
    updateSnippetMutation,
  ]);

  // Mark as ready for auto-save after initial load
  useEffect(() => {
    if (formData.code.trim()) {
      setAutoSaveStatus('idle');
    }
  }, [formData.code]);

  const handleSave = async () => {
    if (!formData.code.trim()) {
      alert('Please provide some code to save');
      return;
    }

    try {
      setIsSaving(true);

      // Generate a title if empty
      const title =
        formData.title.trim() || `Untitled ${formData.language} snippet`;
      const dataToSave = { ...formData, title };

      if (currentSnippetIdRef.current) {
        await updateSnippetMutation.mutateAsync({
          id: currentSnippetIdRef.current,
          data: dataToSave,
        });
      } else {
        await createSnippetMutation.mutateAsync(dataToSave);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save snippet:', error);
      alert('Failed to save snippet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSVG = async () => {
    if (!previewRef.current) return;

    try {
      const dataUrl = await toSvg(previewRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${formData.title.trim() || 'code-snippet'}.svg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export SVG:', error);
      alert('Failed to export SVG. Please try again.');
    }
  };

  const handleExportPNG = async () => {
    if (!previewRef.current) return;

    try {
      const dataUrl = await toPng(previewRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${formData.title.trim() || 'code-snippet'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export PNG:', error);
      alert('Failed to export PNG. Please try again.');
    }
  };

  const selectedTheme =
    THEMES.find((t) => t.value === formData.theme) || THEMES[0];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-7xl h-[90vh] bg-background border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              {snippetId ? 'Edit' : 'Create'} Code Screenshot
            </h2>
            {autoSaveStatus === 'saving' && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSVG}
              disabled={!formData.code.trim()}
            >
              <Download className="h-4 w-4 mr-2" />
              Export SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPNG}
              disabled={!formData.code.trim()}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !formData.code.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save & Close
                </>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Editor Area - Merged Preview + Editor */}
          <div className="flex-1 overflow-auto bg-muted/30 p-8">
            <div className="flex items-center justify-center min-h-full">
              <div
                ref={previewRef}
                className="relative rounded-lg shadow-2xl overflow-hidden"
                style={{
                  padding: `${formData.padding}px`,
                  background: formData.background_value,
                }}
              >
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: selectedTheme.bg,
                    padding: '20px',
                  }}
                >
                  {formData.window_style !== 'none' && (
                    <div className="flex gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  )}
                  <div className="min-h-[200px] min-w-[400px]">
                    <CodeEditor
                      value={formData.code}
                      onChange={(code) => setFormData({ ...formData, code })}
                      language={formData.language}
                      theme={formData.theme}
                      fontSize={formData.font_size}
                      fontFamily={formData.font_family}
                      backgroundColor={selectedTheme.bg}
                      textColor={selectedTheme.fg}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel - Always visible on the right */}
          <div className="w-80 border-l border-border p-4 overflow-y-auto bg-background">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="My Awesome Code"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="mt-1.5 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={formData.theme}
                  onChange={(e) =>
                    setFormData({ ...formData, theme: e.target.value })
                  }
                  className="mt-1.5 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {THEMES.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Background</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {BACKGROUND_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          background_type: preset.type,
                          background_value: preset.value,
                        })
                      }
                      className={`h-12 rounded border-2 transition-all ${
                        formData.background_value === preset.value
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ background: preset.value }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="font">Font</Label>
                <select
                  id="font"
                  value={formData.font_family}
                  onChange={(e) =>
                    setFormData({ ...formData, font_family: e.target.value })
                  }
                  className="mt-1.5 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="fontSize">
                  Font Size: {formData.font_size}px
                </Label>
                <input
                  id="fontSize"
                  type="range"
                  min="10"
                  max="24"
                  value={formData.font_size}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      font_size: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="padding">Padding: {formData.padding}px</Label>
                <input
                  id="padding"
                  type="range"
                  min="32"
                  max="128"
                  step="8"
                  value={formData.padding}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      padding: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="windowStyle">Window Style</Label>
                <select
                  id="windowStyle"
                  value={formData.window_style}
                  onChange={(e) =>
                    setFormData({ ...formData, window_style: e.target.value })
                  }
                  className="mt-1.5 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {WINDOW_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
