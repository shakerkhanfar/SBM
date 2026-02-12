import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from 'nuqs';
import {
  useMemo,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router';

import { CallDetailsDrawer } from '@/components/call-details';
import { ChatDetailsDrawer } from '@/components/chat-details';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { paths } from '@/config/paths';
import { useUnifiedHistory } from '@/features/history/hooks/use-unified-history.hook';
import type { UnifiedHistoryItem } from '@/features/history/types';
import { useDataTable } from '@/hooks/use-data-table';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { getSortingStateParser } from '@/lib/parsers';

import { DEFAULT_RETURNED_FIELDS } from '../constants';
import {
  useConversationDetailsQuery,
  useJoinCallMutation,
  useCallHistoryListQuery,
  conversationDetailsKeys,
} from '../hooks';
import type {
  CallHistoryListParams,
  ConversationItem,
  CallHistorySortField,
  CallHistorySortOrder,
  PeriodType,
} from '../types';

import { CallHistoryEmptyState } from './call-history-empty-state';
import { useCallHistoryListColumns } from './call-history-list-columns';
import { DateRangeFilter } from './filters/date-range-filter';

interface CallHistoryListTableProps {
  filters?: Omit<
    CallHistoryListParams,
    'projectId' | 'skip' | 'take' | 'returnedFields'
  >;
  onDrawerStateChange?: (isOpen: boolean) => void;
}

export interface CallHistoryListTableRef {
  getCurrentPageData: () => UnifiedHistoryItem[];
}

export const CallHistoryListTable = forwardRef<
  CallHistoryListTableRef,
  CallHistoryListTableProps
>(({ filters = {}, onDrawerStateChange }, ref) => {
  const isRTL = useIsRTL();
  const [selectedCall, setSelectedCall] = useState<ConversationItem | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedChatThread, setSelectedChatThread] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { callId } = useParams<{ callId: string }>();
  const isClosingDrawerRef = useRef(false);

  // Use nuqs to read URL parameters (same as useDataTable does internally)
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));

  // Read filter values from URL query parameters (read-only, useDataTable manages syncing)
  const [statusFilter, setStatusFilter] = useQueryState(
    'status',
    parseAsArrayOf(parseAsString, ',').withDefault([]),
  );
  const [channelTypeFilter] = useQueryState(
    'channelType',
    parseAsArrayOf(parseAsString, ',').withDefault([]),
  );
  const [agentNameFilter] = useQueryState('agentName', parseAsString);

  // Read search parameter from URL (read-only, useDataTable manages syncing)
  const [searchFilter] = useQueryState('search', parseAsString);

  // Date range filter state - default to "all" (no filter)
  const [dateRangeFilter, setDateRangeFilter] = useQueryState(
    'dateRange',
    parseAsString.withDefault(''),
  );

  // Parse date range from URL (format: "preset|start|end")
  // Default to "all" if no filter is set (sends no period filter)
  const parsedDateRange = useMemo(() => {
    if (!dateRangeFilter) {
      // Default to "all" (no filter)
      return {
        preset: 'all',
        start: undefined,
        end: undefined,
      };
    }
    const [preset, start, end] = dateRangeFilter.split('|');
    return {
      preset: preset || 'all',
      start: start || undefined,
      end: end || undefined,
    };
  }, [dateRangeFilter]);

  // Get sorting from URL state (TanStack Table format)
  const [sorting, setSorting] = useQueryState(
    'sort',
    getSortingStateParser<UnifiedHistoryItem>([]).withDefault([]),
  );

  // Set default sort if none is specified
  React.useEffect(() => {
    if (!sorting || sorting.length === 0) {
      // Set default sort to time descending
      setSorting([{ id: 'time', desc: true }]);
    }
  }, [sorting, setSorting]);

  // Set default status filters only on first load (when no URL params exist)
  // Use a ref to track if we've already set defaults
  const hasSetDefaultsRef = React.useRef(false);

  React.useEffect(() => {
    // Only set defaults once on initial mount
    if (hasSetDefaultsRef.current) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const hasStatusParam = urlParams.has('status');

    // Only set defaults if no status parameter exists in URL
    if (!hasStatusParam) {
      void setStatusFilter(['COMPLETED', 'FAILED', 'IN_PROGRESS', 'FORWARDED']);
      hasSetDefaultsRef.current = true;
    } else {
      // Mark as set even if URL has params (user navigated with params)
      hasSetDefaultsRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Parse sorting from TanStack Table format to API format
  const parseSorting = React.useMemo(() => {
    // Map TanStack Table column IDs to API sort fields
    const columnToSortFieldMap: Record<string, CallHistorySortField> = {
      time: 'time',
      cost: 'cost',
      duration: 'duration',
    };

    if (!sorting || sorting.length === 0) {
      return {
        sortField: 'time' as CallHistorySortField,
        sortOrder: 'desc' as CallHistorySortOrder,
      };
    }

    try {
      // TanStack Table stores sorting as array of objects like [{ id: "time", desc: true }]
      const sortItem = sorting[0];
      if (
        sortItem &&
        typeof sortItem === 'object' &&
        'id' in sortItem &&
        'desc' in sortItem
      ) {
        const columnId = sortItem.id as string;
        const isDesc = sortItem.desc as boolean;
        const apiSortField = columnToSortFieldMap[columnId];

        if (apiSortField) {
          return {
            sortField: apiSortField,
            sortOrder: (isDesc ? 'desc' : 'asc') as CallHistorySortOrder,
          };
        }
      }
    } catch (error) {
      console.warn('Failed to parse sorting:', error);
    }

    return { sortField: undefined, sortOrder: undefined };
  }, [sorting]);

  // Helper function to convert date range to period format
  // Returns null if "all" is selected (no period filter)
  const convertDateRangeToPeriod = useMemo(() => {
    // If "all" is selected, don't send any period filter
    if (parsedDateRange.preset === 'all') {
      return null;
    }

    const getTimeDifference = (): string => {
      const offset = new Date().getTimezoneOffset();
      // Convert minutes to hours (negative because getTimezoneOffset returns opposite sign)
      const hours = -offset / 60;
      return hours.toString();
    };

    const preset = parsedDateRange.preset || 'all';
    const periodMapping: Record<string, PeriodType> = {
      'last-hour': 'LAST_HOUR',
      today: 'TODAY',
      yesterday: 'YESTERDAY',
      'this-week': 'THIS_WEEK',
      'this-month': 'THIS_MONTH',
      custom: 'CUSTOM',
    };

    const period = periodMapping[preset];
    if (!period) {
      return null;
    }

    // For CUSTOM period, require both start and end dates
    // If CUSTOM is selected but dates are missing, don't send period filter
    if (
      period === 'CUSTOM' &&
      (!parsedDateRange.start || !parsedDateRange.end)
    ) {
      return null;
    }

    const result: {
      period: PeriodType;
      startPeriod?: string;
      endPeriod?: string;
      timeDifference: string;
    } = {
      period,
      timeDifference: getTimeDifference(),
    };

    // Add startPeriod and endPeriod for custom dates
    if (period === 'CUSTOM' && parsedDateRange.start && parsedDateRange.end) {
      // Start date: beginning of day (00:00:00.000)
      const startDate = new Date(parsedDateRange.start);
      startDate.setHours(0, 0, 0, 0);
      result.startPeriod = startDate.getTime().toString();

      // End date: end of day (23:59:59.999)
      const endDate = new Date(parsedDateRange.end);
      endDate.setHours(23, 59, 59, 999);
      result.endPeriod = endDate.getTime().toString();
    } else if (preset === 'last-hour') {
      // For last-hour, calculate timestamps
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      result.startPeriod = oneHourAgo.getTime().toString();
      result.endPeriod = now.getTime().toString();
    }

    return result;
  }, [parsedDateRange]);

  // Prepare query parameters with pagination and filters
  const queryParams = useMemo(() => {
    const apiFilters: any = {};

    // Convert URL filter values to API filter format
    // Status: Always send as array (even if single value)
    if (statusFilter.length > 0) {
      apiFilters.status = statusFilter;
    }

    // Channel Type: Always send as array (even if single value)
    if (channelTypeFilter.length > 0) {
      apiFilters.channelType = channelTypeFilter;
    }

    // Agent: Map to agent filter object
    if (agentNameFilter) {
      apiFilters.agent = {
        name: agentNameFilter,
      };
    }

    const voiceAgentId = import.meta.env.VITE_VOICE_AGENT_ID;

    const params: any = {
      ...filters,
      skip: page, // Server expects page number starting from 1
      take: perPage,
      returnedFields: [...DEFAULT_RETURNED_FIELDS],
      filters: apiFilters,
      ...(parseSorting.sortField && { sortField: parseSorting.sortField }),
      ...(parseSorting.sortOrder && { sortOrder: parseSorting.sortOrder }),
      ...(searchFilter && { search: searchFilter }),
      ...(voiceAgentId && voiceAgentId !== 'your_voice_agent_id' && { voiceAgentId }),
    };

    // Only add period-related fields when a specific period is selected (not "all")
    if (convertDateRangeToPeriod) {
      params.period = convertDateRangeToPeriod.period;
      params.timeDifference = convertDateRangeToPeriod.timeDifference;
      if (convertDateRangeToPeriod.startPeriod) {
        params.startPeriod = convertDateRangeToPeriod.startPeriod;
      }
      if (convertDateRangeToPeriod.endPeriod) {
        params.endPeriod = convertDateRangeToPeriod.endPeriod;
      }
    }

    return params;
  }, [
    filters,
    page,
    perPage,
    statusFilter,
    channelTypeFilter,
    agentNameFilter,
    parseSorting,
    searchFilter,
    convertDateRangeToPeriod,
  ]);

  // Fetch data using server-side pagination
  const { data, isLoading, isError } = useCallHistoryListQuery(queryParams);

  // Extract voice call conversations from response
  const conversations = useMemo(
    () => data?.conversations || [],
    [data?.conversations],
  );
  const total = data?.total || 0;

  // Merge voice calls with chat threads into unified history
  const { items: unifiedItems, isThreadsLoading } = useUnifiedHistory(
    conversations,
    'demo-user',
  );

  // Define columns with row click handler
  const columns = useCallHistoryListColumns();

  // Handle row click to open drawer (voice calls) or navigate to chatbot (chat threads)
  const handleRowClick = (row: { original: UnifiedHistoryItem }) => {
    const item = row.original;

    if (item.type === 'chat') {
      // Clear voice call state when switching to chat
      setSelectedCall(null);
      setIsChatDrawerOpen(true);
      setSelectedChatThread({
        id: item.id,
        title: item.threadTitle || 'Chat',
      });
      setIsDrawerOpen(true);
      return;
    }

    // Voice call: don't open drawer for PENDING status calls
    if (item.status === 'PENDING') {
      return;
    }

    // Clear chat state when switching to voice call
    setSelectedChatThread(null);
    setIsChatDrawerOpen(false);

    // Build a ConversationItem for the drawer
    const callItem: ConversationItem = {
      id: item.id,
      duration: item.duration || 0,
      time: item.createdAt,
      cost: item.cost || 0,
      status: item.status || 'COMPLETED',
      channelType: item.channelType || 'Web',
      agentName: item.agentName || '',
      agentId: item.agentId || '',
    };

    setSelectedCall(callItem);
    setIsDrawerOpen(true);

    // Navigate to call-history/:callId URL while preserving existing query parameters
    const currentSearch = window.location.search;
    const callHistoryUrl =
      paths.app.calls.getHref(item.id) + currentSearch;
    navigate(callHistoryUrl);
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    isClosingDrawerRef.current = true;
    setIsDrawerOpen(false);
    setSelectedCall(null);
    setSelectedChatThread(null);
    setIsChatDrawerOpen(false);
    onDrawerStateChange?.(false);

    // Navigate back to call-history page (without call ID) while preserving query parameters
    const currentSearch = window.location.search;
    const callHistoryUrl = '/call-history' + currentSearch;
    navigate(callHistoryUrl, { replace: true });
  };

  // Notify parent component of drawer state changes
  useEffect(() => {
    onDrawerStateChange?.(isDrawerOpen);
  }, [isDrawerOpen, onDrawerStateChange]);

  // Auto-open drawer when callId is present in URL on first render
  useEffect(() => {
    if (
      callId &&
      !isDrawerOpen &&
      !selectedCall &&
      !isClosingDrawerRef.current
    ) {
      // Create a minimal ConversationItem with just the ID
      // The drawer will fetch the full details internally
      const callItem: ConversationItem = {
        id: callId,
        duration: 0,
        time: new Date().toISOString(),
        cost: 0,
        status: 'PENDING',
        channelType: 'Web',
        agentName: 'Loading...',
        agentId: '',
      };

      setSelectedCall(callItem);
      setIsDrawerOpen(true);
    }

    // Reset the closing flag after the effect runs
    if (isClosingDrawerRef.current) {
      isClosingDrawerRef.current = false;
    }
  }, [callId, isDrawerOpen, selectedCall]);

  // Expose current page data through ref
  useImperativeHandle(
    ref,
    () => ({
      getCurrentPageData: () => unifiedItems,
    }),
    [unifiedItems],
  );

  // Calculate page count for pagination (based on voice call total, since chat threads are appended client-side)
  const pageCount = Math.ceil(total / perPage);

  // Handle date range filter change
  const handleDateRangeChange = React.useCallback(
    (dateRange: { start?: string; end?: string; preset?: string }) => {
      // If "all" is selected, clear the filter
      if (dateRange.preset === 'all') {
        setDateRangeFilter('');
        return;
      }
      // Encode date range into URL: "preset|start|end"
      const encoded = `${dateRange.preset || 'all'}|${dateRange.start || ''}|${dateRange.end || ''}`;
      setDateRangeFilter(encoded);
    },
    [setDateRangeFilter],
  );

  // Setup data table - useDataTable will handle the filter URL synchronization
  const { table } = useDataTable({
    data: unifiedItems,
    columns,
    pageCount,
    initialState: {
      pagination: {
        pageIndex: page - 1,
        pageSize: perPage,
      },
      columnVisibility: {
        search: false,
        timestamp: false,
      },
    },
  });

  // Handle reset - reset date range to "all" (no filter)
  const handleReset = useCallback(() => {
    // Reset table column filters
    table.resetColumnFilters();
    // Reset date range to "all" (clears the filter)
    setDateRangeFilter('');
  }, [table, setDateRangeFilter]);

  // Show empty table if there's an error instead of error message
  if (isError) {
    return (
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div
        className={`transition-all duration-300 ease-in-out ${isDrawerOpen ? 'lg:w-[calc(100%-384px)] lg:pr-4' : 'w-full'}`}
      >
        <DataTable
          key={'en'}
          table={table}
          isFetching={isLoading || isThreadsLoading}
          getRowClassName={(row) => {
            const item = row.original as UnifiedHistoryItem;
            const isPending = item.type === 'voice_call' && item.status === 'PENDING';
            const currentCallId = callId || selectedCall?.id;
            const isVoiceSelected =
              isDrawerOpen &&
              !isChatDrawerOpen &&
              currentCallId &&
              item.type === 'voice_call' &&
              String(currentCallId) === String(item.id);
            const isChatSelected =
              isChatDrawerOpen &&
              selectedChatThread &&
              item.type === 'chat' &&
              String(selectedChatThread.id) === String(item.id);
            const isSelected = isVoiceSelected || isChatSelected;
            return `group ${
              isPending
                ? '!cursor-not-allowed opacity-60'
                : isSelected
                  ? isRTL
                    ? 'border-r-2 border-r-primary'
                    : 'border-l-2 border-l-primary'
                  : 'hover:bg-muted/30 cursor-pointer'
            }`;
          }}
          onRowClick={handleRowClick}
          customEmptyState={
            !isLoading &&
            data !== undefined &&
            unifiedItems.length === 0 &&
            total === 0 ? (
              <CallHistoryEmptyState />
            ) : undefined
          }
        >
          <DataTableToolbar table={table} onReset={handleReset}>
            <div className="w-full sm:max-w-[280px]">
              <DateRangeFilter
                value={{
                  preset: parsedDateRange.preset,
                  start: parsedDateRange.start,
                  end: parsedDateRange.end,
                }}
                onChange={handleDateRangeChange}
              />
            </div>
          </DataTableToolbar>
        </DataTable>
      </div>

      <CallDetailsDrawer
        call={selectedCall}
        isOpen={isDrawerOpen && !isChatDrawerOpen}
        onClose={handleDrawerClose}
        useConversationDetailsQuery={useConversationDetailsQuery}
        useJoinCallMutation={useJoinCallMutation}
        queryKeys={conversationDetailsKeys}
      />

      <ChatDetailsDrawer
        threadId={selectedChatThread?.id || null}
        threadTitle={selectedChatThread?.title || 'Chat'}
        isOpen={isChatDrawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  );
});

CallHistoryListTable.displayName = 'CallHistoryListTable';
