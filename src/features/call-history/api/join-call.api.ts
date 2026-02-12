/**
 * Join call API functions
 */

import { api } from '@/lib/api-client';

import { CALL_HISTORY_ENDPOINTS } from '../constants';

/**
 * Join call request body
 */
export interface JoinCallRequest {
  projectId: string;
  jobId: string;
}

/**
 * Join call response
 */
export interface JoinCallResponse {
  token: string;
  message: string;
}

/**
 * Join a call as a listener
 */
export const joinCall = async (
  request: JoinCallRequest,
): Promise<JoinCallResponse> => {
  const response = await api.post<JoinCallResponse>(
    CALL_HISTORY_ENDPOINTS.JOIN_CALL,
    request,
  );

  return response;
};
