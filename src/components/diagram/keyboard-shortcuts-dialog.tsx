'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getShortcutsByCategory,
  formatHotkeyForDisplay,
} from '@/lib/hotkeys/hotkeyConfig';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const shortcuts = getShortcutsByCategory();
  const categoryOrder = [
    'Global',
    'Tools',
    'Selection',
    'Editing',
    'Movement',
    'Styling',
    'Canvas',
    'File',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and work faster
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {categoryOrder.map((category) => {
            if (!shortcuts[category]) return null;

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts[category].map((shortcut, index) => (
                    <div
                      key={`${shortcut.key}-${index}`}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <kbd className="pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
                        {formatHotkeyForDisplay(shortcut.key)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
          Press{' '}
          <kbd className="px-2 py-1 bg-muted rounded border border-border">
            ?
          </kbd>{' '}
          to toggle this dialog
        </div>
      </DialogContent>
    </Dialog>
  );
}
