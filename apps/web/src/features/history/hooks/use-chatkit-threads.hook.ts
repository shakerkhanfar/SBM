import { useQuery } from '@tanstack/react-query';

import { getChatKitThreads } from '../api/chatkit-threads.api';

const CHATKIT_THREADS_KEY = 'chatkit-threads';

export const chatKitThreadsKeys = {
  all: [CHATKIT_THREADS_KEY] as const,
  list: (userId?: string) => [...chatKitThreadsKeys.all, 'list', userId] as const,
};

export const useChatKitThreadsQuery = (userId?: string) => {
  return useQuery({
    queryKey: chatKitThreadsKeys.list(userId),
    queryFn: () => getChatKitThreads(userId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};
