import { useQuery } from '@tanstack/react-query';

import { useProjectStore } from '@/stores/project.store';

import { getCallHistoryList } from '../api';
import { CallHistoryListParams } from '../types';

/**
 * Query key factory for call history list
 */
const CALL_HISTORY_LIST_KEY = 'call-history-list';

export const callHistoryListKeys = {
  all: [CALL_HISTORY_LIST_KEY] as const,
  lists: () => [...callHistoryListKeys.all, 'list'] as const,
  list: (params: Omit<CallHistoryListParams, 'skip' | 'take'>) =>
    [...callHistoryListKeys.lists(), params] as const,
  paginatedList: (params: CallHistoryListParams) =>
    [...callHistoryListKeys.lists(), 'paginated', params] as const,
};

/**
 * Server-side paginated hook for call history list
 * Used for proper table pagination with filters
 */
export const useCallHistoryListQuery = (
  params: Omit<CallHistoryListParams, 'projectId'>,
  options?: {
    enabled?: boolean;
  },
) => {
  const { enabled = true } = options || {};
  const selectedProject = useProjectStore((state) => state.selectedProject);

  // Don't run query if no project is selected
  const shouldRun = enabled && !!selectedProject?.value;

  const queryParams = selectedProject
    ? {
        ...params,
        projectId: selectedProject.value,
      }
    : null;

  return useQuery({
    queryKey: callHistoryListKeys.paginatedList(queryParams!),
    queryFn: () => getCallHistoryList(queryParams!),
    enabled: shouldRun,
    staleTime: 0, // Always consider data stale to refetch on page focus
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
};
