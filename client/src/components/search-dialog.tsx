import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string;
  onSearch: (query: string) => void;
}

/**
 * Minimal search overlay: transparent dialog, just the input box with a
 * search button inside it. Clicking outside (or Escape) closes it.
 */
export function SearchDialog({
  open,
  onOpenChange,
  initialValue,
  onSearch,
}: SearchDialogProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) setValue(initialValue ?? '');
  }, [open, initialValue]);

  const handleSearch = () => {
    onSearch(value.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-none bg-transparent p-0 shadow-none outline-none [&>button]:hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="mx-auto w-[90vw] max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <div className="relative">
            <Input
              autoFocus
              placeholder="Search titles…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-14 rounded-full border border-white/40 bg-white/25 pl-6 pr-16 text-lg text-white shadow-2xl outline-none backdrop-blur-md placeholder:text-white/60 focus-visible:outline-none focus-visible:ring-0"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#234F1E] text-white transition hover:opacity-90"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
