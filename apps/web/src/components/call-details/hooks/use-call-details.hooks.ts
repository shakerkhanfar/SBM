/**
 * Fallback hooks and type definitions for call details
 *
 * IMPORTANT: These are fallback/placeholder hooks only.
 * Real API hooks should be passed as props from features/call-history
 *
 * The actual implementation uses:
 * - src/features/call-history/hooks/use-conversation-details.hooks.ts
 * - src/features/call-history/hooks/use-join-call.hooks.ts
 */

export interface PerformanceMetrics {
  asrProcessingTime: number;
  llmResponseTime: number;
  ttsGenerationTime: number;
  totalProcessingTime: number;
}

// Backend log format (before transformation)
export interface BackendLog {
  id?: string;
  type: 'INFO' | 'DEBUG' | 'WARNING' | 'ERROR';
  category: string;
  message: string;
  nodeId?: string;
  payload?: Record<string, unknown>;
  timestamp: string;
  createAt?: string;
  updatedAt?: string;
}

// Minimal type for fallback - matches features/call-history types
interface ConversationDetails {
  id: string;
  status: string;
  channelType?: string;
  callDuration?: number;
  performanceMetrics?: PerformanceMetrics;
  logs?: BackendLog[];
  [key: string]: any; // Allow other fields from backend
}

/**
 * Fallback query keys - should use conversationDetailsKeys from call-history feature instead
 */
export const callDetailsKeys = {
  all: ['call-details'] as const,
  detail: (id: string) => ['call-details', id] as const,
};

/**
 * Fallback hook - returns empty data
 * Real implementation should be passed as prop from call-history feature
 */
export const useConversationDetailsQuery = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _callId: string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options?: { enabled?: boolean },
) => {
  return {
    data: null as ConversationDetails | null,
    isLoading: false,
    isError: false,
    error: null,
  };
};

/**
 * Fallback hook - returns no-op mutation
 * Real implementation should be passed as prop from call-history feature
 */
export const useJoinCallMutation = () => {
  return {
    mutateAsync: async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _params: { jobId: string },
    ) => {
      console.warn(
        'Using fallback useJoinCallMutation - real hook should be passed as prop',
      );
      return { token: '' };
    },
    isPending: false,
    error: null,
  };
};
