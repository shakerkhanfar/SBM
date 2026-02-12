import type { ConversationStatus, ChannelType } from '@/features/call-history/types';

export type HistoryItemType = 'voice_call' | 'chat';

export interface UnifiedHistoryItem {
  id: string;
  type: HistoryItemType;
  createdAt: string; // ISO date for sorting

  // Shared fields
  status?: ConversationStatus;
  channelType?: ChannelType;
  agentName?: string;
  agentId?: string;

  // Voice call fields
  duration?: number;
  cost?: number;

  // Chat fields
  threadTitle?: string;
  messageCount?: number;
}

export interface ChatKitThread {
  id: string;
  created_at: number;
  title?: string;
  metadata?: Record<string, unknown>;
  message_count?: number;
}

export interface ChatKitThreadsResponse {
  data: ChatKitThread[];
}
