/**
 * Call history conversation status types
 * Based on JobStatus enum: PENDING, IN_PROGRESS, COMPLETED, NO_ANSWER, FAILED, FORWARDED
 */
export type ConversationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'NO_ANSWER'
  | 'FAILED'
  | 'FORWARDED';

/**
 * Call history sort field types
 */
export type CallHistorySortField = 'time' | 'cost' | 'duration';

/**
 * Call history sort order types
 */
export type CallHistorySortOrder = 'asc' | 'desc';

/**
 * Call history channel types
 */
export type ChannelType = 'Web' | 'Telephone' | null;

/**
 * Duration filter condition types
 */
export type DurationCondition =
  | 'IS_BETWEEN'
  | 'IS_GREATER_THAN'
  | 'IS_LESS_THAN'
  | 'IS_EQUAL_TO';

/**
 * Duration filter interface
 */
export interface DurationFilter {
  condition: DurationCondition;
  firstValue: number;
  secondValue?: number;
}

/**
 * Agent filter interface
 */
export interface AgentFilter {
  name?: string;
  id?: string;
}

/**
 * Call history list filters
 */
export interface CallHistoryFilters {
  id?: string;
  duration?: DurationFilter;
  status?: ConversationStatus[];
  channelType?: ChannelType;
  agent?: AgentFilter;
}

/**
 * Period types for date range filtering
 */
export type PeriodType =
  | 'LAST_HOUR'
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'CUSTOM';

/**
 * Call history list query parameters
 */
export interface CallHistoryListParams {
  projectId: string;
  take?: number;
  skip?: number;
  startPeriod?: number | string;
  endPeriod?: number | string;
  period?: PeriodType;
  timeZone?: string;
  timeDifference?: string;
  filters?: CallHistoryFilters;
  sortField?: CallHistorySortField;
  sortOrder?: CallHistorySortOrder;
  returnedFields: string[];
  returnActiveCalls?: boolean;
  voiceAgentId?: string;
  search?: string;
}

/**
 * Call parameters from API response
 */
export interface CallParams {
  userNumber?: string;
  machineNumber?: string;
}

/**
 * Call history conversation item from API response
 */
export interface ConversationItem {
  id: string;
  duration: number;
  time: string;
  cost: number;
  status: ConversationStatus;
  channelType: ChannelType;
  agentId: string;
  agentName: string;
  callParams?: CallParams;
}

/**
 * Call history list response from API
 */
export interface CallHistoryListResponse {
  total: number;
  filtered: number;
  data: any[]; // Full conversation objects
  conversations: ConversationItem[]; // Simplified conversation objects
}
