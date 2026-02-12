import { useMemo } from 'react';

import { cn } from '@/utils/cn';

import type { ConversationStatus } from '../types';
import { getCallHistoryStatusLabel } from '../utils';

interface CallHistoryStatusBadgeProps {
  status: ConversationStatus;
}

export function CallHistoryStatusBadge({
  status,
}: CallHistoryStatusBadgeProps) {
  const statusText = getCallHistoryStatusLabel(status);
  const isPending = status === 'PENDING';
  const isInProgress = status === 'IN_PROGRESS';
  const isFailed = status === 'FAILED';
  const isCompleted = status === 'COMPLETED';
  const isNoAnswer = status === 'NO_ANSWER';
  const isForwarded = status === 'FORWARDED';

  // Status colors matching knowledge base pattern
  const iconColor = useMemo(() => {
    if (isPending) return 'text-yellow-600';
    if (isInProgress) return 'text-blue-600';
    if (isCompleted) return 'text-green-600';
    if (isNoAnswer) return 'text-orange-600';
    if (isFailed) return 'text-red-600';
    if (isForwarded) return 'text-purple-600';
    return 'text-gray-400';
  }, [isPending, isInProgress, isCompleted, isNoAnswer, isFailed, isForwarded]);

  const bgColor = useMemo(() => {
    if (isPending) return 'bg-yellow-50 border-yellow-200';
    if (isInProgress) return 'bg-blue-50 border-blue-200';
    if (isCompleted) return 'bg-green-50 border-green-200';
    if (isNoAnswer) return 'bg-orange-50 border-orange-200';
    if (isFailed) return 'bg-red-50 border-red-200';
    if (isForwarded) return 'bg-purple-50 border-purple-200';
    return 'bg-gray-50 border-gray-200';
  }, [isPending, isInProgress, isCompleted, isNoAnswer, isFailed, isForwarded]);

  const textColor = useMemo(() => {
    if (isPending) return 'text-yellow-800';
    if (isInProgress) return 'text-blue-700';
    if (isCompleted) return 'text-green-700';
    if (isNoAnswer) return 'text-orange-700';
    if (isFailed) return 'text-red-700';
    if (isForwarded) return 'text-purple-700';
    return 'text-gray-700';
  }, [isPending, isInProgress, isCompleted, isNoAnswer, isFailed, isForwarded]);

  // Status indicator with animation for pending/in-progress
  const StatusIcon = useMemo(() => {
    if (isPending || isInProgress) {
      return (
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex size-2 animate-pulse rounded-full bg-current" />
        </span>
      );
    }

    return <span className="inline-flex size-2 rounded-full bg-current" />;
  }, [isPending, isInProgress]);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-medium text-xs border',
        bgColor,
      )}
    >
      <div className={cn('flex items-center justify-center', iconColor)}>
        {StatusIcon}
      </div>
      <span className={cn('text-xs font-medium', textColor)}>{statusText}</span>
    </div>
  );
}
