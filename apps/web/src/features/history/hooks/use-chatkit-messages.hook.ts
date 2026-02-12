import { useQuery } from '@tanstack/react-query';

import { getChatKitThreadMessages } from '../api/chatkit-messages.api';

const CHATKIT_MESSAGES_KEY = 'chatkit-messages';

export const chatKitMessagesKeys = {
  all: [CHATKIT_MESSAGES_KEY] as const,
  thread: (threadId: string) => [...chatKitMessagesKeys.all, threadId] as const,
};

export const useChatKitMessagesQuery = (threadId?: string) => {
  return useQuery({
    queryKey: chatKitMessagesKeys.thread(threadId!),
    queryFn: () => getChatKitThreadMessages(threadId!),
    enabled: !!threadId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
