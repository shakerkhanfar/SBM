import { createColumnHelper } from '@tanstack/react-table';
import { Phone, Globe, MoreVertical, Eye } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RelativeTimeCard } from '@/components/ui/relative-time-card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsRTL } from '@/hooks/use-is-rtl';

import type { ConversationItem, ChannelType } from '../types';

import { CallHistoryStatusBadge } from './call-history-status';

const columnHelper = createColumnHelper<ConversationItem>();

/**
 * Get icon for channel type
 */
const getChannelIcon = (type: ChannelType) => {
  switch (type) {
    case 'Telephone':
      return Phone;
    case 'Web':
      return Globe;
    default:
      return Globe;
  }
};

/**
 * Format duration in seconds to readable format
 */
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes} m ${remainingSeconds} s`
      : `${minutes} m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let result = `${hours} h`;
    if (remainingMinutes > 0) {
      result += ` ${remainingMinutes} m`;
    }
    if (remainingSeconds > 0) {
      result += ` ${remainingSeconds} s`;
    }
    return result;
  }
};

/**
 * Format cost to currency
 */
const formatCost = (cost: number): string => {
  // If decimal part is 0, display as integer, otherwise show one decimal place
  const formattedCost = cost % 1 === 0 ? cost.toString() : cost.toFixed(1);
  const creditLabel = cost === 1 ? 'credit' : 'credits';
  return `${formattedCost} ${creditLabel}`;
};

/**
 * Call history list table columns
 */
export const useCallHistoryListColumns = () => {
  const isRTL = useIsRTL();

  return [
    columnHelper.accessor('id', {
      id: 'search',
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      meta: {
        variant: 'text' as const,
        label: 'Search By Call ID, User Number, or Agent ID',
        placeholder: 'Search By Call ID, User Number, or Agent ID',
        className: 'w-full sm:w-52 lg:w-80',
      },
    }),
    columnHelper.accessor('time', {
      id: 'time',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'Time'}
        />
      ),
      cell: ({ row }) => {
        const { time } = row.original;
        return (
          <div className="flex min-w-[120px] items-center justify-start text-muted-foreground">
            <RelativeTimeCard date={new Date(time)} timezones={['UTC']} />
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
      enableHiding: false,
      meta: {
        label: 'Time',
      },
    }),
    columnHelper.accessor('time', {
      id: 'timestamp',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'Timestamp'}
        />
      ),
      cell: ({ row }) => {
        const { time } = row.original;
        const date = new Date(time);
        const locale = 'en';

        // Format full timestamp with date and time in user's timezone
        const formattedDateTime = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          numberingSystem: 'latn',
        }).format(date);

        return (
          <time
            dateTime={date.toISOString()}
            className="text-sm"
            title={formattedDateTime}
          >
            {formattedDateTime}
          </time>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: true,
      meta: {
        label: 'Timestamp',
      },
    }),

    columnHelper.accessor('agentName', {
      id: 'agentName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'Agent'}
        />
      ),
      cell: ({ row }) => {
        const { agentName, agentId } = row.original;

        return (
          <div className="max-w-[180px]">
            <div className="group flex items-center gap-1">
              <span className="truncate text-sm font-medium">{agentName}</span>
              <CopyButton
                text={agentId}
                className="size-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                variant="ghost"
                size="sm"
              />
            </div>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      meta: {
        label: 'Agent',
      },
    }),

    columnHelper.accessor((row) => row.callParams?.machineNumber ?? '', {
      id: 'agentNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'Agent Number'}
        />
      ),
      cell: ({ getValue }) => {
        const agentNumber = getValue();

        if (!agentNumber) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }

        return (
          <div className="max-w-[180px]">
            <div className="group flex items-center gap-1">
              <span className="truncate font-mono text-sm">{agentNumber}</span>
              <CopyButton
                text={agentNumber}
                className="size-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                variant="ghost"
                size="sm"
              />
            </div>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: true,
      meta: {
        label: 'Agent Number',
      },
    }),

    columnHelper.accessor((row) => row.callParams?.userNumber ?? '', {
      id: 'clientNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'User Number'}
        />
      ),
      cell: ({ getValue }) => {
        const clientNumber = getValue();

        if (!clientNumber) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }

        return (
          <div className="max-w-[180px]">
            <div className="group flex items-center gap-1">
              <span className="truncate font-mono text-sm">{clientNumber}</span>
              <CopyButton
                text={clientNumber}
                className="size-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                variant="ghost"
                size="sm"
              />
            </div>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: true,
      meta: {
        label: 'User Number',
      },
    }),

    columnHelper.accessor('channelType', {
      id: 'channelType',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'Channel'}
        />
      ),
      cell: ({ row }) => {
        const { channelType } = row.original;

        if (!channelType) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }

        const Icon = getChannelIcon(channelType);

        // Helper function to get channel name
        const getChannelName = (channel: string) => {
          const channelMap: Record<string, string> = {
            Telephone: 'Telephone',
            Web: 'Web',
          };
          return channelMap[channel] || channel;
        };

        return (
          <div className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              {getChannelName(channelType)}
            </Badge>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Channel',
        variant: 'multiSelect',
        options: [
          { label: 'Web', value: 'Web' },
          { label: 'Telephone', value: 'Telephone' },
        ],
      },
    }),

    columnHelper.accessor('duration', {
      id: 'duration',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'Duration'}
        />
      ),
      cell: ({ row }) => {
        const { duration } = row.original;

        if (duration === null || duration === undefined) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }

        return (
          <span className="font-mono text-sm">
            {formatDuration(duration)}
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
      meta: {
        label: 'Duration',
      },
    }),

    columnHelper.accessor('status', {
      id: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'Status'}
        />
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        return <CallHistoryStatusBadge status={status} />;
      },
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        label: 'Status',
        variant: 'multiSelect',
        options: [
          { label: 'Pending', value: 'PENDING' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'No Answer', value: 'NO_ANSWER' },
          { label: 'Failed', value: 'FAILED' },
          { label: 'Forwarded', value: 'FORWARDED' },
        ],
      },
    }),

    columnHelper.accessor('cost', {
      id: 'cost',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={'Cost'}
        />
      ),
      cell: ({ row }) => {
        const { cost } = row.original;
        return <span className="font-mono text-sm">{formatCost(cost)}</span>;
      },
      enableSorting: true,
      enableColumnFilter: false,
      meta: {
        label: 'Cost',
      },
    }),

    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">{'Actions'}</span>,
      cell: ({ row }) => {
        const { status } = row.original;
        const dir = isRTL ? 'rtl' : 'ltr';
        const isCompleted = status === 'COMPLETED';

        return (
          <DropdownMenu dir={dir}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="size-8 p-0"
                aria-label={'Actions'}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block w-full">
                      <DropdownMenuItem disabled={!isCompleted}>
                        <Eye className="me-2 size-4" />
                        {'View Details'}
                      </DropdownMenuItem>
                    </span>
                  </TooltipTrigger>
                  {!isCompleted && (
                    <TooltipContent>
                      <p>
                        {'Details are only available for completed calls.'}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }),
  ];
};
