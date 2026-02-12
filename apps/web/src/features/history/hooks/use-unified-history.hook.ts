import { useMemo } from 'react';

import type { ConversationItem } from '@/features/call-history/types';

import type { UnifiedHistoryItem, ChatKitThread } from '../types';

import { useChatKitThreadsQuery } from './use-chatkit-threads.hook';

function mapVoiceCallToHistoryItem(call: ConversationItem): UnifiedHistoryItem {
  // API returns time as a numeric string (Unix ms timestamp)
  const timestamp = Number(call.time);
  const createdAt = !isNaN(timestamp) ? new Date(timestamp).toISOString() : call.time;

  return {
    id: call.id,
    type: 'voice_call',
    createdAt,
    duration: call.duration,
    status: call.status,
    channelType: call.channelType,
    agentName: call.agentName,
    agentId: call.agentId,
    cost: call.cost,
  };
}

function mapChatThreadToHistoryItem(thread: ChatKitThread): UnifiedHistoryItem {
  return {
    id: thread.id,
    type: 'chat',
    createdAt: new Date(thread.created_at * 1000).toISOString(),
    threadTitle: thread.title || 'Untitled chat',
    status: 'COMPLETED',
    channelType: 'Chat',
    agentName: 'AI Assistant',
    messageCount: thread.message_count,
  };
}

export function useUnifiedHistory(
  voiceCalls: ConversationItem[],
  userId?: string,
) {
  const {
    data: threadsData,
    isLoading: isThreadsLoading,
  } = useChatKitThreadsQuery(userId);

  const unifiedItems = useMemo(() => {
    const voiceItems = voiceCalls.map(mapVoiceCallToHistoryItem);
    const chatItems = (threadsData?.data || []).map(mapChatThreadToHistoryItem);

    const combined = [...voiceItems, ...chatItems];
    combined.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return combined;
  }, [voiceCalls, threadsData]);

  return {
    items: unifiedItems,
    isThreadsLoading,
  };
}
