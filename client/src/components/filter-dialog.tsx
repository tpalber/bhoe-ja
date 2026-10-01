import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { articleSourceNames, videoSourceNames } from '../lib/sources';
import { cn } from '../lib/utils';
import { EMPTY_FILTERS, type SearchFilters } from '../types';

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Date;
  onChange: (d?: Date) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) => date > new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  feedType: 'articles' | 'videos';
}

export function FilterDialog({
  open,
  onOpenChange,
  filters,
  onApply,
  feedType,
}: FilterDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [sources, setSources] = useState<string[]>([]);

  // Sync local form state when the dialog opens.
  useEffect(() => {
    if (open) {
      setStartDate(filters.startDate);
      setEndDate(filters.endDate);
      setSearchValue(filters.searchValue ?? '');
      setSources(filters.sources ?? []);
    }
  }, [open, filters]);

  const sourceOptions =
    feedType === 'articles' ? articleSourceNames : videoSourceNames;

  const toggleSource = (name: string) => {
    setSources((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handleApply = () => {
    onApply({
      startDate,
      endDate,
      searchValue: searchValue.trim() ? searchValue.trim() : undefined,
      sources: sources.length > 0 ? sources : undefined,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    onApply({ ...EMPTY_FILTERS });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
          <DialogDescription>
            Filter by date range, title, or news source.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateField
              label="Start date"
              value={startDate}
              onChange={setStartDate}
            />
            <DateField label="End date" value={endDate} onChange={setEndDate} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-title">Title contains</Label>
            <Input
              id="filter-title"
              placeholder="Search titles…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Sources</Label>
            <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
              {sourceOptions.map((name) => (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={sources.includes(name)}
                    onCheckedChange={() => toggleSource(name)}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
