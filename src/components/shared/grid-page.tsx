import * as React from "react";
import { ArrowUpDown, ChevronDown, Loader2, Plus, Search, X, type LucideIcon } from "lucide-react";
import { AppHeader } from "@/components/shared/app-header";
import { MobileTabBar } from "@/components/shared/module-nav";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { z } from "zod";

/* ------------------------------------------------------------------------------------------------
 * Layout
 * ----------------------------------------------------------------------------------------------*/

interface GridPageLayoutProps {
  children: React.ReactNode;
  /** Rendered after the content, e.g. a MobileFab. */
  floating?: React.ReactNode;
  footer?: React.ReactNode;
}

/** Shell for the module grid pages: module-tab header, 1200px content column, mobile tab bar. */
export function GridPageLayout({ children, floating, footer }: GridPageLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <AppHeader nav="modules" />
      <div className="mx-auto flex w-full max-w-[1248px] flex-1 flex-col gap-5 px-4 pb-28 pt-5 sm:gap-7 sm:px-6 sm:pb-16 sm:pt-12">
        {children}
      </div>
      {footer && <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">{footer}</div>}
      {floating}
      <MobileTabBar />
    </main>
  );
}

interface GridPageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Primary action; hidden on phones where the FAB takes over. */
  action?: React.ReactNode;
}

export function GridPageHeader({ title, subtitle, action }: GridPageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
        <h1 className="text-[26px] font-[650] leading-8 tracking-[-0.02em] text-foreground sm:text-[30px] sm:leading-9">
          {title}
        </h1>
        {subtitle && <p className="truncate text-sm text-faint">{subtitle}</p>}
      </div>
      {action && <div className="hidden shrink-0 sm:flex">{action}</div>}
    </div>
  );
}

interface NewItemButtonProps {
  label: string;
  onClick: () => void;
  pending?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

export const NewItemButton = React.forwardRef<HTMLButtonElement, NewItemButtonProps>(
  ({ label, onClick, pending, disabled, shortcut = "N" }, ref) => (
    <Button
      ref={ref}
      onClick={onClick}
      disabled={disabled || pending}
      className="h-[38px] gap-2 rounded-control pl-3 pr-3.5 font-[550] shadow-none"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Plus strokeWidth={2.2} />}
      {label}
      {shortcut && (
        <kbd className="ml-1 rounded-[5px] bg-white/20 px-1.5 py-px font-sans text-[11px] font-semibold">
          {shortcut}
        </kbd>
      )}
    </Button>
  ),
);
NewItemButton.displayName = "NewItemButton";

/* ------------------------------------------------------------------------------------------------
 * Toolbar: search · tag chips · sort
 * ----------------------------------------------------------------------------------------------*/

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

export interface TagOption {
  tag: string;
  count?: number;
}

interface GridToolbarProps<T extends string> {
  searchRef: React.RefObject<HTMLInputElement | null>;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searching?: boolean;
  tags?: TagOption[];
  selectedTag?: string | null;
  onTagChange?: (tag: string | null) => void;
  sort: T;
  sortOptions: SortOption<T>[];
  onSortChange: (value: T) => void;
  /** Extra filter chips shown before the tag chips (e.g. bookmarks' "Broken"). */
  filters?: React.ReactNode;
}

export function GridToolbar<T extends string>({
  searchRef,
  search,
  onSearchChange,
  searchPlaceholder,
  searching,
  tags,
  selectedTag = null,
  onTagChange,
  sort,
  sortOptions,
  onSortChange,
  filters,
}: GridToolbarProps<T>) {
  const showTags = Boolean(onTagChange && tags && tags.length > 0);
  const showChipRow = showTags || Boolean(filters);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchField
        inputRef={searchRef}
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        searching={searching}
      />
      {showChipRow && (
        <div className="order-3 -mx-4 flex w-[calc(100%+2rem)] min-w-0 items-center gap-1.5 overflow-x-auto px-4 scrollbar-none sm:order-2 sm:mx-0 sm:w-auto sm:flex-1 sm:px-0">
          {filters}
          {filters && showTags && <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />}
          {showTags && onTagChange && tags && (
            <TagChips tags={tags} selected={selectedTag} onChange={onTagChange} />
          )}
        </div>
      )}
      <SortMenu
        value={sort}
        options={sortOptions}
        onChange={onSortChange}
        className={cn(!showChipRow && "sm:ml-auto")}
      />
    </div>
  );
}

function useIsMac() {
  const [isMac, setIsMac] = React.useState(true);
  React.useEffect(() => {
    setIsMac(/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent));
  }, []);
  return isMac;
}

interface SearchFieldProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searching?: boolean;
}

function SearchField({ inputRef, value, onChange, placeholder, searching }: SearchFieldProps) {
  const isMac = useIsMac();

  return (
    <div className="relative order-1 min-w-0 flex-1 sm:w-[360px] sm:flex-none">
      {searching ? (
        <Loader2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-faint" />
      ) : (
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
      )}
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onChange("");
            inputRef.current?.blur();
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "peer h-[38px] w-full rounded-control border border-border bg-card pl-9 pr-16 text-sm text-foreground outline-none",
          "placeholder:text-faint transition-[border-color,box-shadow] focus:border-primary focus:ring-[3px] focus:ring-focus-ring",
          "[&::-webkit-search-cancel-button]:appearance-none",
        )}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-faint transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-[5px] border border-line-strong px-1.5 py-px font-sans text-[11px] text-faint peer-focus:hidden sm:block">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      )}
    </div>
  );
}

const MAX_VISIBLE_TAGS = 5;

interface TagChipsProps {
  tags: TagOption[];
  selected: string | null;
  onChange: (tag: string | null) => void;
}

/** Single-select tag filter: "All" + the most-used tags, the rest behind "+N". */
function TagChips({ tags, selected, onChange }: TagChipsProps) {
  const [open, setOpen] = React.useState(false);

  let visible = tags.slice(0, MAX_VISIBLE_TAGS);
  if (selected && !visible.some((t) => t.tag === selected)) {
    // Keep the active filter visible even when it lives in the overflow list.
    visible = [...visible.slice(0, MAX_VISIBLE_TAGS - 1), { tag: selected }];
  }
  const overflow = tags.filter((t) => !visible.some((v) => v.tag === t.tag));

  return (
    <div role="group" aria-label="Filter by tag" className="flex items-center gap-1.5">
      <Chip active={selected === null} onClick={() => onChange(null)}>
        All
      </Chip>
      {visible.map((t) => (
        <Chip
          key={t.tag}
          active={selected === t.tag}
          onClick={() => onChange(selected === t.tag ? null : t.tag)}
        >
          {t.tag}
        </Chip>
      ))}
      {overflow.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-8 shrink-0 rounded-full px-2.5 text-[13px] text-faint transition-colors hover:text-foreground"
            >
              +{overflow.length}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-0">
            <Command>
              <CommandInput placeholder="Search tags…" />
              <CommandList>
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup>
                  {overflow.map((t) => (
                    <CommandItem
                      key={t.tag}
                      value={t.tag}
                      onSelect={() => {
                        onChange(t.tag);
                        setOpen(false);
                      }}
                    >
                      <span className="flex-1 truncate">{t.tag}</span>
                      {t.count !== undefined && (
                        <span className="text-xs text-faint">{t.count}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

/** Pill toggle used for tag and type filters. */
export function Chip({
  active,
  onClick,
  children,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** "danger" for problem filters such as broken links. */
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-8 max-w-[12rem] shrink-0 truncate rounded-full px-3 text-[13px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        tone === "danger"
          ? cn(
              // Flex layout for the icon; danger chips have short fixed labels, so no truncation needed.
              "inline-flex items-center gap-1.5 [&_svg]:size-3.5 [&_svg]:shrink-0",
              active
                ? "bg-red-600 font-medium text-white dark:bg-red-500"
                : "border border-red-500/40 text-red-600 hover:border-red-500/70 hover:bg-red-500/5 dark:text-red-400",
            )
          : active
            ? "bg-foreground font-medium text-background"
            : "border border-border text-muted-foreground hover:border-line-strong hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

interface SortMenuProps<T extends string> {
  value: T;
  options: SortOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

function SortMenu<T extends string>({ value, options, onChange, className }: SortMenuProps<T>) {
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Sort: ${current.label}`}
          className={cn(
            "order-2 flex h-[38px] shrink-0 items-center gap-1.5 rounded-control border border-border px-3 text-[13px] text-muted-foreground transition-colors sm:order-3",
            "hover:border-line-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <ArrowUpDown className="size-3.5" />
          <span className="hidden sm:inline">{current.label}</span>
          <ChevronDown className="hidden size-3.5 sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as T)}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Empty state
 * ----------------------------------------------------------------------------------------------*/

interface GridEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function GridEmptyState({ icon: Icon, title, description, action }: GridEmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-border px-6 py-16 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-border bg-surface-2">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1.5 text-base font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-faint">{description}</p>
      {action}
    </div>
  );
}

/** Filtering cleared everything: offer to reset. */
export function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center animate-in fade-in duration-300">
      <Search className="mb-3 size-6 text-faint" />
      <h3 className="mb-1 text-base font-semibold text-foreground">No matches</h3>
      <p className="mb-4 text-sm text-faint">Try a different search or tag.</p>
      <Button variant="outline" size="sm" onClick={onReset}>
        <X />
        Clear filters
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Hooks
 * ----------------------------------------------------------------------------------------------*/

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Grid keyboard shortcuts: ⌘K / Ctrl+K or "/" focuses search, "N" creates a new item.
 * Ignored while typing or while a dialog is open.
 */
export function useGridShortcuts({
  searchRef,
  onNew,
  enabled = true,
}: {
  searchRef: React.RefObject<HTMLInputElement | null>;
  onNew?: () => void;
  /** Turn off while an overlay (e.g. a full-screen editor) owns the keyboard. */
  enabled?: boolean;
}) {
  const onNewRef = React.useRef(onNew);
  onNewRef.current = onNew;
  const enabledRef = React.useRef(enabled);
  enabledRef.current = enabled;

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current || event.defaultPrevented || event.repeat) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]')) return;

      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;

      if (key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (key === "n" && !event.shiftKey && onNewRef.current) {
        event.preventDefault();
        onNewRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchRef]);
}

/** A string option persisted to localStorage (read after mount to stay hydration-safe). */
export function usePersistentOption<T extends string>(key: string, initial: T, allowed: readonly T[]) {
  const [value, setValue] = React.useState<T>(initial);
  const allowedRef = React.useRef(allowed);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored && allowedRef.current.includes(stored as T)) setValue(stored as T);
    } catch {
      // Storage unavailable (private mode etc.) — keep the default.
    }
  }, [key]);

  const update = React.useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, next);
      } catch {
        // ignore
      }
    },
    [key],
  );

  return [value, update] as const;
}

/** Tag → usage count, most used first (ties alphabetical). */
export function collectTags(lists: string[][]): TagOption[] {
  const counts = new Map<string, number>();
  for (const tags of lists) {
    for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  );
}

/** Search params for grid routes: `?new=1` opens the create flow (used by the dashboard's New menu). */
export const newItemSearchSchema = z.object({
  new: z.literal(1).optional().catch(undefined),
});

/**
 * One-shot "create on arrival" intent: captures `requested` on mount, then calls `clear`
 * to drop the param from the URL so a reload or back-navigation doesn't reopen the dialog.
 */
export function useNewItemIntent(requested: boolean, clear: () => void) {
  const [intent] = React.useState(requested);
  const clearRef = React.useRef(clear);
  clearRef.current = clear;

  React.useEffect(() => {
    if (requested) clearRef.current();
  }, [requested]);

  return intent;
}
