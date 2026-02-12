import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type TableState,
} from '@tanstack/react-table';

interface UseDataTableOptions<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pageCount?: number;
  defaultPageSize?: number;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  initialState?: Partial<Pick<TableState, 'pagination' | 'columnVisibility' | 'sorting' | 'columnFilters'>>;
}

export function useDataTable<T>({
  data,
  columns,
  pageCount = -1,
  defaultPageSize = 10,
  sorting: externalSorting,
  onSortingChange: externalOnSortingChange,
  pagination: externalPagination,
  onPaginationChange: externalOnPaginationChange,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  initialState,
}: UseDataTableOptions<T>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>(
    initialState?.sorting ?? [],
  );
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    initialState?.pagination ?? {
      pageIndex: 0,
      pageSize: defaultPageSize,
    },
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialState?.columnFilters ?? [],
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialState?.columnVisibility ?? {},
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const sorting = externalSorting ?? internalSorting;
  const pagination = externalPagination ?? internalPagination;

  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      if (externalOnSortingChange) {
        externalOnSortingChange(newSorting);
      } else {
        setInternalSorting(newSorting);
      }
    },
    [sorting, externalOnSortingChange],
  );

  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      if (externalOnPaginationChange) {
        externalOnPaginationChange(newPagination);
      } else {
        setInternalPagination(newPagination);
      }
    },
    [pagination, externalOnPaginationChange],
  );

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<T, unknown>[],
    pageCount,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: handleSortingChange as never,
    onPaginationChange: handlePaginationChange as never,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination,
    manualSorting,
    manualFiltering,
  });

  return useMemo(
    () => ({
      table,
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowSelection,
    }),
    [table, sorting, pagination, columnFilters, columnVisibility, rowSelection],
  );
}
