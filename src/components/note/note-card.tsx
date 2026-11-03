import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { useNavigate } from "@tanstack/react-router";
import { Check, Loader2, PenLine, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Note } from "@/lib/types";
import { deleteNote } from "@/lib/api";
import { cn, parseTags } from "@/lib/utils";
import { countTasks, formatRelativeDate } from "@/lib/format";
import { ContentCard, DESTRUCTIVE_MENU_ITEM, PREVIEW_PADDING } from "@/components/shared/content-card";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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

interface NoteCardProps {
  note: Note;
  onDelete: (id: string, title: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const title = note.title?.trim() || "Untitled note";
  const details = React.useMemo(() => noteDetails(note), [note]);

  const openNote = () => navigate({ to: "/note/$noteId", params: { noteId: note.id } });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNote(note.id);
      setShowDeleteDialog(false);
      onDelete(note.id, note.title);
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ContentCard
        kind="note"
        title={title}
        details={details}
        href={`/note/${note.id}`}
        onOpen={openNote}
        fadeClassName="to-thumb"
        preview={<NotePreview content={note.content} />}
        menuItems={
          <>
            <DropdownMenuItem onSelect={openNote}>
              <PenLine />
              Open note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={DESTRUCTIVE_MENU_ITEM}
              disabled={isDeleting}
              onSelect={() => setShowDeleteDialog(true)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </>
        }
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="animate-in zoom-in-95 fade-in duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** "Edited today · design, launch +1 · 2/9 done" */
function noteDetails(note: Note): string {
  const parts: string[] = [];
  const edited = formatRelativeDate(note.updated_at ?? note.created_at);
  if (edited) parts.push(`Edited ${edited}`);

  const tags = parseTags(note.tags);
  if (tags.length > 0) {
    parts.push(tags.slice(0, 2).join(", ") + (tags.length > 2 ? ` +${tags.length - 2}` : ""));
  }

  const tasks = countTasks(note.content ?? "");
  if (tasks.total > 0) parts.push(`${tasks.done}/${tasks.total} done`);

  return parts.join(" · ");
}

/* ------------------------------------------------------------------------------------------------
 * Preview: the first lines of the note rendered as compact markdown, fading out at the bottom.
 * ----------------------------------------------------------------------------------------------*/

// Enough to fill the thumbnail; keeps parsing cheap for long notes.
const PREVIEW_CHARS = 700;

const UNCHECKED = "☐";
const CHECKED = "☑";

/** Turn "- [ ] item" / "- [x] item" into marker characters the list renderer understands. */
function markTasks(markdown: string): string {
  return markdown
    .replace(/^(\s*[-*+]\s+)\[ \]\s?/gm, `$1${UNCHECKED} `)
    .replace(/^(\s*[-*+]\s+)\[(x|X)\]\s?/gm, `$1${CHECKED} `);
}

/** Strip a leading task marker from a list item's children (tight or loose lists). */
function splitTaskMarker(children: React.ReactNode): { checked: boolean | null; rest: React.ReactNode } {
  const items = React.Children.toArray(children);
  const [first, ...others] = items;

  if (typeof first === "string" && (first.startsWith(UNCHECKED) || first.startsWith(CHECKED))) {
    return { checked: first.startsWith(CHECKED), rest: [first.slice(2), ...others] };
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(first)) {
    const inner = splitTaskMarker(first.props.children);
    if (inner.checked !== null) {
      return {
        checked: inner.checked,
        rest: [React.cloneElement(first, undefined, inner.rest), ...others],
      };
    }
  }

  return { checked: null, rest: children };
}

const heading = ({ children }: { children?: React.ReactNode }) => (
  <p className="mb-1 text-xs font-semibold leading-[17px] text-thumb-ink">{children}</p>
);

const PREVIEW_COMPONENTS: Components = {
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-1.5 list-disc pl-3.5 marker:text-faint">{children}</ul>,
  ol: ({ children }) => <ol className="mb-1.5 list-decimal pl-4 marker:text-faint">{children}</ol>,
  li: ({ children }) => {
    const { checked, rest } = splitTaskMarker(children);
    if (checked === null) return <li className="[&>p]:mb-0">{children}</li>;
    return (
      <li className="-ml-3.5 flex list-none items-start gap-1.5 [&>p]:mb-0">
        <span
          aria-hidden
          className={cn(
            "mt-[3px] flex size-[11px] shrink-0 items-center justify-center rounded-[3px] border",
            checked ? "border-primary bg-primary text-primary-foreground" : "border-faint",
          )}
        >
          {checked && <Check className="size-2" strokeWidth={3.5} />}
        </span>
        <span className={cn("min-w-0", checked && "text-faint line-through")}>{rest}</span>
      </li>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="mb-1.5 border-l-2 border-line-strong pl-2 italic">{children}</blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mb-1.5 overflow-hidden whitespace-pre rounded-md border border-border bg-code-bg px-2.5 py-2 font-mono text-[10px] leading-4 text-code-ink [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  code: ({ children, className }) =>
    /language-mermaid/.test(className ?? "") ? (
      <code>Mermaid diagram</code>
    ) : (
      <code className="rounded bg-code-bg px-1 font-mono text-[10px] text-code-ink">{children}</code>
    ),
  // The whole card is a link; avoid nested interactive elements and heavy media.
  a: ({ children }) => <span className="text-primary">{children}</span>,
  img: () => null,
  hr: () => <hr className="my-1.5 border-border" />,
};

function NotePreview({ content }: { content: string }) {
  const source = React.useMemo(() => markTasks((content ?? "").slice(0, PREVIEW_CHARS)), [content]);

  if (!source.trim()) {
    return <div className="flex h-full items-center justify-center text-faint">Empty note</div>;
  }

  return (
    <div className={cn(PREVIEW_PADDING, "h-full overflow-hidden break-words")}>
      <ReactMarkdown components={PREVIEW_COMPONENTS}>{source}</ReactMarkdown>
    </div>
  );
}
