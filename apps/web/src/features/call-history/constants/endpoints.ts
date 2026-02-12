/**
 * Call history API endpoints
 */
export const CALL_HISTORY_ENDPOINTS = {
  LIST: '/v1/voice-agents/conversations/list',
  DETAILS: 'v1/voice-agents/conversation',
  JOIN_CALL: '/v1/voice-agents/join-call',
} as const;
