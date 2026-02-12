import { type ReactNode } from 'react';
import { type Table as TanStackTable, type Row, flexRender } from '@tanstack/react-table';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';

interface DataTableProps<T> {
  table: TanStackTable<T>;
  onRowClick?: (row: Row<T>) => void;
  isFetching?: boolean;
  getRowClassName?: (row: Row<T>) => string;
  customEmptyState?: ReactNode;
  children?: ReactNode;
}

export function DataTable<T>({
  table,
  onRowClick,
  isFetching,
  getRowClassName,
  customEmptyState,
  children,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {children}
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isFetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {table.getAllColumns().filter(c => c.getIsVisible()).map((col) => (
                      <td key={col.id} className="p-2">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'border-b transition-colors data-[state=selected]:bg-muted',
                      getRowClassName?.(row) ?? (onRowClick ? 'cursor-pointer hover:bg-muted/50' : 'hover:bg-muted/50'),
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : customEmptyState ? (
                <tr>
                  <td colSpan={table.getAllColumns().length}>
                    {customEmptyState}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={table.getAllColumns().length} className="h-24 text-center">
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
