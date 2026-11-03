import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  useDiagrams,
  useDeleteDiagram,
  useDuplicateDiagram,
  useUpdateDiagram,
} from "@/lib/hooks/use-diagrams";
import { Button } from "@/components/ui/button";
import { MermaidDiagram } from "@/components/markdown/mermaid-diagram";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Copy, ExternalLink, Loader2, Pencil, Plus, Shapes, Trash2, Workflow } from "lucide-react";
import { toast } from "sonner";
import type { Diagram } from "@/lib/types";
import {
  CardActionButton,
  ContentCard,
  ContentCardSkeleton,
  ContentGrid,
  DESTRUCTIVE_MENU_ITEM,
} from "@/components/shared/content-card";
import {
  GridEmptyState,
  GridPageHeader,
  GridToolbar,
  NewItemButton,
  NoResults,
  useGridShortcuts,
  usePersistentOption,
} from "@/components/shared/grid-page";
import { MobileFab } from "@/components/shared/module-nav";
import { formatRelativeDate, pluralize, toDate } from "@/lib/format";

type DiagramSort = "updated" | "created" | "title";

const DIAGRAM_SORTS: { value: DiagramSort; label: string }[] = [
  { value: "updated", label: "Last edited" },
  { value: "created", label: "Created" },
  { value: "title", label: "A–Z" },
];

function timeOf(value: string | null | undefined) {
  return toDate(value)?.getTime() ?? 0;
}

interface DiagramGridProps {
  onCreate: () => void;
  isCreating?: boolean;
}

export function DiagramGrid({ onCreate, isCreating }: DiagramGridProps) {
  const { data: diagrams = [], isLoading } = useDiagrams();
  const deleteDiagramMutation = useDeleteDiagram();
  const duplicateDiagramMutation = useDuplicateDiagram();
  const updateDiagramMutation = useUpdateDiagram();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diagramToDelete, setDiagramToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = usePersistentOption<DiagramSort>(
    "turbodoc:diagrams:sort",
    "updated",
    DIAGRAM_SORTS.map((o) => o.value),
  );

  useGridShortcuts({ searchRef: searchInputRef, onNew: isCreating ? undefined : onCreate });

  const handleDuplicateDiagram = (id: string) => {
    duplicateDiagramMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Diagram duplicated");
      },
      onError: () => {
        toast.error("Failed to duplicate diagram");
      },
    });
  };

  const handleDeleteDiagram = (id: string) => {
    setDiagramToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleStartRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleSaveRename = (id: string) => {
    const diagram = diagrams.find((d) => d.id === id);
    const title = editingTitle.trim();
    if (!title || title === diagram?.title) {
      handleCancelRename();
      return;
    }

    updateDiagramMutation.mutate(
      { id, updates: { title } },
      {
        onSuccess: () => {
          toast.success("Diagram renamed");
        },
        onError: () => {
          toast.error("Failed to rename diagram");
        },
      },
    );
    setEditingId(null);
    setEditingTitle("");
  };

  const confirmDelete = () => {
    if (!diagramToDelete) return;

    const id = diagramToDelete;
    const diagram = diagrams.find((d) => d.id === id);

    setRemovingIds((prev) => new Set(prev).add(id));
    setDeleteDialogOpen(false);

    toast.success("Diagram deleted", {
      description: diagram ? `"${diagram.title}" has been removed.` : "The diagram has been removed.",
    });

    deleteDiagramMutation.mutate(id, {
      onSettled: () => {
        setDiagramToDelete(null);
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  };

  const visibleDiagrams = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = diagrams.filter(
      (d) => !removingIds.has(d.id) && (!term || d.title.toLowerCase().includes(term)),
    );
    return filtered.sort((a, b) => {
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      if (sort === "created") return timeOf(b.created_at) - timeOf(a.created_at);
      return timeOf(b.updated_at) - timeOf(a.updated_at);
    });
  }, [diagrams, removingIds, searchTerm, sort]);

  const lastEdited = useMemo(() => {
    const latest = Math.max(0, ...diagrams.map((d) => timeOf(d.updated_at)));
    return latest ? formatRelativeDate(latest) : null;
  }, [diagrams]);

  const subtitle = isLoading
    ? "Loading…"
    : [pluralize(diagrams.length, "diagram"), lastEdited && `last edited ${lastEdited}`]
        .filter(Boolean)
        .join(" · ");

  return (
    <>
      <GridPageHeader
        title="Diagrams"
        subtitle={subtitle}
        action={<NewItemButton label="New diagram" onClick={onCreate} pending={isCreating} />}
      />

      <GridToolbar
        searchRef={searchInputRef}
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search diagrams"
        sort={sort}
        sortOptions={DIAGRAM_SORTS}
        onSortChange={setSort}
      />

      {isLoading ? (
        <ContentGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </ContentGrid>
      ) : diagrams.length === 0 ? (
        <GridEmptyState
          icon={Shapes}
          title="No diagrams yet"
          description="Map out your first flowchart, architecture, or idea with powerful drawing tools."
          action={
            <Button onClick={onCreate} disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create your first diagram
            </Button>
          }
        />
      ) : visibleDiagrams.length === 0 && searchTerm.trim() ? (
        <NoResults onReset={() => setSearchTerm("")} />
      ) : (
        <ContentGrid>
          {visibleDiagrams.map((diagram) => (
            <DiagramCard
              key={diagram.id}
              diagram={diagram}
              isEditing={editingId === diagram.id}
              editingTitle={editingTitle}
              onEditingTitleChange={setEditingTitle}
              onStartRename={() => handleStartRename(diagram.id, diagram.title)}
              onSaveRename={() => handleSaveRename(diagram.id)}
              onCancelRename={handleCancelRename}
              onDuplicate={() => handleDuplicateDiagram(diagram.id)}
              isDuplicating={
                duplicateDiagramMutation.isPending && duplicateDiagramMutation.variables === diagram.id
              }
              onDelete={() => handleDeleteDiagram(diagram.id)}
            />
          ))}
        </ContentGrid>
      )}

      <MobileFab label="New diagram" onClick={onCreate} disabled={isCreating} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="animate-in zoom-in-95 fade-in duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diagram</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this diagram? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface DiagramCardProps {
  diagram: Diagram;
  isEditing: boolean;
  editingTitle: string;
  onEditingTitleChange: (title: string) => void;
  onStartRename: () => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onDuplicate: () => void;
  isDuplicating: boolean;
  onDelete: () => void;
}

export function DiagramCard({
  diagram,
  isEditing,
  editingTitle,
  onEditingTitleChange,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onDuplicate,
  isDuplicating,
  onDelete,
}: DiagramCardProps) {
  const navigate = useNavigate();
  const openDiagram = () =>
    navigate({ to: "/diagram/$diagramId", params: { diagramId: diagram.id } });

  const isMermaid = diagram.diagram_type === "mermaid";
  // The list endpoint may omit shapes, so only show a count when we have one.
  const nodeCount = Array.isArray(diagram.shapes) ? diagram.shapes.length : 0;
  const edited = formatRelativeDate(diagram.updated_at);
  const details = [
    isMermaid ? "Mermaid" : "Canvas",
    !isMermaid && nodeCount > 0 && pluralize(nodeCount, "node"),
    edited && `Edited ${edited}`,
  ]
    .filter(Boolean)
    .join(" · ");

  let preview: ReactNode;
  if (isMermaid && diagram.mermaid_source) {
    preview = (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-[6%]">
        <MermaidDiagram
          chart={diagram.mermaid_source}
          className="m-0 flex size-full items-center justify-center overflow-hidden border-0 bg-transparent p-0 [&_svg]:max-h-full [&_svg]:max-w-full"
        />
      </div>
    );
  } else if (diagram.thumbnail) {
    preview = (
      <img
        src={diagram.thumbnail}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
      />
    );
  } else {
    preview = (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-faint">
        <Workflow className="size-6" strokeWidth={1.6} />
        <span>Empty canvas</span>
      </div>
    );
  }

  return (
    <ContentCard
      kind="diagram"
      title={diagram.title || "Untitled diagram"}
      details={details}
      href={`/diagram/${diagram.id}`}
      onOpen={openDiagram}
      previewClassName="bg-canvas bg-[radial-gradient(var(--canvas-dot)_1px,transparent_1px)] bg-[length:14px_14px]"
      preview={preview}
      titleEditor={
        isEditing ? (
          <RenameInput
            value={editingTitle}
            onChange={onEditingTitleChange}
            onSave={onSaveRename}
            onCancel={onCancelRename}
          />
        ) : undefined
      }
      quickActions={
        <CardActionButton label="Duplicate" onClick={onDuplicate} disabled={isDuplicating}>
          {isDuplicating ? <Loader2 className="animate-spin" /> : <Copy />}
        </CardActionButton>
      }
      menuItems={
        <>
          <DropdownMenuItem onSelect={openDiagram}>
            <ExternalLink />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onStartRename}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDuplicate} disabled={isDuplicating}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className={DESTRUCTIVE_MENU_ITEM} onSelect={onDelete}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </>
      }
    />
  );
}

interface RenameInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function RenameInput({ value, onChange, onSave, onCancel }: RenameInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelled = useRef(false);

  // Focus after the "more" menu has finished closing, which would otherwise take focus back.
  useEffect(() => {
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          inputRef.current?.blur();
        } else if (e.key === "Escape") {
          cancelled.current = true;
          onCancel();
        }
      }}
      onBlur={() => {
        if (!cancelled.current) onSave();
      }}
      aria-label="Diagram title"
      className="relative z-10 -my-0.5 h-6 w-full rounded-md border border-primary bg-background px-1.5 text-sm font-semibold text-foreground outline-none ring-[3px] ring-focus-ring"
    />
  );
}
