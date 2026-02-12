/**
 * Call history filter values and constants
 */
export const CONVERSATION_STATUS_OPTIONS = [
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Cancelled', value: 'CANCELLED' },
] as const;

export const CHANNEL_TYPE_OPTIONS = [
  { label: 'Web', value: 'Web' },
  { label: 'Phone', value: 'Phone' },
  { label: 'API', value: 'API' },
] as const;

export const DURATION_CONDITION_OPTIONS = [
  { label: 'Between', value: 'IS_BETWEEN' },
  { label: 'Greater Than', value: 'IS_GREATER_THAN' },
  { label: 'Less Than', value: 'IS_LESS_THAN' },
  { label: 'Equal To', value: 'IS_EQUAL_TO' },
] as const;

/**
 * Default fields to return from API
 */
export const DEFAULT_RETURNED_FIELDS = [
  'cost',
  'time',
  'channelType',
  'status',
  'agentId',
  'agentName',
  'callNumbers',
] as const;
