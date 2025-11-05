/**
 * Central configuration for all keyboard shortcuts
 * This makes it easy to maintain, document, and change shortcuts
 */

export interface HotkeyConfig {
  key: string;
  description: string;
  category: string;
  action: string; // identifier for the action
  global?: boolean; // if true, works everywhere
  preventDefault?: boolean;
}

export const hotkeyConfig: HotkeyConfig[] = [
  // Global shortcuts (always active)
  {
    key: 'mod+k',
    description: 'Open command palette',
    category: 'Global',
    action: 'command_palette',
    global: true,
    preventDefault: true,
  },
  {
    key: 'mod+s',
    description: 'Save diagram',
    category: 'Global',
    action: 'save',
    global: true,
    preventDefault: true,
  },
  {
    key: 'mod+z',
    description: 'Undo',
    category: 'Global',
    action: 'undo',
    global: true,
    preventDefault: true,
  },
  {
    key: 'mod+shift+z',
    description: 'Redo',
    category: 'Global',
    action: 'redo',
    global: true,
    preventDefault: true,
  },
  {
    key: 'mod+y',
    description: 'Redo (alternative)',
    category: 'Global',
    action: 'redo',
    global: true,
    preventDefault: true,
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts',
    category: 'Global',
    action: 'show_shortcuts',
    global: true,
    preventDefault: true,
  },
  {
    key: 'escape',
    description: 'Cancel current action',
    category: 'Global',
    action: 'cancel',
    global: true,
  },

  // Tool selection (single keys)
  {
    key: 'v',
    description: 'Select tool',
    category: 'Tools',
    action: 'tool_select',
    preventDefault: true,
  },
  {
    key: 'r',
    description: 'Rectangle tool',
    category: 'Tools',
    action: 'tool_rectangle',
    preventDefault: true,
  },
  {
    key: 'c',
    description: 'Circle tool',
    category: 'Tools',
    action: 'tool_circle',
    preventDefault: true,
  },
  {
    key: 'd',
    description: 'Database tool',
    category: 'Tools',
    action: 'tool_database',
    preventDefault: true,
  },
  {
    key: 't',
    description: 'Text tool',
    category: 'Tools',
    action: 'tool_text',
    preventDefault: true,
  },
  {
    key: 'm',
    description: 'Diamond tool',
    category: 'Tools',
    action: 'tool_diamond',
    preventDefault: true,
  },
  {
    key: 'i',
    description: 'Image tool',
    category: 'Tools',
    action: 'tool_image',
    preventDefault: true,
  },
  {
    key: 'a',
    description: 'Arrow/Connector tool',
    category: 'Tools',
    action: 'tool_arrow',
    preventDefault: true,
  },

  // Selection & Editing
  {
    key: 'delete',
    description: 'Delete selected',
    category: 'Editing',
    action: 'delete',
    preventDefault: true,
  },
  {
    key: 'backspace',
    description: 'Delete selected',
    category: 'Editing',
    action: 'delete',
    preventDefault: true,
  },
  {
    key: 'enter',
    description: 'Edit selected text',
    category: 'Editing',
    action: 'edit',
    preventDefault: true,
  },
  {
    key: 'mod+a',
    description: 'Select all',
    category: 'Selection',
    action: 'select_all',
    preventDefault: true,
  },
  {
    key: 'mod+d',
    description: 'Duplicate selected',
    category: 'Editing',
    action: 'duplicate',
    preventDefault: true,
  },
  {
    key: 'tab',
    description: 'Select next shape',
    category: 'Selection',
    action: 'select_next',
    preventDefault: true,
  },
  {
    key: 'shift+tab',
    description: 'Select previous shape',
    category: 'Selection',
    action: 'select_previous',
    preventDefault: true,
  },

  // Movement (arrow keys)
  {
    key: 'arrowup',
    description: 'Move selected up (1px)',
    category: 'Movement',
    action: 'move_up',
    preventDefault: true,
  },
  {
    key: 'arrowdown',
    description: 'Move selected down (1px)',
    category: 'Movement',
    action: 'move_down',
    preventDefault: true,
  },
  {
    key: 'arrowleft',
    description: 'Move selected left (1px)',
    category: 'Movement',
    action: 'move_left',
    preventDefault: true,
  },
  {
    key: 'arrowright',
    description: 'Move selected right (1px)',
    category: 'Movement',
    action: 'move_right',
    preventDefault: true,
  },
  {
    key: 'shift+arrowup',
    description: 'Move selected up (10px)',
    category: 'Movement',
    action: 'move_up_large',
    preventDefault: true,
  },
  {
    key: 'shift+arrowdown',
    description: 'Move selected down (10px)',
    category: 'Movement',
    action: 'move_down_large',
    preventDefault: true,
  },
  {
    key: 'shift+arrowleft',
    description: 'Move selected left (10px)',
    category: 'Movement',
    action: 'move_left_large',
    preventDefault: true,
  },
  {
    key: 'shift+arrowright',
    description: 'Move selected right (10px)',
    category: 'Movement',
    action: 'move_right_large',
    preventDefault: true,
  },

  // Font size
  {
    key: '[',
    description: 'Decrease font size',
    category: 'Styling',
    action: 'font_decrease',
    preventDefault: true,
  },
  {
    key: ']',
    description: 'Increase font size',
    category: 'Styling',
    action: 'font_increase',
    preventDefault: true,
  },

  // Zoom & Canvas
  {
    key: 'mod+0',
    description: 'Reset zoom to 100%',
    category: 'Canvas',
    action: 'zoom_reset',
    preventDefault: true,
  },
  {
    key: 'mod+plus',
    description: 'Zoom in',
    category: 'Canvas',
    action: 'zoom_in',
    preventDefault: true,
  },
  {
    key: 'mod+=',
    description: 'Zoom in (alternative)',
    category: 'Canvas',
    action: 'zoom_in',
    preventDefault: true,
  },
  {
    key: 'mod+minus',
    description: 'Zoom out',
    category: 'Canvas',
    action: 'zoom_out',
    preventDefault: true,
  },
  {
    key: 'f',
    description: 'Fit diagram to screen',
    category: 'Canvas',
    action: 'fit_screen',
    preventDefault: true,
  },

  // Export
  {
    key: 'mod+e',
    description: 'Export diagram',
    category: 'File',
    action: 'export',
    preventDefault: true,
  },
  {
    key: 'mod+shift+e',
    description: 'Export as PNG',
    category: 'File',
    action: 'export_png',
    preventDefault: true,
  },
];

// Helper to get shortcuts by category
export const getShortcutsByCategory = () => {
  const categories: Record<string, HotkeyConfig[]> = {};

  hotkeyConfig.forEach((config) => {
    if (!categories[config.category]) {
      categories[config.category] = [];
    }
    categories[config.category].push(config);
  });

  return categories;
};

// Helper to format key for display
export const formatHotkeyForDisplay = (key: string): string => {
  return key
    .replace('mod+', '⌘')
    .replace('shift+', '⇧')
    .replace('alt+', '⌥')
    .replace('ctrl+', '⌃')
    .replace('arrowup', '↑')
    .replace('arrowdown', '↓')
    .replace('arrowleft', '←')
    .replace('arrowright', '→')
    .toUpperCase();
};
