import { type Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DataTableToolbarProps<T> {
  table: Table<T>;
  searchColumn?: string;
  searchPlaceholder?: string;
  onReset?: () => void;
  children?: React.ReactNode;
}

export function DataTableToolbar<T>({
  table,
  searchColumn,
  searchPlaceholder = 'Search...',
  onReset,
  children,
}: DataTableToolbarProps<T>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const searchValue = searchColumn
    ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''
    : '';

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => table.getColumn(searchColumn)?.setFilterValue(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {children}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              onReset?.();
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
