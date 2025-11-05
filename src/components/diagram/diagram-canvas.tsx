'use client';

import type React from 'react';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Square,
  Circle,
  Database,
  Type,
  MousePointer2,
  Trash2,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  Diamond,
  MoreVertical,
  Image as ImageIcon,
  ChevronDown,
  FileText,
  Braces,
  FileImage,
  Cloud,
  CloudOff,
  Save,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from 'use-debounce';
import { CommandPalette } from '@/components/diagram/command-palette';
import { KeyboardShortcutsDialog } from '@/components/diagram/keyboard-shortcuts-dialog';
import { useCanvasHotkeys } from '@/lib/hotkeys/useCanvasHotkeys';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createDiagram, updateDiagram } from '@/lib/api';
import { Image as UnpicImage } from '@unpic/react';
import { useNavigate } from '@tanstack/react-router';
import { LoginModal } from '../auth/login-modal';
import { supabase } from '@/lib/clients/supabase/client';

type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'database'
  | 'text'
  | 'diamond'
  | 'image';
type Tool = ShapeType | 'select' | 'arrow';

interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  fontSize?: number;
  imageUrl?: string;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

const SHAPE_COLORS: Record<ShapeType, string> = {
  rectangle: '#6366f1', // indigo
  circle: '#8b5cf6', // violet
  database: '#10b981', // emerald
  diamond: '#f59e0b', // amber
  text: '#ec4899', // pink
  image: '#3b82f6', // blue
};

const COLOR_PALETTE = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#f97316', // orange
];

interface DiagramCanvasProps {
  initialDiagram?: {
    id?: string;
    title?: string;
    shapes: Array<{
      id: string;
      type: ShapeType;
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
      color?: string;
      fontSize?: number;
      imageUrl?: string;
    }>;
    connections: Array<{
      id: string;
      from: string;
      to: string;
      fromAnchor?: string;
      toAnchor?: string;
    }>;
  };
}

export default function DiagramCanvas({
  initialDiagram,
}: DiagramCanvasProps = {}) {
  const [tool, setTool] = useState<Tool>('select');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [arrowFrom, setArrowFrom] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageShape, setPendingImageShape] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // History for undo functionality (max 5 states)
  const [history, setHistory] = useState<
    Array<{ shapes: Shape[]; connections: Connection[] }>
  >([]);
  const isUndoing = useRef(false);

  // Supabase auth and sync state
  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [debouncedShapes] = useDebounce(shapes, 10000); // 10 seconds
  const [debouncedConnections] = useDebounce(connections, 10000);

  // New diagram confirmation dialog
  const [showNewDiagramDialog, setShowNewDiagramDialog] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcuts UI
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

  // Save current state to history before making changes
  const saveToHistory = useCallback(() => {
    if (isUndoing.current) return;

    setHistory((prev) => {
      const newHistory = [...prev, { shapes, connections }];
      // Keep only the last 5 states
      return newHistory.slice(-5);
    });
  }, [shapes, connections]);

  // Undo function
  const undo = useCallback(() => {
    if (history.length === 0) return;

    isUndoing.current = true;

    setHistory((prev) => {
      if (prev.length === 0) return prev;

      const previousState = prev[prev.length - 1];
      setShapes(previousState.shapes);
      setConnections(previousState.connections);

      // Remove the last state from history
      return prev.slice(0, -1);
    });

    // Reset the flag after state updates
    setTimeout(() => {
      isUndoing.current = false;
    }, 0);
  }, [history]);

  // Keyboard action handlers
  const moveShape = useCallback(
    (dx: number, dy: number) => {
      if (!selectedId) return;
      saveToHistory();
      setShapes((prev) =>
        prev.map((shape) =>
          shape.id === selectedId
            ? { ...shape, x: shape.x + dx, y: shape.y + dy }
            : shape,
        ),
      );
    },
    [selectedId, saveToHistory],
  );

  const increaseFontSize = useCallback(() => {
    if (!selectedId) return;
    saveToHistory();
    setShapes((prev) =>
      prev.map((shape) =>
        shape.id === selectedId
          ? { ...shape, fontSize: Math.min((shape.fontSize || 14) + 2, 32) }
          : shape,
      ),
    );
  }, [selectedId, saveToHistory]);

  const decreaseFontSize = useCallback(() => {
    if (!selectedId) return;
    saveToHistory();
    setShapes((prev) =>
      prev.map((shape) =>
        shape.id === selectedId
          ? { ...shape, fontSize: Math.max((shape.fontSize || 14) - 2, 8) }
          : shape,
      ),
    );
  }, [selectedId, saveToHistory]);

  const duplicateSelected = useCallback(() => {
    if (!selectedId) return;
    saveToHistory();
    const shapeToDuplicate = shapes.find((s) => s.id === selectedId);
    if (shapeToDuplicate) {
      const newShape = {
        ...shapeToDuplicate,
        id: Date.now().toString(),
        x: shapeToDuplicate.x + 20,
        y: shapeToDuplicate.y + 20,
      };
      setShapes((prev) => [...prev, newShape]);
      setSelectedId(newShape.id);
    }
  }, [selectedId, shapes, saveToHistory]);

  const selectAll = useCallback(() => {
    if (shapes.length > 0) {
      setSelectedId(shapes[0].id);
    }
  }, [shapes]);

  const selectNext = useCallback(() => {
    const currentIndex = shapes.findIndex((s) => s.id === selectedId);
    if (currentIndex >= 0 && currentIndex < shapes.length - 1) {
      setSelectedId(shapes[currentIndex + 1].id);
    } else if (shapes.length > 0) {
      setSelectedId(shapes[0].id);
    }
  }, [shapes, selectedId]);

  const selectPrevious = useCallback(() => {
    const currentIndex = shapes.findIndex((s) => s.id === selectedId);
    if (currentIndex > 0) {
      setSelectedId(shapes[currentIndex - 1].id);
    } else if (shapes.length > 0) {
      setSelectedId(shapes[shapes.length - 1].id);
    }
  }, [shapes, selectedId]);

  const editSelected = useCallback(() => {
    if (selectedId) {
      setEditingId(selectedId);
    }
  }, [selectedId]);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const fitToScreen = useCallback(() => {
    if (shapes.length === 0) return;
    // Calculate bounding box of all shapes
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    shapes.forEach((shape) => {
      minX = Math.min(minX, shape.x);
      minY = Math.min(minY, shape.y);
      maxX = Math.max(maxX, shape.x + shape.width);
      maxY = Math.max(maxY, shape.y + shape.height);
    });

    if (canvasRef.current) {
      const padding = 50;
      const width = maxX - minX + padding * 2;
      const height = maxY - minY + padding * 2;
      const scaleX = canvasRef.current.clientWidth / width;
      const scaleY = canvasRef.current.clientHeight / height;
      const newZoom = Math.min(scaleX, scaleY, 1);
      setZoom(newZoom);
      setPanOffset({
        x: -(minX - padding) * newZoom,
        y: -(minY - padding) * newZoom,
      });
    }
  }, [shapes]);

  const handleCommandAction = useCallback((action: string) => {
    switch (action) {
      case 'tool_select':
        setTool('select');
        break;
      case 'tool_rectangle':
        setTool('rectangle');
        break;
      case 'tool_circle':
        setTool('circle');
        break;
      case 'tool_database':
        setTool('database');
        break;
      case 'tool_text':
        setTool('text');
        break;
      case 'tool_diamond':
        setTool('diamond');
        break;
      case 'tool_image':
        setTool('image');
        break;
      case 'tool_arrow':
        setTool('arrow');
        break;
      case 'delete':
        deleteSelected();
        break;
      case 'duplicate':
        duplicateSelected();
        break;
      case 'select_all':
        selectAll();
        break;
      case 'select_next':
        selectNext();
        break;
      case 'select_previous':
        selectPrevious();
        break;
      case 'edit':
        editSelected();
        break;
      case 'undo':
        undo();
        break;
      case 'save':
        handleManualSync();
        break;
      case 'zoom_in':
        setZoom((z) => Math.min(z + 0.1, 3));
        break;
      case 'zoom_out':
        setZoom((z) => Math.max(z - 0.1, 0.1));
        break;
      case 'zoom_reset':
        resetZoom();
        break;
      case 'fit_screen':
        fitToScreen();
        break;
      case 'export_png':
        exportAsPNG();
        break;
      case 'export_pdf':
        exportAsPDF();
        break;
      case 'export_json':
        exportDiagram();
        break;
      case 'show_shortcuts':
        setShowShortcutsDialog(true);
        break;
    }
  }, []);

  // Monitor auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id ?? null;
      setUserId(userId);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user?.id ?? null;

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        setUserId(null);
        setCurrentDiagramId(null);
        return;
      }

      // Handle sign in
      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        setUserId(newUserId);

        // If user just signed in and there's localStorage data, save it to Supabase
        if (newUserId) {
          // Use setTimeout to ensure shapes/connections state is up to date
          setTimeout(() => {
            const currentShapes = JSON.parse(
              localStorage.getItem('diagram-data') ||
                '{"shapes":[],"connections":[]}',
            );
            if (
              currentShapes.shapes?.length > 0 ||
              currentShapes.connections?.length > 0
            ) {
              handleAuthSuccess();
            }
          }, 100);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Load diagram from localStorage on mount or use initialDiagram
  useEffect(() => {
    // If initialDiagram is provided, use it instead of localStorage
    if (initialDiagram) {
      const convertedShapes = initialDiagram.shapes.map((s) => ({
        ...s,
        text: s.label,
        color: s.color || SHAPE_COLORS[s.type],
      }));
      setShapes(convertedShapes);
      setConnections(initialDiagram.connections as Connection[]);
      setCurrentDiagramId(initialDiagram.id || null);

      // Fit the diagram to screen after shapes are loaded
      if (convertedShapes.length > 0 && canvasRef.current) {
        setTimeout(() => {
          // Calculate bounding box of all shapes
          let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
          convertedShapes.forEach((shape) => {
            minX = Math.min(minX, shape.x);
            minY = Math.min(minY, shape.y);
            maxX = Math.max(maxX, shape.x + shape.width);
            maxY = Math.max(maxY, shape.y + shape.height);
          });

          if (canvasRef.current) {
            const padding = 50;
            const width = maxX - minX + padding * 2;
            const height = maxY - minY + padding * 2;
            const scaleX = canvasRef.current.clientWidth / width;
            const scaleY = canvasRef.current.clientHeight / height;
            const newZoom = Math.min(scaleX, scaleY, 1);
            setZoom(newZoom);
            setPanOffset({
              x: -(minX - padding) * newZoom,
              y: -(minY - padding) * newZoom,
            });
          }
        }, 100);
      }
      return;
    }

    // Otherwise load from localStorage
    try {
      const saved = localStorage.getItem('diagram-data');
      if (saved) {
        const data = JSON.parse(saved);
        setShapes(data.shapes || []);
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Failed to load diagram from localStorage:', error);
    }
  }, [initialDiagram]);

  // Save diagram to localStorage whenever shapes or connections change
  useEffect(() => {
    try {
      const data = { shapes, connections };
      localStorage.setItem('diagram-data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save diagram to localStorage:', error);
    }
  }, [shapes, connections]);

  // Debounced Supabase sync (10 seconds after last change)
  useEffect(() => {
    if (!userId || !currentDiagramId) return;
    if (shapes.length === 0 && connections.length === 0) return;

    const syncToSupabase = async () => {
      setIsSyncing(true);
      try {
        await updateDiagram(currentDiagramId, {
          shapes: shapes.map((s) => ({
            id: s.id,
            type: s.type,
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            label: s.text,
            color: s.color,
            fontSize: s.fontSize,
            imageUrl: s.imageUrl,
          })),
          connections: connections.map((c) => ({
            id: c.id,
            from: c.from,
            to: c.to,
            fromAnchor: '',
            toAnchor: '',
          })),
        });
        setLastSyncTime(new Date());
      } catch (error) {
        console.error('Failed to sync to Supabase:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncToSupabase();
  }, [debouncedShapes, debouncedConnections, userId, currentDiagramId]);

  // Handler for successful authentication
  const handleAuthSuccess = async () => {
    if (shapes.length === 0 && connections.length === 0) return;

    try {
      // Create a new diagram with the current localStorage data
      const diagram = await createDiagram({
        title: 'My Diagram',
        shapes: shapes.map((s) => ({
          id: s.id,
          type: s.type,
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
          label: s.text,
          color: s.color,
          fontSize: s.fontSize,
          imageUrl: s.imageUrl,
        })),
        connections: connections.map((c) => ({
          id: c.id,
          from: c.from,
          to: c.to,
          fromAnchor: '',
          toAnchor: '',
        })),
      });

      if (diagram) {
        setCurrentDiagramId(diagram.id!);
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Failed to save diagram on sign in:', error);
    }
  };

  // Manual sync handler
  const handleManualSync = async () => {
    if (!userId) {
      setShowLoginModal(true);
      return;
    }

    if (shapes.length === 0 && connections.length === 0) return;

    setIsSyncing(true);
    try {
      if (currentDiagramId) {
        // Update existing diagram
        await updateDiagram(currentDiagramId, {
          shapes: shapes.map((s) => ({
            id: s.id,
            type: s.type,
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            label: s.text,
            color: s.color,
            fontSize: s.fontSize,
            imageUrl: s.imageUrl,
          })),
          connections: connections.map((c) => ({
            id: c.id,
            from: c.from,
            to: c.to,
            fromAnchor: '',
            toAnchor: '',
          })),
        });
      } else {
        // Create new diagram
        const diagram = await createDiagram({
          title: 'My Diagram',
          shapes: shapes.map((s) => ({
            id: s.id,
            type: s.type,
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            label: s.text,
            color: s.color,
            fontSize: s.fontSize,
            imageUrl: s.imageUrl,
          })),
          connections: connections.map((c) => ({
            id: c.id,
            from: c.from,
            to: c.to,
            fromAnchor: '',
            toAnchor: '',
          })),
        });
        if (diagram) {
          setCurrentDiagramId(diagram.id!);
        }
      }
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to manually sync diagram:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Confirm new diagram for unsigned users
  const confirmNewDiagram = () => {
    localStorage.removeItem('diagram-data');
    setShowNewDiagramDialog(false);
    navigate({ to: '/diagrams' });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close context menu when clicking on canvas
    setContextMenuId(null);
    // Deselect connection when clicking on canvas
    setSelectedConnectionId(null);

    if (tool === 'select' || tool === 'arrow') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;

    // For image tool, trigger file input
    if (tool === 'image') {
      setPendingImageShape({ x, y });
      fileInputRef.current?.click();
      return;
    }

    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: tool,
      x,
      y,
      width: tool === 'text' ? 200 : tool === 'diamond' ? 100 : 120,
      height:
        tool === 'text'
          ? 40
          : tool === 'database'
            ? 100
            : tool === 'diamond'
              ? 100
              : 80,
      text:
        tool === 'text'
          ? 'Double click to edit'
          : tool === 'diamond'
            ? 'Condition?'
            : 'Component',
      color: SHAPE_COLORS[tool],
      fontSize: 14,
    };

    saveToHistory();
    setShapes([...shapes, newShape]);
    setTool('select');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImageShape) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const newShape: Shape = {
        id: `shape-${Date.now()}`,
        type: 'image',
        x: pendingImageShape.x,
        y: pendingImageShape.y,
        width: 200,
        height: 150,
        text: '',
        color: SHAPE_COLORS.image,
        fontSize: 14,
        imageUrl,
      };
      saveToHistory();
      setShapes([...shapes, newShape]);
      setTool('select');
      setPendingImageShape(null);
    };
    reader.readAsDataURL(file);

    // Reset the file input
    e.target.value = '';
  };

  const handleShapeClick = (e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation();

    // Deselect connection when clicking on a shape
    setSelectedConnectionId(null);

    if (tool === 'arrow') {
      if (!arrowFrom) {
        setArrowFrom(shapeId);
      } else if (arrowFrom !== shapeId) {
        const newConnection: Connection = {
          id: `connection-${Date.now()}`,
          from: arrowFrom,
          to: shapeId,
        };
        saveToHistory();
        setConnections([...connections, newConnection]);
        setArrowFrom(null);
        setTool('select');
      }
    }
  };

  const handleShapeMouseDown = (e: React.MouseEvent, shape: Shape) => {
    e.stopPropagation();
    if (tool === 'arrow') return;
    if (tool !== 'select') return;

    setSelectedId(shape.id);
    saveToHistory();
    setIsDragging(true);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;

    setDragOffset({
      x: x - shape.x,
      y: y - shape.y,
    });
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    shapeId: string,
    handle: string,
  ) => {
    e.stopPropagation();
    setSelectedId(shapeId);
    saveToHistory();
    setIsResizing(true);
    setResizeHandle(handle);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setPanOffset((prev) => ({
          x: prev.x + e.movementX,
          y: prev.y + e.movementY,
        }));
        return;
      }

      if (isResizing && selectedId && resizeHandle) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = (e.clientX - rect.left - panOffset.x) / zoom;
        const mouseY = (e.clientY - rect.top - panOffset.y) / zoom;

        setShapes((shapes) =>
          shapes.map((shape) => {
            if (shape.id !== selectedId) return shape;

            const newShape = { ...shape };

            switch (resizeHandle) {
              case 'se': // bottom-right
                newShape.width = Math.max(50, mouseX - shape.x);
                newShape.height = Math.max(30, mouseY - shape.y);
                break;
              case 'sw': // bottom-left
                newShape.width = Math.max(50, shape.x + shape.width - mouseX);
                newShape.height = Math.max(30, mouseY - shape.y);
                newShape.x = mouseX;
                break;
              case 'ne': // top-right
                newShape.width = Math.max(50, mouseX - shape.x);
                newShape.height = Math.max(30, shape.y + shape.height - mouseY);
                newShape.y = mouseY;
                break;
              case 'nw': // top-left
                newShape.width = Math.max(50, shape.x + shape.width - mouseX);
                newShape.height = Math.max(30, shape.y + shape.height - mouseY);
                newShape.x = mouseX;
                newShape.y = mouseY;
                break;
            }

            return newShape;
          }),
        );
        return;
      }

      if (!isDragging || !selectedId) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - panOffset.x) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top - panOffset.y) / zoom - dragOffset.y;

      setShapes((shapes) =>
        shapes.map((shape) =>
          shape.id === selectedId ? { ...shape, x, y } : shape,
        ),
      );
    },
    [
      isDragging,
      selectedId,
      dragOffset,
      panOffset,
      zoom,
      isPanning,
      isResizing,
      resizeHandle,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleShapeDoubleClick = (e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation();
    saveToHistory();
    setEditingId(shapeId);
  };

  const handleTextChange = (shapeId: string, text: string) => {
    setShapes((shapes) =>
      shapes.map((shape) =>
        shape.id === shapeId ? { ...shape, text } : shape,
      ),
    );
  };

  const handleFontSizeChange = (shapeId: string, fontSize: number) => {
    saveToHistory();
    setShapes((shapes) =>
      shapes.map((shape) =>
        shape.id === shapeId ? { ...shape, fontSize } : shape,
      ),
    );
  };

  const handleColorChange = (shapeId: string, color: string) => {
    saveToHistory();
    setShapes((shapes) =>
      shapes.map((shape) =>
        shape.id === shapeId ? { ...shape, color } : shape,
      ),
    );
  };

  const handleContextMenuClick = (e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation();
    setContextMenuId(contextMenuId === shapeId ? null : shapeId);
  };

  const deleteSelected = () => {
    if (selectedId) {
      saveToHistory();
      setShapes((shapes) => shapes.filter((s) => s.id !== selectedId));
      setConnections((connections) =>
        connections.filter((c) => c.from !== selectedId && c.to !== selectedId),
      );
      setSelectedId(null);
    } else if (selectedConnectionId) {
      saveToHistory();
      setConnections((connections) =>
        connections.filter((c) => c.id !== selectedConnectionId),
      );
      setSelectedConnectionId(null);
    }
  };

  const handleConnectionClick = (e: React.MouseEvent, connectionId: string) => {
    e.stopPropagation();
    if (tool === 'select') {
      setSelectedConnectionId(connectionId);
      setSelectedId(null);
    }
  };

  const exportDiagram = () => {
    const data = { shapes, connections };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getBoundingBox = () => {
    if (shapes.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    shapes.forEach((shape) => {
      minX = Math.min(minX, shape.x);
      minY = Math.min(minY, shape.y);
      maxX = Math.max(maxX, shape.x + shape.width);
      maxY = Math.max(maxY, shape.y + shape.height);
    });

    // Add padding
    const padding = 50;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
    };
  };

  // Helper function to wrap and draw text within bounds
  const drawWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    fontSize: number,
  ) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Calculate starting Y position to center text vertically
    const totalHeight = lines.length * lineHeight;
    let currentY = y - totalHeight / 2 + lineHeight / 2;

    // Draw each line
    lines.forEach((line) => {
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    });
  };

  // Helper function to draw rounded rectangle
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  };

  const exportAsPNG = async () => {
    const bbox = getBoundingBox();
    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;

    // Use 2x scale for higher quality
    const scale = 2;

    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale the context
    ctx.scale(scale, scale);

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Offset for the bounding box
    const offsetX = -bbox.minX;
    const offsetY = -bbox.minY;

    // Draw connections first (behind shapes)
    connections.forEach((connection) => {
      const fromShape = shapes.find((s) => s.id === connection.from);
      const toShape = shapes.find((s) => s.id === connection.to);
      if (!fromShape || !toShape) return;

      const {
        startX,
        startY,
        endX,
        endY,
        controlX1,
        controlY1,
        controlX2,
        controlY2,
        angle,
      } = getArrowPath(fromShape, toShape);

      // Draw the curved line
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX + offsetX, startY + offsetY);
      ctx.bezierCurveTo(
        controlX1 + offsetX,
        controlY1 + offsetY,
        controlX2 + offsetX,
        controlY2 + offsetY,
        endX + offsetX,
        endY + offsetY,
      );
      ctx.stroke();

      // Draw arrowhead
      const arrowSize = 10;
      const arrowAngle = Math.PI / 6;
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.moveTo(endX + offsetX, endY + offsetY);
      ctx.lineTo(
        endX + offsetX - arrowSize * Math.cos(angle - arrowAngle),
        endY + offsetY - arrowSize * Math.sin(angle - arrowAngle),
      );
      ctx.lineTo(
        endX + offsetX - arrowSize * Math.cos(angle + arrowAngle),
        endY + offsetY - arrowSize * Math.sin(angle + arrowAngle),
      );
      ctx.closePath();
      ctx.fill();
    });

    // Draw shapes
    for (const shape of shapes) {
      const x = shape.x + offsetX;
      const y = shape.y + offsetY;
      const fontSize = shape.fontSize || 14;
      const lineHeight = fontSize * 1.2;

      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 2;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Add subtle shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      if (shape.type === 'rectangle') {
        // Fill with semi-transparent white (card background)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        drawRoundedRect(ctx, x, y, shape.width, shape.height, 8);
        ctx.fill();

        // Remove shadow for border
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw border
        ctx.stroke();

        // Draw text with wrapping
        ctx.fillStyle = '#000000';
        drawWrappedText(
          ctx,
          shape.text,
          x + shape.width / 2,
          y + shape.height / 2,
          shape.width - 20,
          lineHeight,
          fontSize,
        );
      } else if (shape.type === 'circle') {
        // Fill with semi-transparent white
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.ellipse(
          x + shape.width / 2,
          y + shape.height / 2,
          shape.width / 2,
          shape.height / 2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Remove shadow for border
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.stroke();

        // Draw text with wrapping
        ctx.fillStyle = '#000000';
        drawWrappedText(
          ctx,
          shape.text,
          x + shape.width / 2,
          y + shape.height / 2,
          shape.width - 20,
          lineHeight,
          fontSize,
        );
      } else if (shape.type === 'diamond') {
        // Fill with semi-transparent white
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.moveTo(x + shape.width / 2, y);
        ctx.lineTo(x + shape.width, y + shape.height / 2);
        ctx.lineTo(x + shape.width / 2, y + shape.height);
        ctx.lineTo(x, y + shape.height / 2);
        ctx.closePath();
        ctx.fill();

        // Remove shadow for border
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.stroke();

        // Draw text with wrapping
        ctx.fillStyle = '#000000';
        drawWrappedText(
          ctx,
          shape.text,
          x + shape.width / 2,
          y + shape.height / 2,
          shape.width * 0.6,
          lineHeight,
          fontSize,
        );
      } else if (shape.type === 'database') {
        // Draw database shape with semi-transparent fill
        const rx = shape.width / 2.2;
        const ry = shape.height / 6.7;

        // Fill the body with semi-transparent white
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

        // Create the body fill path
        ctx.beginPath();
        ctx.ellipse(x + shape.width / 2, y + ry, rx, ry, 0, 0, Math.PI, true);

        ctx.lineTo(x + shape.width / 2 - rx, y + shape.height - ry);
        ctx.ellipse(
          x + shape.width / 2,
          y + shape.height - ry,
          rx,
          ry,
          0,
          Math.PI,
          0,
          true,
        );
        ctx.lineTo(x + shape.width / 2 + rx, y + ry);
        ctx.fill();

        // Remove shadow for strokes
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Top ellipse stroke
        ctx.beginPath();
        ctx.ellipse(x + shape.width / 2, y + ry, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Side lines
        ctx.beginPath();
        ctx.moveTo(x + shape.width / 2 - rx, y + ry);
        ctx.lineTo(x + shape.width / 2 - rx, y + shape.height - ry);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + shape.width / 2 + rx, y + ry);
        ctx.lineTo(x + shape.width / 2 + rx, y + shape.height - ry);
        ctx.stroke();

        // Bottom ellipse stroke
        ctx.beginPath();
        ctx.ellipse(
          x + shape.width / 2,
          y + shape.height - ry,
          rx,
          ry,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();

        // Draw text with wrapping
        ctx.fillStyle = '#000000';
        drawWrappedText(
          ctx,
          shape.text,
          x + shape.width / 2,
          y + shape.height / 2,
          shape.width - 20,
          lineHeight,
          fontSize,
        );
      } else if (shape.type === 'text') {
        // No shadow or background for text elements
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        drawWrappedText(
          ctx,
          shape.text,
          x + 10,
          y + shape.height / 2,
          shape.width - 20,
          lineHeight,
          fontSize,
        );
      } else if (shape.type === 'image' && shape.imageUrl) {
        // Load and draw image with rounded corners
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.save();
            drawRoundedRect(ctx, x, y, shape.width, shape.height, 8);
            ctx.clip();
            ctx.drawImage(img, x, y, shape.width, shape.height);
            ctx.restore();

            // Remove shadow for border
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Draw border
            ctx.strokeStyle = shape.color;
            drawRoundedRect(ctx, x, y, shape.width, shape.height, 8);
            ctx.stroke();
            resolve();
          };
          img.onerror = () => resolve();
          img.src = shape.imageUrl!;
        });
      }

      // Reset shadow for next shape
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Download the canvas as PNG
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const exportAsPDF = async () => {
    const bbox = getBoundingBox();
    const width = bbox.maxX - bbox.minX;
    const height = bbox.maxY - bbox.minY;

    // Determine orientation
    const isLandscape = width > height;

    // Use 2x scale for higher quality
    const scale = 2;

    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale the context
    ctx.scale(scale, scale);

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Offset for the bounding box
    const offsetX = -bbox.minX;
    const offsetY = -bbox.minY;

    // Draw connections
    connections.forEach((connection) => {
      const fromShape = shapes.find((s) => s.id === connection.from);
      const toShape = shapes.find((s) => s.id === connection.to);
      if (!fromShape || !toShape) return;

      const {
        startX,
        startY,
        endX,
        endY,
        controlX1,
        controlY1,
        controlX2,
        controlY2,
        angle,
      } = getArrowPath(fromShape, toShape);

      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX + offsetX, startY + offsetY);
      ctx.bezierCurveTo(
        controlX1 + offsetX,
        controlY1 + offsetY,
        controlX2 + offsetX,
        controlY2 + offsetY,
        endX + offsetX,
        endY + offsetY,
      );
      ctx.stroke();

      // Draw arrowhead
      const arrowSize = 10;
      const arrowAngle = Math.PI / 6;
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.moveTo(endX + offsetX, endY + offsetY);
      ctx.lineTo(
        endX + offsetX - arrowSize * Math.cos(angle - arrowAngle),
        endY + offsetY - arrowSize * Math.sin(angle - arrowAngle),
      );
      ctx.lineTo(
        endX + offsetX - arrowSize * Math.cos(angle + arrowAngle),
        endY + offsetY - arrowSize * Math.sin(angle + arrowAngle),
      );
      ctx.closePath();
      ctx.fill();
    });

    // Draw shapes
    for (const shape of shapes) {
      const x = shape.x + offsetX;
      const y = shape.y + offsetY;
      const fontSize = shape.fontSize || 14;
      const lineHeight = fontSize * 1.2;

      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 2;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Add subtle shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      if (shape.type === 'rectangle') {
        // Fill with semi-transparent white (card background)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        drawRoundedRect(ctx, x, y, shape.width, shape.height, 8);
        ctx.fill();

        // Remove shadow for border
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw border
        ctx.stroke();

        // Draw text with wrapping
        ctx.fillStyle = '#000000';
        drawWrappedText(
          ctx,
          shape.text,
          x + shape.width / 2,
          y + shape.height / 2,
          shape.width - 20,
          lineHeight,
          fontSize,
        );
      } else if (shape.type === 'circle') {
        // Fill with semi-transparent white
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.ellipse(
          x + shape.width / 2,
          y + shape.height / 2,
          shape.width / 2,
          shape.height / 2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Remove shadow for border
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.stroke();

        // Draw text with wrapping
        ctx.fillStyle = '#000000';
        drawWrappedText(
          ctx,
          shape.text,
          x + shape.width / 2,
          y + shape.height / 2,
          shape.width - 20,
          lineHeight,
          fontSize,
        );
      } else if (shape.type === 'diamond') {
        // Fill with semi-transparent white
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.moveTo(x + shape.width / 2, y);
        ctx.lineTo(x + shape.width, y + shape.height / 2);
        ctx.lineTo(x + shape.width / 2, y + shape.height);
        ctx.lineTo(x, y + shape.height / 2);
        ctx.closePath();
        ctx.fill();

        // Remove shadow for border
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.stroke();

        // Draw text with wrapping
        ctx.fillStyle = '#000000';
        drawWrappedText(
          ctx,
          shape.text,
          x + shape.width / 2,
          y + shape.height / 2,
          shape.width * 0.6,
          lineHeight,
          fontSize,
        );
      } else if (shape.type === 'database') {
        // Draw database shape with semi-transparent fill
        const rx = shape.width / 2.2;
        const ry = shape.height / 6.7;

        // Fill the body with semi-transparent white
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

        // Create the body fill path
        ctx.beginPath();
        ctx.ellipse(x + shape.width / 2, y + ry, rx, ry, 0, 0, Math.PI, true);

        ctx.lineTo(x + shape.width / 2 - rx, y + shape.height - ry);
        ctx.ellipse(
          x + shape.width / 2,
          y + shape.height - ry,
          rx,
          ry,
          0,
          Math.PI,
          0,
          true,
        );
        ctx.lineTo(x + shape.width / 2 + rx, y + ry);
        ctx.fill();

        // Remove shadow for strokes
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Top ellipse stroke
        ctx.beginPath();
        ctx.ellipse(x + shape.width / 2, y + ry, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Side lines
        ctx.beginPath();
        ctx.moveTo(x + shape.width / 2 - rx, y + ry);
        ctx.lineTo(x + shape.width / 2 - rx, y + shape.height - ry);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + shape.width / 2 + rx, y + ry);
        ctx.lineTo(x + shape.width / 2 + rx, y + shape.height - ry);
        ctx.stroke();

        // Bottom ellipse stroke
        ctx.beginPath();
        ctx.ellipse(
          x + shape.width / 2,
          y + shape.height - ry,
          rx,
          ry,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();

        // Draw text with wrapping
        ctx.fillStyle = '#000000';
        drawWrappedText(
          ctx,
          shape.text,
          x + shape.width / 2,
          y + shape.height / 2,
          shape.width - 20,
          lineHeight,
          fontSize,
        );
      } else if (shape.type === 'text') {
        // No shadow or background for text elements
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        drawWrappedText(
          ctx,
          shape.text,
          x + 10,
          y + shape.height / 2,
          shape.width - 20,
          lineHeight,
          fontSize,
        );
      } else if (shape.type === 'image' && shape.imageUrl) {
        // Load and draw image with rounded corners
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.save();
            drawRoundedRect(ctx, x, y, shape.width, shape.height, 8);
            ctx.clip();
            ctx.drawImage(img, x, y, shape.width, shape.height);
            ctx.restore();

            // Remove shadow for border
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Draw border
            ctx.strokeStyle = shape.color;
            drawRoundedRect(ctx, x, y, shape.width, shape.height, 8);
            ctx.stroke();
            resolve();
          };
          img.onerror = () => resolve();
          img.src = shape.imageUrl!;
        });
      }

      // Reset shadow for next shape
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Convert canvas to PDF using jsPDF
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Dynamically import jsPDF
      const { default: jsPDF } = await import('jspdf');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('diagram.pdf');
    });
  };

  const handleExport = async (format: 'json' | 'png' | 'pdf') => {
    setShowExportDropdown(false);
    if (format === 'json') {
      exportDiagram();
    } else if (format === 'png') {
      await exportAsPNG();
    } else if (format === 'pdf') {
      await exportAsPDF();
    }
  };

  const importDiagram = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        saveToHistory();
        setShapes(data.shapes || []);
        setConnections(data.connections || []);
      } catch (error) {
        console.error('Failed to import diagram:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Start panning on middle mouse button or left click (when not on a shape)
    if (e.button === 1 || e.button === 0) {
      setIsPanning(true);
      e.preventDefault();
    }
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    // Check if CMD (Meta) key is pressed on Mac
    if (e.metaKey) {
      e.preventDefault();

      // Determine zoom direction: negative deltaY means scroll up (zoom in)
      const zoomDelta = e.deltaY > 0 ? -0.02 : 0.02;

      setZoom((prevZoom) => {
        const newZoom = Math.min(2, Math.max(0.25, prevZoom + zoomDelta));
        return newZoom;
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const getShapeCenter = (shape: Shape) => {
    return {
      x: shape.x + shape.width / 2,
      y: shape.y + shape.height / 2,
    };
  };

  const getAnchorPoints = (shape: Shape) => {
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;

    return {
      top: { x: centerX, y: shape.y, side: 'top' as const },
      bottom: {
        x: centerX,
        y: shape.y + shape.height,
        side: 'bottom' as const,
      },
      left: { x: shape.x, y: centerY, side: 'left' as const },
      right: { x: shape.x + shape.width, y: centerY, side: 'right' as const },
    };
  };

  const getClosestAnchorPoint = (
    shape: Shape,
    targetPoint: { x: number; y: number },
  ) => {
    const anchors = getAnchorPoints(shape);
    const anchorArray = Object.values(anchors);

    // Find the closest anchor point
    let closestAnchor = anchorArray[0];
    let minDistance = Infinity;

    for (const anchor of anchorArray) {
      const dx = anchor.x - targetPoint.x;
      const dy = anchor.y - targetPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        closestAnchor = anchor;
      }
    }

    return closestAnchor;
  };

  const getConnectionPoint = (
    shape: Shape,
    targetCenter: { x: number; y: number },
  ) => {
    // Get the closest anchor point to the target
    return getClosestAnchorPoint(shape, targetCenter);
  };

  const getArrowPath = (fromShape: Shape, toShape: Shape) => {
    const fromCenter = getShapeCenter(fromShape);
    const toCenter = getShapeCenter(toShape);

    // Get proper connection points on edges with side information
    const startPoint = getConnectionPoint(fromShape, toCenter);
    const endPoint = getConnectionPoint(toShape, fromCenter);

    const startX = startPoint.x;
    const startY = startPoint.y;
    const endX = endPoint.x;
    const endY = endPoint.y;

    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let controlX1, controlY1, controlX2, controlY2;

    // Set control points based on which sides we're connecting
    const controlOffset = Math.min(distance * 0.4, 100);

    // Control point 1 - extends perpendicular to the starting side
    if (startPoint.side === 'right') {
      controlX1 = startX + controlOffset;
      controlY1 = startY;
    } else if (startPoint.side === 'left') {
      controlX1 = startX - controlOffset;
      controlY1 = startY;
    } else if (startPoint.side === 'bottom') {
      controlX1 = startX;
      controlY1 = startY + controlOffset;
    } else {
      // top
      controlX1 = startX;
      controlY1 = startY - controlOffset;
    }

    // Control point 2 - extends perpendicular to the ending side
    if (endPoint.side === 'right') {
      controlX2 = endX + controlOffset;
      controlY2 = endY;
    } else if (endPoint.side === 'left') {
      controlX2 = endX - controlOffset;
      controlY2 = endY;
    } else if (endPoint.side === 'bottom') {
      controlX2 = endX;
      controlY2 = endY + controlOffset;
    } else {
      // top
      controlX2 = endX;
      controlY2 = endY - controlOffset;
    }

    // Arrow angle should point INTO the element (opposite of the side direction)
    let angle: number;
    if (endPoint.side === 'right') {
      angle = Math.PI; // pointing left (into the right side)
    } else if (endPoint.side === 'left') {
      angle = 0; // pointing right (into the left side)
    } else if (endPoint.side === 'bottom') {
      angle = -Math.PI / 2; // pointing up (into the bottom side)
    } else {
      // top
      angle = Math.PI / 2; // pointing down (into the top side)
    }

    return {
      startX,
      startY,
      endX,
      endY,
      controlX1,
      controlY1,
      controlX2,
      controlY2,
      angle,
    };
  };

  // Initialize keyboard shortcuts
  useCanvasHotkeys({
    tool,
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
    save: handleManualSync,
    exportPNG: exportAsPNG,
    exportPDF: exportAsPDF,
    exportJSON: exportDiagram,
    openCommandPalette: () => setShowCommandPalette(true),
    openShortcutsDialog: () => setShowShortcutsDialog(true),
    isEditing: editingId !== null,
    canUndo: history.length > 0,
  });

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Toolbar */}
      <div className="h-16 flex items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <UnpicImage
              src="/logo.png"
              alt="EasyDraw Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <h1 className="text-lg font-bold text-black dark:text-white">
              Turbodoc
            </h1>
          </div>

          {/* Navigation buttons - only visible when signed in */}
          {userId && (
            <div className="flex items-center gap-1 border-l border-border pl-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: '/diagrams' })}
                    className="h-8 gap-1.5"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-sm">My Diagrams</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View all diagrams</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-2">
            {/* Shape Tools */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === 'select' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTool('select')}
                    className="h-8 w-8 p-0"
                  >
                    <MousePointer2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Select Tool{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      V
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
              <div className="mx-1 h-4 w-px bg-border" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === 'rectangle' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTool('rectangle')}
                    className="h-8 w-8 p-0"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Rectangle{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      R
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === 'circle' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTool('circle')}
                    className="h-8 w-8 p-0"
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Circle{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      C
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === 'database' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTool('database')}
                    className="h-8 w-8 p-0"
                  >
                    <Database className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Database{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      D
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === 'text' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTool('text')}
                    className="h-8 w-8 p-0"
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Text{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      T
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === 'diamond' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTool('diamond')}
                    className="h-8 w-8 p-0"
                  >
                    <Diamond className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Diamond{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      M
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === 'image' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTool('image')}
                    className="h-8 w-8 p-0"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Image{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      I
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
              <div className="mx-1 h-4 w-px bg-border" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === 'arrow' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setTool('arrow');
                      setArrowFrom(null);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Arrow/Connector{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      A
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Zoom Out{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      ⌘-
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="min-w-12 text-center text-xs font-mono text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Zoom In{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      ⌘+
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deleteSelected}
                    disabled={!selectedId && !selectedConnectionId}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Delete{' '}
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                      Del
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Export Dropdown */}
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="h-8 gap-1 px-2"
                    >
                      <Download className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Export{' '}
                      <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                        ⌘E
                      </kbd>
                    </p>
                  </TooltipContent>
                </Tooltip>

                {showExportDropdown && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowExportDropdown(false)}
                    />

                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-card shadow-lg">
                      <button
                        onClick={() => handleExport('png')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                      >
                        <FileImage className="h-4 w-4" />
                        PNG
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                      >
                        <FileText className="h-4 w-4" />
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                      >
                        <Braces className="h-4 w-4" />
                        JSON
                      </button>
                    </div>
                  </>
                )}
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="cursor-pointer">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4" />
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importDiagram}
                      className="hidden"
                    />
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import JSON</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Sync Indicator */}
            {userId && (
              <div className="flex items-center gap-1 px-2">
                {isSyncing ? (
                  <>
                    <Cloud className="h-4 w-4 animate-pulse text-blue-500" />
                    <span className="text-xs text-muted-foreground w-12 text-left">
                      Syncing...
                    </span>
                  </>
                ) : lastSyncTime ? (
                  <>
                    <Cloud className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground w-12 text-left">
                      Saved
                    </span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground w-12 text-left">
                      Not synced
                    </span>
                  </>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleManualSync}
                      disabled={
                        isSyncing ||
                        (shapes.length === 0 && connections.length === 0)
                      }
                      className="h-6 w-6 p-0 ml-1"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Save now{' '}
                      <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground border border-border rounded font-mono">
                        ⌘S
                      </kbd>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </TooltipProvider>
      </div>

      {/* Auth Dialog */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={handleAuthSuccess}
      />

      {/* Command Palette */}
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onCommand={handleCommandAction}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showShortcutsDialog}
        onOpenChange={setShowShortcutsDialog}
      />

      {/* New Diagram Confirmation Dialog */}
      <Dialog
        open={showNewDiagramDialog}
        onOpenChange={setShowNewDiagramDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Diagram?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Creating a new diagram will clear the
              current canvas. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewDiagramDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmNewDiagram}>Create New Diagram</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Font Size Control */}
      {selectedId && (
        <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
          <span className="text-xs text-muted-foreground">Font Size:</span>
          <input
            type="range"
            min="8"
            max="32"
            value={shapes.find((s) => s.id === selectedId)?.fontSize || 14}
            onChange={(e) =>
              handleFontSizeChange(selectedId, parseInt(e.target.value))
            }
            className="w-32"
          />
          <span className="min-w-8 text-xs font-mono text-muted-foreground">
            {shapes.find((s) => s.id === selectedId)?.fontSize || 14}px
          </span>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative flex-1 overflow-hidden bg-canvas"
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        style={{
          cursor: isPanning
            ? 'grabbing'
            : tool === 'select'
              ? 'default'
              : 'crosshair',
          backgroundImage: `
            linear-gradient(var(--color-canvas-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-canvas-grid) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        }}
      >
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Render Connections/Arrows */}
          <svg
            className="absolute left-0 top-0"
            style={{
              width: '5000px',
              height: '5000px',
              overflow: 'visible',
              pointerEvents: 'none',
            }}
          >
            {connections.map((connection) => {
              const fromShape = shapes.find((s) => s.id === connection.from);
              const toShape = shapes.find((s) => s.id === connection.to);

              if (!fromShape || !toShape) {
                return null;
              }

              const {
                startX,
                startY,
                endX,
                endY,
                controlX1,
                controlY1,
                controlX2,
                controlY2,
                angle,
              } = getArrowPath(fromShape, toShape);

              // Calculate arrowhead points
              const arrowSize = 10;
              const arrowAngle = Math.PI / 6; // 30 degrees

              return (
                <g key={connection.id}>
                  {/* Invisible wider path for easier clicking */}
                  <path
                    d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                    stroke="transparent"
                    strokeWidth="20"
                    fill="none"
                    style={{
                      cursor: tool === 'select' ? 'pointer' : 'default',
                      pointerEvents: tool === 'select' ? 'stroke' : 'none',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectionClick(e as any, connection.id);
                    }}
                  />
                  {/* The visible curved line */}
                  <path
                    d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                    stroke={
                      selectedConnectionId === connection.id
                        ? '#3b82f6'
                        : '#71717a'
                    }
                    strokeWidth={
                      selectedConnectionId === connection.id ? '3' : '2'
                    }
                    fill="none"
                    style={{ pointerEvents: 'none' }}
                  />
                  {/* Custom arrowhead that follows the curve angle */}
                  <polygon
                    points={`
                      ${endX},${endY}
                      ${endX - arrowSize * Math.cos(angle - arrowAngle)},${endY - arrowSize * Math.sin(angle - arrowAngle)}
                      ${endX - arrowSize * Math.cos(angle + arrowAngle)},${endY - arrowSize * Math.sin(angle + arrowAngle)}
                    `}
                    fill={
                      selectedConnectionId === connection.id
                        ? '#3b82f6'
                        : '#71717a'
                    }
                    style={{ pointerEvents: 'none' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Render Shapes */}
          {shapes.map((shape) => (
            <div
              key={shape.id}
              className={cn(
                'absolute cursor-move select-none',
                selectedId === shape.id &&
                  'ring-2 ring-accent ring-offset-2 ring-offset-canvas',
                arrowFrom === shape.id &&
                  'ring-2 ring-primary ring-offset-2 ring-offset-canvas',
              )}
              style={{
                left: shape.x,
                top: shape.y,
                width: shape.width,
                height: shape.height,
              }}
              onClick={(e) => handleShapeClick(e, shape.id)}
              onMouseDown={(e) => handleShapeMouseDown(e, shape)}
              onDoubleClick={(e) => handleShapeDoubleClick(e, shape.id)}
            >
              {shape.type === 'rectangle' && (
                <div
                  className="flex h-full w-full items-center justify-center rounded-lg border-2 bg-card/90 backdrop-blur-sm"
                  style={{ borderColor: shape.color }}
                >
                  {editingId === shape.id ? (
                    <input
                      type="text"
                      value={shape.text}
                      onChange={(e) =>
                        handleTextChange(shape.id, e.target.value)
                      }
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      className="w-full bg-transparent px-2 text-center font-medium text-foreground outline-none"
                      style={{ fontSize: `${shape.fontSize || 14}px` }}
                    />
                  ) : (
                    <span
                      className="px-2 text-center font-medium text-foreground"
                      style={{ fontSize: `${shape.fontSize || 14}px` }}
                    >
                      {shape.text}
                    </span>
                  )}
                </div>
              )}

              {/* Anchor Points */}
              {selectedId === shape.id && tool === 'select' && (
                <>
                  {Object.values(getAnchorPoints(shape)).map(
                    (anchor, index) => (
                      <div
                        key={index}
                        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-background"
                        style={{
                          left: anchor.x - shape.x,
                          top: anchor.y - shape.y,
                        }}
                      />
                    ),
                  )}
                </>
              )}

              {/* Context Menu Button */}
              {(selectedId === shape.id || contextMenuId === shape.id) &&
                tool === 'select' && (
                  <div
                    className="absolute -right-8 top-0"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-6 w-6 p-0 shadow-md"
                      onClick={(e) => handleContextMenuClick(e, shape.id)}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                    {contextMenuId === shape.id && (
                      <div
                        className="absolute right-0 top-8 z-50 min-w-[180px] rounded-lg border border-border bg-card p-3 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div className="mb-2 text-xs font-semibold text-muted-foreground">
                          Element Color
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {COLOR_PALETTE.map((color) => (
                            <button
                              key={color}
                              className={cn(
                                'h-7 w-7 rounded-md border-2 transition-all hover:scale-110',
                                shape.color === color
                                  ? 'border-foreground ring-2 ring-accent'
                                  : 'border-transparent',
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                handleColorChange(shape.id, color);
                                setContextMenuId(null);
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Resize Handles */}
              {selectedId === shape.id && tool === 'select' && (
                <>
                  <div
                    className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-full bg-accent ring-2 ring-background"
                    onMouseDown={(e) =>
                      handleResizeMouseDown(e, shape.id, 'se')
                    }
                  />
                  <div
                    className="absolute -bottom-1 -left-1 h-3 w-3 cursor-sw-resize rounded-full bg-accent ring-2 ring-background"
                    onMouseDown={(e) =>
                      handleResizeMouseDown(e, shape.id, 'sw')
                    }
                  />
                  <div
                    className="absolute -right-1 -top-1 h-3 w-3 cursor-ne-resize rounded-full bg-accent ring-2 ring-background"
                    onMouseDown={(e) =>
                      handleResizeMouseDown(e, shape.id, 'ne')
                    }
                  />
                  <div
                    className="absolute -left-1 -top-1 h-3 w-3 cursor-nw-resize rounded-full bg-accent ring-2 ring-background"
                    onMouseDown={(e) =>
                      handleResizeMouseDown(e, shape.id, 'nw')
                    }
                  />
                </>
              )}

              {shape.type === 'circle' && (
                <div
                  className="flex h-full w-full items-center justify-center rounded-full border-2 bg-card/90 backdrop-blur-sm"
                  style={{ borderColor: shape.color }}
                >
                  {editingId === shape.id ? (
                    <input
                      type="text"
                      value={shape.text}
                      onChange={(e) =>
                        handleTextChange(shape.id, e.target.value)
                      }
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      className="w-full bg-transparent px-2 text-center font-medium text-foreground outline-none"
                      style={{ fontSize: `${shape.fontSize || 14}px` }}
                    />
                  ) : (
                    <span
                      className="px-2 text-center font-medium text-foreground"
                      style={{ fontSize: `${shape.fontSize || 14}px` }}
                    >
                      {shape.text}
                    </span>
                  )}
                </div>
              )}

              {shape.type === 'database' && (
                <div className="relative h-full w-full">
                  <svg
                    viewBox="0 0 120 100"
                    className="h-full w-full"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  >
                    <ellipse
                      cx="60"
                      cy="15"
                      rx="55"
                      ry="15"
                      fill="none"
                      stroke={shape.color}
                      strokeWidth="2"
                    />
                    <path
                      d="M 5 15 L 5 75 Q 5 90 60 90 Q 115 90 115 75 L 115 15"
                      fill="none"
                      stroke={shape.color}
                      strokeWidth="2"
                    />
                    <ellipse
                      cx="60"
                      cy="75"
                      rx="55"
                      ry="15"
                      fill="none"
                      stroke={shape.color}
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {editingId === shape.id ? (
                      <input
                        type="text"
                        value={shape.text}
                        onChange={(e) =>
                          handleTextChange(shape.id, e.target.value)
                        }
                        onBlur={() => setEditingId(null)}
                        autoFocus
                        className="w-full bg-transparent px-2 text-center font-medium text-foreground outline-none"
                        style={{ fontSize: `${shape.fontSize || 14}px` }}
                      />
                    ) : (
                      <span
                        className="px-2 text-center font-medium text-foreground"
                        style={{ fontSize: `${shape.fontSize || 14}px` }}
                      >
                        {shape.text}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {shape.type === 'text' && (
                <div className="flex h-full w-full items-center justify-center">
                  {editingId === shape.id ? (
                    <input
                      type="text"
                      value={shape.text}
                      onChange={(e) =>
                        handleTextChange(shape.id, e.target.value)
                      }
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      className="w-full bg-transparent px-2 font-medium text-foreground outline-none"
                      style={{ fontSize: `${shape.fontSize || 14}px` }}
                    />
                  ) : (
                    <span
                      className="px-2 font-medium text-foreground"
                      style={{ fontSize: `${shape.fontSize || 14}px` }}
                    >
                      {shape.text}
                    </span>
                  )}
                </div>
              )}

              {shape.type === 'diamond' && (
                <div className="relative h-full w-full">
                  <svg
                    viewBox="0 0 100 100"
                    className="h-full w-full"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  >
                    <path
                      d="M 50 5 L 95 50 L 50 95 L 5 50 Z"
                      fill="none"
                      stroke={shape.color}
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {editingId === shape.id ? (
                      <input
                        type="text"
                        value={shape.text}
                        onChange={(e) =>
                          handleTextChange(shape.id, e.target.value)
                        }
                        onBlur={() => setEditingId(null)}
                        autoFocus
                        className="w-full bg-transparent px-2 text-center font-medium text-foreground outline-none"
                        style={{ fontSize: `${shape.fontSize || 14}px` }}
                      />
                    ) : (
                      <span
                        className="px-2 text-center font-medium text-foreground"
                        style={{ fontSize: `${shape.fontSize || 14}px` }}
                      >
                        {shape.text}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {shape.type === 'image' && (
                <div
                  className="relative h-full w-full overflow-hidden rounded-lg border-2"
                  style={{ borderColor: shape.color }}
                >
                  {shape.imageUrl ? (
                    <img
                      src={shape.imageUrl}
                      alt="Uploaded"
                      draggable="false"
                      className="h-full w-full object-contain"
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/20">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-border bg-card px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{shapes.length} shapes</span>
          <span>{connections.length} connections</span>
          {tool === 'arrow' && arrowFrom && (
            <span className="text-primary">
              Click target element to connect
            </span>
          )}
          {tool === 'arrow' && !arrowFrom && (
            <span className="text-primary">Click source element to start</span>
          )}
          {tool !== 'arrow' && (
            <span>Drag canvas to pan • CMD+Scroll to zoom</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Double-click to edit text</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
