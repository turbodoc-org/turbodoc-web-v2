import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  useDiagrams,
  useDeleteDiagram,
  useDuplicateDiagram,
  useUpdateDiagram,
} from "@/lib/hooks/use-diagrams";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Trash2, Copy, Pencil, Check, X, Loader2, Shapes, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function DiagramCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </CardHeader>
      <CardContent className="pb-3">
        <Skeleton className="aspect-video w-full rounded-md" />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </CardFooter>
    </Card>
  );
}

interface DiagramGridProps {
  onEdit?: (diagramId: string) => void;
}

export function DiagramGrid({}: DiagramGridProps) {
  const { data: diagrams = [], isLoading } = useDiagrams();
  const deleteDiagramMutation = useDeleteDiagram();
  const duplicateDiagramMutation = useDuplicateDiagram();
  const updateDiagramMutation = useUpdateDiagram();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diagramToDelete, setDiagramToDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const handleDuplicateDiagram = async (id: string) => {
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

  const handleSaveRename = async (id: string) => {
    if (!editingTitle.trim()) {
      handleCancelRename();
      return;
    }

    updateDiagramMutation.mutate(
      {
        id,
        updates: { title: editingTitle.trim() },
      },
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

    const diagram = diagrams.find((d) => d.id === diagramToDelete);

    setDeletingId(diagramToDelete);
    setRemovingIds((prev) => new Set(prev).add(diagramToDelete));
    setDeleteDialogOpen(false);

    toast.success("Diagram deleted", {
      description: diagram
        ? `"${diagram.title}" has been removed.`
        : "The diagram has been removed.",
    });

    deleteDiagramMutation.mutate(diagramToDelete, {
      onSettled: () => {
        setDeletingId(null);
        setDiagramToDelete(null);
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(diagramToDelete);
          return next;
        });
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const visibleDiagrams = diagrams.filter((d) => !removingIds.has(d.id));

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DiagramCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (visibleDiagrams.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Shapes className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No diagrams yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Map out your first flowchart, architecture, or idea with powerful drawing tools.
          </p>
          <Button
            onClick={() => {
              // The parent route handles new diagram creation
              const event = new CustomEvent("createNewDiagram");
              window.dispatchEvent(event);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Diagram
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <TooltipProvider>
          {visibleDiagrams.map((diagram, index) => (
            <Card
              key={diagram.id}
              className="overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-forwards"
              style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
            >
              <CardHeader className="pb-3">
                {editingId === diagram.id ? (
                  <div className="flex items-center gap-2 animate-in zoom-in-95 duration-150">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveRename(diagram.id);
                        } else if (e.key === "Escape") {
                          handleCancelRename();
                        }
                      }}
                      className="flex-1 text-sm"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleSaveRename(diagram.id)}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={handleCancelRename}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base truncate">{diagram.title}</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleStartRename(diagram.id, diagram.title)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rename diagram</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
                <CardDescription className="text-xs">
                  Updated {formatDate(diagram.updated_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                {diagram.thumbnail ? (
                  <div className="aspect-video overflow-hidden rounded-md bg-muted">
                    <img
                      src={diagram.thumbnail}
                      alt={diagram.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link to="/diagram/$diagramId" params={{ diagramId: diagram.id }}>
                    Open
                  </Link>
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateDiagram(diagram.id)}
                      disabled={duplicateDiagramMutation.isPending}
                    >
                      {duplicateDiagramMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Duplicate diagram</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDiagram(diagram.id)}
                      disabled={deletingId === diagram.id}
                    >
                      {deletingId === diagram.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete diagram</p>
                  </TooltipContent>
                </Tooltip>
              </CardFooter>
            </Card>
          ))}
        </TooltipProvider>
      </div>

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
