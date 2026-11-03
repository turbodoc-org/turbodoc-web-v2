import * as React from "react";
import {
  BookmarkIcon,
  Code2,
  MoreHorizontal,
  StickyNote,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Thumbnail-gallery card shared by the Notes, Bookmarks, Snippets and Diagrams
 * grids (nano.design "Dashboard grid — A · Final", component "Card").
 *
 * Layout: an inset preview (16:10 on desktop, 1:1 on phones) above a meta block
 * with a module-coloured icon, the title and a single line of details. The
 * title is a stretched link so the whole card is clickable while quick actions
 * and the "more" menu stay real, separately focusable buttons. Actions appear
 * on hover / keyboard focus; on touch devices a long-press opens the menu.
 */

export type ContentKind = "note" | "bookmark" | "code" | "diagram";

const KIND_ICON: Record<ContentKind, { icon: LucideIcon; className: string }> = {
  note: { icon: StickyNote, className: "text-module-note" },
  bookmark: { icon: BookmarkIcon, className: "text-module-bookmark" },
  code: { icon: Code2, className: "text-module-code" },
  diagram: { icon: Workflow, className: "text-module-diagram" },
};

/** Classes for a destructive DropdownMenuItem (e.g. Delete) inside a card menu. */
export const DESTRUCTIVE_MENU_ITEM =
  "text-destructive focus:bg-destructive/10 focus:text-destructive dark:text-red-400 dark:focus:bg-destructive/20 dark:focus:text-red-400";

/** Padding for text-based previews; a % of the card width so it scales with the column. */
export const PREVIEW_PADDING = "px-[6%] py-[5.5%]";

const PREVIEW_FRAME =
  "relative mx-2 mt-2 aspect-[16/10] overflow-hidden rounded-thumb border border-thumb-line max-sm:aspect-square";

const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE = 10;

interface ContentCardProps {
  kind: ContentKind;
  title: string;
  /** One line of metadata under the title, e.g. "Edited today · design". */
  details?: React.ReactNode;
  /** Primary destination, rendered as a real link (middle-click / cmd-click work). */
  href?: string;
  /** Open in a new tab (bookmarks). */
  external?: boolean;
  /**
   * Called for plain left-clicks instead of following `href` (SPA navigation),
   * or as the primary action when there is no `href`.
   */
  onOpen?: () => void;
  /** Preview contents. Use PREVIEW_PADDING for text previews. */
  preview: React.ReactNode;
  /** Extra classes for the preview frame, e.g. its background. Defaults to bg-thumb. */
  previewClassName?: string;
  previewStyle?: React.CSSProperties;
  /** Fade the bottom of the preview into this colour class (e.g. "to-thumb"). */
  fadeClassName?: string;
  /** Badges pinned to the top-left of the preview (e.g. "Unread"). */
  badge?: React.ReactNode;
  /** Small buttons shown next to the "more" button (use CardActionButton). */
  quickActions?: React.ReactNode;
  /** DropdownMenuItems for the "more" menu. */
  menuItems?: React.ReactNode;
  /** Replaces the title link while renaming inline. */
  titleEditor?: React.ReactNode;
  className?: string;
}

export function ContentCard({
  kind,
  title,
  details,
  href,
  external,
  onOpen,
  preview,
  previewClassName,
  previewStyle,
  fadeClassName,
  badge,
  quickActions,
  menuItems,
  titleEditor,
  className,
}: ContentCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pressTimer = React.useRef<number | null>(null);
  const pressOrigin = React.useRef<{ x: number; y: number } | null>(null);
  const suppressClick = React.useRef(false);
  const lastPointerType = React.useRef<string>("mouse");

  const { icon: Icon, className: iconClassName } = KIND_ICON[kind];
  const hasActions = Boolean(quickActions || menuItems);

  const cancelPress = React.useCallback(() => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressOrigin.current = null;
  }, []);

  React.useEffect(() => cancelPress, [cancelPress]);

  const handlePointerDown = (event: React.PointerEvent) => {
    lastPointerType.current = event.pointerType;
    if (event.pointerType !== "touch" || !menuItems) return;
    pressOrigin.current = { x: event.clientX, y: event.clientY };
    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = null;
      suppressClick.current = true;
      setMenuOpen(true);
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const origin = pressOrigin.current;
    if (!origin) return;
    if (
      Math.abs(event.clientX - origin.x) > LONG_PRESS_MOVE_TOLERANCE ||
      Math.abs(event.clientY - origin.y) > LONG_PRESS_MOVE_TOLERANCE
    ) {
      cancelPress();
    }
  };

  const handleClickCapture = (event: React.MouseEvent) => {
    // Swallow the click that follows a long-press so it doesn't also open the item.
    if (suppressClick.current) {
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    // Android fires contextmenu on long-press; we show our own menu instead.
    if (lastPointerType.current === "touch" && menuItems) event.preventDefault();
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onOpen) return;
    const modified =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (modified) return;
    event.preventDefault();
    onOpen();
  };

  const titleClassName =
    "line-clamp-2 min-w-0 text-left text-sm font-semibold leading-5 text-foreground outline-none " +
    "after:absolute after:inset-0 after:rounded-card after:content-['']";

  let titleNode: React.ReactNode;
  if (titleEditor) {
    titleNode = <div className="min-w-0 flex-1">{titleEditor}</div>;
  } else if (href) {
    titleNode = (
      <a
        href={href}
        data-card-link
        onClick={handleLinkClick}
        className={titleClassName}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {title}
      </a>
    );
  } else if (onOpen) {
    titleNode = (
      <button type="button" data-card-link onClick={onOpen} className={titleClassName}>
        {title}
      </button>
    );
  } else {
    titleNode = <span className={titleClassName}>{title}</span>;
  }

  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-card border border-border bg-card",
        "transition-[transform,box-shadow,border-color] duration-200 ease-out [-webkit-touch-callout:none]",
        "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover motion-reduce:hover:translate-y-0",
        "has-[[data-card-link]:focus-visible]:border-primary has-[[data-card-link]:focus-visible]:ring-[3px] has-[[data-card-link]:focus-visible]:ring-focus-ring",
        menuOpen && "border-line-strong shadow-card-hover",
        "animate-in fade-in duration-300",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={cancelPress}
      onPointerCancel={cancelPress}
      onPointerLeave={cancelPress}
      onClickCapture={handleClickCapture}
      onContextMenu={handleContextMenu}
    >
      <div
        data-slot="card-preview"
        className={cn(PREVIEW_FRAME, "bg-thumb text-[11px] leading-[17px] text-thumb-text", previewClassName)}
        style={previewStyle}
      >
        {preview}
        {fadeClassName && (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-b from-transparent",
              fadeClassName,
            )}
          />
        )}
        {badge && <div className="absolute left-2.5 top-2.5 flex gap-1">{badge}</div>}
      </div>

      {hasActions && (
        <div
          data-open={menuOpen || undefined}
          className={cn(
            "absolute right-4 top-4 z-10 flex gap-1 opacity-0 transition-opacity duration-150",
            "group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 data-[open]:opacity-100",
            // Touch devices have no hover: actions stay hidden and untappable; long-press opens the menu.
            "[@media(hover:none)]:pointer-events-none",
          )}
        >
          {quickActions}
          {menuItems && (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <CardActionButton label={`More actions for ${title}`}>
                  <MoreHorizontal />
                </CardActionButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                // Don't pull focus back to the trigger when an item swapped in an inline editor.
                onCloseAutoFocus={(event) => {
                  if (titleEditor) event.preventDefault();
                }}
              >
                {menuItems}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-1 px-3.5 pb-3.5 pt-3 max-sm:px-3 max-sm:pb-3 max-sm:pt-2.5">
        <div className="flex items-start gap-2">
          <Icon aria-hidden className={cn("mt-[3px] size-3.5 shrink-0", iconClassName)} />
          {titleNode}
        </div>
        {details && <p className="truncate text-xs leading-4 text-faint">{details}</p>}
      </div>
    </article>
  );
}

interface CardActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

/** Small overlay button used in a card's action cluster. */
export const CardActionButton = React.forwardRef<HTMLButtonElement, CardActionButtonProps>(
  ({ label, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex size-7 items-center justify-center rounded-[7px] border border-line-strong bg-overlay text-foreground backdrop-blur-sm",
        "transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
CardActionButton.displayName = "CardActionButton";

/** "● Unread"-style pill for the top-left of a preview. */
export function CardBadge({
  children,
  dotClassName,
  className,
}: {
  children: React.ReactNode;
  dotClassName?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-[3px] text-[10px] font-semibold leading-none text-white backdrop-blur-sm",
        className,
      )}
    >
      {dotClassName && <span aria-hidden className={cn("size-1.5 rounded-full", dotClassName)} />}
      {children}
    </span>
  );
}

export function ContentCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col overflow-hidden rounded-card border border-border bg-card">
      <Skeleton className="mx-2 mt-2 aspect-[16/10] rounded-thumb max-sm:aspect-square" />
      <div className="space-y-2 px-3.5 pb-3.5 pt-3 max-sm:px-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** 2 columns on phones and tablets, 3 at ≥1024px, 4 at ≥1280px. */
export function ContentGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4",
        className,
      )}
      {...props}
    />
  );
}
