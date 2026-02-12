import { ChevronDown, FileUp as Export } from 'lucide-react';
import { useState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CallHistoryListTable,
  type CallHistoryListTableRef,
  ExportDialog,
} from '@/features/call-history/components';
import type { UnifiedHistoryItem } from '@/features/history/types';
import { exportToExcel } from '@/utils/csv-export';

export default function CallHistoryPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const tableRef = useRef<CallHistoryListTableRef>(null);

  const handleExportCurrentPage = async () => {
    const currentPageData = tableRef.current?.getCurrentPageData();
    if (!currentPageData || currentPageData.length === 0) {
      return;
    }

    // Map status to translation key format
    const statusMap: Record<string, string> = {
      COMPLETED: 'completed',
      FAILED: 'failed',
      IN_PROGRESS: 'inProgress',
      NO_ANSWER: 'noAnswer',
      PENDING: 'pending',
      FORWARDED: 'forwarded',
    };

    const statusLabelMap: Record<string, string> = {
      completed: 'Completed',
      failed: 'Failed',
      inProgress: 'In Progress',
      noAnswer: 'No Answer',
      pending: 'Pending',
      forwarded: 'Forwarded',
    };

    // Format data for Excel export
    const excelData = currentPageData.map((item: UnifiedHistoryItem) => ({
      ['Type']: item.type === 'chat' ? 'Chat' : 'Voice Call',
      ['Time']: new Date(item.createdAt).toLocaleString(),
      ['Agent']: item.agentName || '',
      ['Status']:
        item.status
          ? statusLabelMap[statusMap[item.status] || item.status.toLowerCase()] ||
            item.status
          : '-',
      ['Duration (seconds)']: item.duration || 0,
      ['Cost']: item.cost || 0,
      ['Channel']: item.channelType || '',
      ['ID']: item.id,
    }));

    // Define column widths for better readability
    const columnWidths = [
      12, // Type
      25, // Time
      25, // Agent
      15, // Status
      18, // Duration
      15, // Cost
      12, // Channel
      40, // ID
    ];

    const filename = `call-history-${new Date().toISOString().split('T')[0]}`;
    await exportToExcel(excelData, filename, { columnWidths });
  };

  const handleExportWithFilters = () => {
    setIsExportDialogOpen(true);
  };

  return (
    <>
      <div
        className={`mx-auto px-4 ${isDrawerOpen ? 'sm:px-6 lg:px-8' : 'sm:px-12 xl:px-32'}`}
      >
        <div className="flex flex-1 flex-col space-y-6">
          <div className="mt-6 flex flex-col gap-4 border-b pb-3 md:flex-row md:items-start md:justify-between md:gap-0">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {'History'}
              </h1>
              <p className="text-muted-foreground">
                {'View and manage your conversation history'}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4 md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Export className="size-4" />
                    {'Export'}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => void handleExportCurrentPage()}
                  >
                    {'Export Current Page'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportWithFilters}>
                    {'Export with Filters'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CallHistoryListTable
            ref={tableRef}
            onDrawerStateChange={setIsDrawerOpen}
          />
        </div>
      </div>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </>
  );
}
