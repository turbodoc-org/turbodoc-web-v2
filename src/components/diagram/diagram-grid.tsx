import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  useDiagrams,
  useDeleteDiagram,
  useDuplicateDiagram,
  useUpdateDiagram,
} from '@/lib/hooks/use-diagrams';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FileText,
  Trash2,
  Copy,
  Pencil,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [editingTitle, setEditingTitle] = useState('');

  const handleDuplicateDiagram = async (id: string) => {
    duplicateDiagramMutation.mutate(id);
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
    setEditingTitle('');
  };

  const handleSaveRename = async (id: string) => {
    if (!editingTitle.trim()) {
      handleCancelRename();
      return;
    }

    updateDiagramMutation.mutate({
      id,
      updates: { title: editingTitle.trim() },
    });
    setEditingId(null);
    setEditingTitle('');
  };

  const confirmDelete = () => {
    if (!diagramToDelete) return;

    setDeletingId(diagramToDelete);
    deleteDiagramMutation.mutate(diagramToDelete, {
      onSettled: () => {
        setDeleteDialogOpen(false);
        setDiagramToDelete(null);
        setDeletingId(null);
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading diagrams...</p>
        </div>
      </div>
    );
  }

  if (diagrams.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No diagrams yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first diagram to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <TooltipProvider>
          {diagrams.map((diagram) => (
            <Card key={diagram.id} className="overflow-hidden group">
              <CardHeader className="pb-3">
                {editingId === diagram.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveRename(diagram.id);
                        } else if (e.key === 'Escape') {
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
                    <CardTitle className="text-base truncate">
                      {diagram.title}
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            handleStartRename(diagram.id, diagram.title)
                          }
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
                      className="h-full w-full object-cover"
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
                  <Link
                    to="/diagram/$diagramId"
                    params={{ diagramId: diagram.id }}
                  >
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diagram</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this diagram? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
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
