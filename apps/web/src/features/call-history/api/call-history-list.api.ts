/**
 * Call history list API functions
 */

import { api } from '@/lib/api-client';

import { CALL_HISTORY_ENDPOINTS, DEFAULT_RETURNED_FIELDS } from '../constants';
import { CallHistoryListParams, CallHistoryListResponse } from '../types';

/**
 * Fetch call history list with pagination and filters
 * Supports filtering by date range, status, channel type, duration, and agent
 */
export const getCallHistoryList = async (
  params: CallHistoryListParams,
): Promise<CallHistoryListResponse> => {
  const {
    projectId,
    take = 10,
    skip = 1,
    startPeriod,
    endPeriod,
    filters,
    sortField,
    sortOrder,
    returnedFields = DEFAULT_RETURNED_FIELDS,
    returnActiveCalls,
    voiceAgentId,
  } = params;

  // Build request body according to API specification
  const requestBody: Record<string, any> = {
    projectId,
    take,
    skip,
    // Flatten filters to top-level properties
    ...(filters?.status && { status: filters.status }),
    ...(filters?.channelType && { channelType: filters.channelType }),
    ...(filters?.agent && { agent: filters.agent }),
    ...(filters?.duration && { duration: filters.duration }),
    ...(filters?.id && { id: filters.id }),
    ...(sortField && { sortField }),
    ...(sortOrder && { sortOrder }),
    ...(returnActiveCalls !== undefined && { returnActiveCalls }),
    ...(voiceAgentId && { voiceAgentId }),
    ...(params.search && { search: params.search }),
    returnedFields: [...returnedFields],
  };

  // Add period-related fields if provided
  if (params.period) {
    requestBody.period = params.period;
  }
  if (startPeriod) {
    // Convert to string if it's a number (timestamp in milliseconds)
    requestBody.startPeriod =
      typeof startPeriod === 'number' ? startPeriod.toString() : startPeriod;
  }
  if (endPeriod) {
    // Convert to string if it's a number (timestamp in milliseconds)
    requestBody.endPeriod =
      typeof endPeriod === 'number' ? endPeriod.toString() : endPeriod;
  }
  if (params.timeZone) {
    requestBody.timeZone = params.timeZone;
  }
  if (params.timeDifference) {
    requestBody.timeDifference = params.timeDifference;
  }

  const response = await api.post<CallHistoryListResponse>(
    CALL_HISTORY_ENDPOINTS.LIST,
    requestBody,
  );

  // The response is already the data we want (total, filtered, conversations, etc.)
  return response;
};
