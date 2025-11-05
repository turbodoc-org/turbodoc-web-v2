'use client';

import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import {
  Square,
  Circle,
  Database,
  Type,
  Diamond,
  Image as ImageIcon,
  ArrowRight,
  MousePointer2,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Home,
  FolderOpen,
  Keyboard,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from '@tanstack/react-router';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommand: (action: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onCommand,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const handleSelect = useCallback(
    (action: string) => {
      onCommand(action);
      onOpenChange(false);
    },
    [onCommand, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <Command.Input
            placeholder="Type a command or search..."
            value={search}
            onValueChange={setSearch}
            className="flex h-12 w-full rounded-md bg-transparent py-3 px-4 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-b border-border"
          />
          <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Tools">
              <Command.Item
                onSelect={() => handleSelect('tool_select')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <MousePointer2 className="h-4 w-4" />
                <span>Select Tool</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  V
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('tool_rectangle')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Square className="h-4 w-4" />
                <span>Rectangle Tool</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  R
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('tool_circle')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Circle className="h-4 w-4" />
                <span>Circle Tool</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  C
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('tool_database')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Database className="h-4 w-4" />
                <span>Database Tool</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  D
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('tool_text')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Type className="h-4 w-4" />
                <span>Text Tool</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  T
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('tool_diamond')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Diamond className="h-4 w-4" />
                <span>Diamond Tool</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  M
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('tool_image')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Image Tool</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  I
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('tool_arrow')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Arrow Tool</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  A
                </kbd>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions">
              <Command.Item
                onSelect={() => handleSelect('save')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Save className="h-4 w-4" />
                <span>Save Diagram</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ⌘S
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('undo')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Undo className="h-4 w-4" />
                <span>Undo</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ⌘Z
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('redo')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Redo className="h-4 w-4" />
                <span>Redo</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ⌘⇧Z
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('delete')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  DEL
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('duplicate')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Copy className="h-4 w-4" />
                <span>Duplicate Selected</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ⌘D
                </kbd>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Export">
              <Command.Item
                onSelect={() => handleSelect('export_png')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Download className="h-4 w-4" />
                <span>Export as PNG</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ⌘⇧E
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('export_pdf')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Download className="h-4 w-4" />
                <span>Export as PDF</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('export_json')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                <span>Export as JSON</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="View">
              <Command.Item
                onSelect={() => handleSelect('zoom_in')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <ZoomIn className="h-4 w-4" />
                <span>Zoom In</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ⌘+
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('zoom_out')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <ZoomOut className="h-4 w-4" />
                <span>Zoom Out</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ⌘-
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('zoom_reset')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Maximize2 className="h-4 w-4" />
                <span>Reset Zoom</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ⌘0
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect('fit_screen')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Maximize2 className="h-4 w-4" />
                <span>Fit to Screen</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  F
                </kbd>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => {
                  onOpenChange(false);
                  navigate({ to: '/' });
                }}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Home className="h-4 w-4" />
                <span>Go to Home</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  onOpenChange(false);
                  navigate({ to: '/diagrams' });
                }}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <FolderOpen className="h-4 w-4" />
                <span>Go to My Diagrams</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Help">
              <Command.Item
                onSelect={() => handleSelect('show_shortcuts')}
                className="flex items-center gap-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent"
              >
                <Keyboard className="h-4 w-4" />
                <span>Keyboard Shortcuts</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  ?
                </kbd>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
