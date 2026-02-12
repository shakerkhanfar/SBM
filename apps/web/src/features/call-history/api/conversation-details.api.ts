/**
 * Conversation details API functions
 */

import { api } from '@/lib/api-client';

import { CALL_HISTORY_ENDPOINTS } from '../constants';
import { ConversationDetails } from '../types';

/**
 * Parameters for fetching conversation details
 */
export interface ConversationDetailsParams {
  conversationId: string;
  projectId: string;
  userId: string;
  apiKey: string;
}

/**
 * Fetch conversation details by ID
 */
export const getConversationDetails = async (
  params: ConversationDetailsParams,
): Promise<ConversationDetails> => {
  const { conversationId, projectId, userId, apiKey } = params;

  const response = await api.get<ConversationDetails>(
    `${CALL_HISTORY_ENDPOINTS.DETAILS}/${conversationId}`,
    {
      params: {
        projectId,
        userId,
        apiKey,
      },
    },
  );
  return response;
};
