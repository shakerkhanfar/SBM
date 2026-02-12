import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  exportConversations,
  type ExportConversationsParams,
} from '@/features/call-history/api/export.api';
import { useProjectStore } from '@/stores/project.store';

import { AgentListFilter } from './filters/agent-list-filter';
import { DateRangeFilter } from './filters/date-range-filter';
import { StatusFilter } from './filters/status-filter';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportFilters {
  agent: string;
  dateRange: {
    start?: string;
    end?: string;
    preset?: string;
  };
  status: string;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const selectedProject = useProjectStore((state) => state.selectedProject);

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = formatLocalDate(new Date());

  const [filters, setFilters] = useState<ExportFilters>({
    agent: '',
    dateRange: {
      start: today,
      end: today,
      preset: 'today',
    },
    status: '',
  });

  const [isExporting, setIsExporting] = useState(false);

  const getUserTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  const handleExport = async () => {
    if (!selectedProject?.value) {
      toast.error('No project selected');
      return;
    }

    // Validate agent selection
    if (!filters.agent) {
      toast.error('Please select an agent');
      return;
    }

    // Validate custom date range
    if (
      filters.dateRange.preset === 'custom' &&
      (!filters.dateRange.start || !filters.dateRange.end)
    ) {
      toast.error('Please select a date range');
      return;
    }

    setIsExporting(true);

    try {
      // Map preset values to API period values
      const periodMapping: Record<string, string> = {
        'last-hour': 'LAST_HOUR',
        today: 'TODAY',
        yesterday: 'YESTERDAY',
        'this-week': 'THIS_WEEK',
        'this-month': 'THIS_MONTH',
        custom: 'CUSTOM',
      };

      const period =
        periodMapping[filters.dateRange.preset || 'today'] || 'TODAY';

      // Build query parameters
      const params: ExportConversationsParams = {
        projectId: selectedProject.value,
        period,
        timeZone: getUserTimezone(),
        voiceAgentId: filters.agent,
      };

      // Add status if selected
      if (filters.status) {
        params.status = filters.status;
      }

      // Add startPeriod and endPeriod for custom dates
      if (
        period === 'CUSTOM' &&
        filters.dateRange.start &&
        filters.dateRange.end
      ) {
        // Start date: beginning of day (00:00:00.000)
        const startDate = new Date(filters.dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        params.startPeriod = startDate.getTime().toString();

        // End date: end of day (23:59:59.999)
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        params.endPeriod = endDate.getTime().toString();
      }

      await exportConversations(params);
      toast.success('Call history exported successfully');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export call history');
    } finally {
      setIsExporting(false);
    }
  };

  const isExportDisabled =
    isExporting ||
    !filters.agent ||
    (filters.dateRange.preset === 'custom' &&
      (!filters.dateRange.start || !filters.dateRange.end));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{'Export Call History'}</DialogTitle>
          <DialogDescription>
            {'Select date range and agent to export call history data'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {'Agent'}
            </label>
            <AgentListFilter
              value={filters.agent}
              onChange={(value) => setFilters({ ...filters, agent: value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {'Date Range'}
            </label>
            <DateRangeFilter
              value={filters.dateRange}
              onChange={(dateRange) => setFilters({ ...filters, dateRange })}
              fullWidthDropdown
              hideAllOption
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {'Status'}
            </label>
            <StatusFilter
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            {'Cancel'}
          </Button>
          <Button onClick={handleExport} disabled={isExportDisabled}>
            {isExporting
              ? 'Exporting...'
              : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
