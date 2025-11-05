import { useHotkeys } from 'react-hotkeys-hook';

export type Tool =
  | 'rectangle'
  | 'circle'
  | 'database'
  | 'text'
  | 'diamond'
  | 'image'
  | 'select'
  | 'arrow';

interface UseCanvasHotkeysProps {
  // Tool management
  tool: Tool;
  setTool: (tool: Tool) => void;

  // Selection & editing
  selectedId: string | null;
  selectedConnectionId: string | null;
  deleteSelected: () => void;
  duplicateSelected?: () => void;
  selectAll?: () => void;
  selectNext?: () => void;
  selectPrevious?: () => void;
  editSelected?: () => void;

  // Shape manipulation
  moveShape?: (dx: number, dy: number) => void;

  // Font size
  increaseFontSize?: () => void;
  decreaseFontSize?: () => void;

  // Canvas
  zoom: number;
  setZoom: (zoom: number) => void;
  resetZoom?: () => void;
  fitToScreen?: () => void;

  // Undo/Redo
  undo: () => void;
  redo?: () => void;

  // Save & Export
  save?: () => void;
  exportPNG?: () => void;
  exportPDF?: () => void;
  exportJSON?: () => void;

  // UI
  openCommandPalette: () => void;
  openShortcutsDialog: () => void;

  // State
  isEditing: boolean;
  canUndo: boolean;
  canRedo?: boolean;
}

export function useCanvasHotkeys(props: UseCanvasHotkeysProps) {
  const {
    setTool,
    selectedId,
    selectedConnectionId,
    deleteSelected,
    duplicateSelected,
    selectAll,
    selectNext,
    selectPrevious,
    editSelected,
    moveShape,
    increaseFontSize,
    decreaseFontSize,
    zoom,
    setZoom,
    resetZoom,
    fitToScreen,
    undo,
    redo,
    save,
    exportPNG,
    exportJSON,
    openCommandPalette,
    openShortcutsDialog,
    isEditing,
    canUndo,
    canRedo,
  } = props;

  // Determine if hotkeys should be enabled (disabled when editing text)
  const enabled = !isEditing;

  // Global shortcuts (always active except when editing)
  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault();
      openCommandPalette();
    },
    { enabled: true, enableOnFormTags: false },
  );

  // Use shift+/ instead of ? for better compatibility
  useHotkeys(
    'shift+slash, shift+/',
    (e) => {
      e.preventDefault();
      openShortcutsDialog();
    },
    { enabled: true, enableOnFormTags: false },
  );

  useHotkeys(
    'escape',
    () => {
      // Cancel current action - handled in component
    },
    { enabled: true },
  );

  // Save & Undo (global)
  useHotkeys(
    'mod+s',
    (e) => {
      e.preventDefault();
      save?.();
    },
    { enabled: true, enableOnFormTags: false },
  );

  useHotkeys(
    'mod+z',
    (e) => {
      e.preventDefault();
      if (canUndo) undo();
    },
    { enabled: true, enableOnFormTags: false },
  );

  useHotkeys(
    'mod+shift+z, mod+y',
    (e) => {
      e.preventDefault();
      if (canRedo) redo?.();
    },
    { enabled: true, enableOnFormTags: false },
  );

  // Tool selection
  useHotkeys(
    'v',
    (e) => {
      e.preventDefault();
      setTool('select');
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'r',
    (e) => {
      e.preventDefault();
      setTool('rectangle');
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'c',
    (e) => {
      e.preventDefault();
      setTool('circle');
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'd',
    (e) => {
      e.preventDefault();
      setTool('database');
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    't',
    (e) => {
      e.preventDefault();
      setTool('text');
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'm',
    (e) => {
      e.preventDefault();
      setTool('diamond');
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'i',
    (e) => {
      e.preventDefault();
      setTool('image');
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'a',
    (e) => {
      e.preventDefault();
      setTool('arrow');
    },
    { enabled, enableOnFormTags: false },
  );

  // Selection & Editing
  useHotkeys(
    'delete, backspace',
    (e) => {
      if (selectedId || selectedConnectionId) {
        e.preventDefault();
        deleteSelected();
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'enter',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        editSelected?.();
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'mod+a',
    (e) => {
      e.preventDefault();
      selectAll?.();
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'mod+d',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        duplicateSelected?.();
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'tab',
    (e) => {
      e.preventDefault();
      selectNext?.();
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'shift+tab',
    (e) => {
      e.preventDefault();
      selectPrevious?.();
    },
    { enabled, enableOnFormTags: false },
  );

  // Movement
  useHotkeys(
    'arrowup',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        moveShape?.(0, -1);
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'arrowdown',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        moveShape?.(0, 1);
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'arrowleft',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        moveShape?.(-1, 0);
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'arrowright',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        moveShape?.(1, 0);
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'shift+arrowup',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        moveShape?.(0, -10);
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'shift+arrowdown',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        moveShape?.(0, 10);
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'shift+arrowleft',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        moveShape?.(-10, 0);
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'shift+arrowright',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        moveShape?.(10, 0);
      }
    },
    { enabled, enableOnFormTags: false },
  );

  // Font size
  useHotkeys(
    '[',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        decreaseFontSize?.();
      }
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    ']',
    (e) => {
      if (selectedId) {
        e.preventDefault();
        increaseFontSize?.();
      }
    },
    { enabled, enableOnFormTags: false },
  );

  // Zoom & Canvas
  useHotkeys(
    'mod+0',
    (e) => {
      e.preventDefault();
      resetZoom?.();
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'mod+plus, mod+=',
    (e) => {
      e.preventDefault();
      setZoom(Math.min(zoom + 0.1, 3));
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'mod+minus',
    (e) => {
      e.preventDefault();
      setZoom(Math.max(zoom - 0.1, 0.1));
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'f',
    (e) => {
      e.preventDefault();
      fitToScreen?.();
    },
    { enabled, enableOnFormTags: false },
  );

  // Export
  useHotkeys(
    'mod+e',
    (e) => {
      e.preventDefault();
      exportJSON?.();
    },
    { enabled, enableOnFormTags: false },
  );

  useHotkeys(
    'mod+shift+e',
    (e) => {
      e.preventDefault();
      exportPNG?.();
    },
    { enabled, enableOnFormTags: false },
  );
}
