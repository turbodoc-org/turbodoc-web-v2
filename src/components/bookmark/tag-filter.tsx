import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { getTags } from '@/lib/api';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxVisibleTags?: number;
}

export function TagFilter({
  selectedTags,
  onTagsChange,
  maxVisibleTags = 2,
}: TagFilterProps) {
  const [open, setOpen] = React.useState(false);

  // Fetch available tags
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const handleSelect = (tagValue: string) => {
    if (selectedTags.includes(tagValue)) {
      // Remove tag
      onTagsChange(selectedTags.filter((t) => t !== tagValue));
    } else {
      // Add tag
      onTagsChange([...selectedTags, tagValue]);
    }
  };

  const handleRemoveTag = (tagValue: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tagValue));
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  const visibleTags = selectedTags.slice(0, maxVisibleTags);
  const hiddenCount = selectedTags.length - maxVisibleTags;

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedTags.length === 0
              ? 'Filter by tags...'
              : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.tag}
                    value={tag.tag}
                    onSelect={() => handleSelect(tag.tag)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedTags.includes(tag.tag)
                          ? 'opacity-100'
                          : 'opacity-0',
                      )}
                    />
                    {tag.tag}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {tag.count}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <>
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {hiddenCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              +{hiddenCount}
            </Badge>
          )}
          {selectedTags.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 text-xs"
            >
              Clear all
            </Button>
          )}
        </>
      )}
    </div>
  );
}
