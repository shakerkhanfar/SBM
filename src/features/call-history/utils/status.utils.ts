import type { ConversationStatus } from '../types';

/**
 * Get readable label for call history status
 * @param status - The status from the API
 * @returns Human-readable status label
 */
export function getCallHistoryStatusLabel(status: ConversationStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'NO_ANSWER':
      return 'No Answer';
    case 'FAILED':
      return 'Failed';
    case 'FORWARDED':
      return 'Forwarded';
    default:
      return 'Unknown Status';
  }
}

/**
 * Get translation key for call history status
 * @param status - The status from the API
 * @returns Translation key for the status
 */
export function getCallHistoryStatusTranslationKey(
  status: ConversationStatus,
): string {
  switch (status) {
    case 'PENDING':
      return 'call-history:status.pending';
    case 'IN_PROGRESS':
      return 'call-history:status.inProgress';
    case 'COMPLETED':
      return 'call-history:status.completed';
    case 'NO_ANSWER':
      return 'call-history:status.noAnswer';
    case 'FAILED':
      return 'call-history:status.failed';
    case 'FORWARDED':
      return 'call-history:status.forwarded';
    default:
      return 'call-history:status.pending';
  }
}
