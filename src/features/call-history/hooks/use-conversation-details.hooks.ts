import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/lib/auth';
import { useProjectStore } from '@/stores/project.store';

import { getConversationDetails } from '../api';
import type { ConversationDetails } from '../types';

/**
 * Query key factory for conversation details
 */
const CONVERSATION_DETAILS_KEY = 'conversation-details';

export const conversationDetailsKeys = {
  all: [CONVERSATION_DETAILS_KEY] as const,
  details: () => [...conversationDetailsKeys.all, 'detail'] as const,
  detail: (conversationId: string) =>
    [...conversationDetailsKeys.details(), conversationId] as const,
};

/**
 * Hook for fetching conversation details by ID
 */
export const useConversationDetailsQuery = (
  conversationId: string | null,
  options?: {
    enabled?: boolean;
  },
) => {
  const { enabled = true } = options || {};
  const { data: user } = useUser();
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const defaultApiKey = useProjectStore((state) => state.defaultApiKey);

  // Check if we have all required parameters
  const hasRequiredParams = !!(
    conversationId &&
    selectedProject?.value &&
    user?.id &&
    defaultApiKey
  );

  return useQuery<ConversationDetails>({
    queryKey: conversationDetailsKeys.detail(conversationId!),
    queryFn: async () => {
      const response = await getConversationDetails({
        conversationId: conversationId!,
        projectId: selectedProject!.value,
        userId: user!.id,
        apiKey: defaultApiKey!,
      });
      return response;
    },
    enabled: enabled && hasRequiredParams,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: (query) => {
      // If data is incomplete (mediaUrl and jobResponse are null), poll every 30 seconds
      if (
        query.state.data &&
        !query.state.data.mediaUrl &&
        !query.state.data.jobResponse
      ) {
        return 30 * 1000; // 30 seconds
      }
      // Otherwise, don't poll
      return false;
    },
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  });
};
