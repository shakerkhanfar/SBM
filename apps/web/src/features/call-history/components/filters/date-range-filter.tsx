import { ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useIsRTL } from '@/hooks/use-is-rtl';

interface CallHistoryDateRange {
  start?: string;
  end?: string;
  preset?: string;
}

interface DateRangeFilterProps {
  value: CallHistoryDateRange;
  onChange: (value: CallHistoryDateRange) => void;
  disabled?: boolean;
  disabledTooltip?: string;
  fullWidthDropdown?: boolean;
  hideAllOption?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  disabled = false,
  disabledTooltip,
  fullWidthDropdown = false,
  hideAllOption = false,
}) => {
  const isRtl = useIsRTL();

  const [open, setOpen] = useState(false);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(
    value.preset,
  );
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(
    undefined,
  );
  const [calendarPosition, setCalendarPosition] = useState<'top' | 'bottom'>(
    'bottom',
  );
  const [calendarMaxHeight, setCalendarMaxHeight] = useState<
    number | undefined
  >(undefined);

  const [calendarRange, setCalendarRange] = useState<DateRange>({
    from: value.start ? new Date(value.start) : undefined,
    to: value.end ? new Date(value.end) : undefined,
  });

  useEffect(() => {
    setCalendarRange({
      from: value.start ? new Date(value.start) : undefined,
      to: value.end ? new Date(value.end) : undefined,
    });
  }, [value.start, value.end]);

  useEffect(() => {
    if (value.preset) {
      setSelectedPreset(value.preset);
    } else if (value.start && value.end) {
      // Try to detect preset from dates
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      const startDate = new Date(value.start);
      const endDate = new Date(value.end);

      if (
        startDate.getTime() === today.getTime() &&
        endDate.getTime() === today.getTime()
      ) {
        setSelectedPreset('today');
      } else if (
        startDate.getTime() === yesterday.getTime() &&
        endDate.getTime() === yesterday.getTime()
      ) {
        setSelectedPreset('yesterday');
      } else {
        setSelectedPreset('custom');
      }
    } else {
      // No dates or preset - default to "today" if "all" is hidden, otherwise "all"
      setSelectedPreset(hideAllOption ? 'today' : 'all');
    }
  }, [value.preset, value.start, value.end, hideAllOption]);

  useEffect(() => {
    if (fullWidthDropdown && triggerRef.current && open) {
      const updateWidth = () => {
        if (triggerRef.current) {
          setDropdownWidth(triggerRef.current.offsetWidth);
        }
      };
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    } else {
      setDropdownWidth(undefined);
    }
  }, [fullWidthDropdown, open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCustomCalendar &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowCustomCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomCalendar]);

  useEffect(() => {
    if (showCustomCalendar && containerRef.current) {
      const calculatePosition = () => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spacing = 8; // Space between button and calendar
        const estimatedCalendarHeight = 400; // Approximate calendar height

        const spaceBelow = viewportHeight - containerRect.bottom;
        const spaceAbove = containerRect.top;

        // Position above if there's not enough space below but enough above
        if (
          spaceBelow < estimatedCalendarHeight + spacing &&
          spaceAbove >= estimatedCalendarHeight + spacing
        ) {
          setCalendarPosition('top');
          // Set max height to available space above minus spacing
          setCalendarMaxHeight(spaceAbove - spacing);
        } else {
          // Default to bottom
          setCalendarPosition('bottom');
          // Set max height to available space below minus spacing
          setCalendarMaxHeight(spaceBelow - spacing);
        }
      };

      // Calculate position after a brief delay to ensure DOM is ready
      const timeoutId = setTimeout(calculatePosition, 0);
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition, true);
      };
    } else {
      setCalendarMaxHeight(undefined);
    }
  }, [showCustomCalendar]);

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateRangeLabel = () => {
    if (selectedPreset === 'all' && !hideAllOption)
      return 'All';
    if (
      (!selectedPreset && !value.start && !value.end) ||
      (selectedPreset === 'all' && hideAllOption)
    ) {
      // When hideAllOption is true, default to showing "today" instead of "all"
      return hideAllOption
        ? 'Today'
        : 'All';
    }
    if (selectedPreset === 'last-hour')
      return 'Last hour';
    if (selectedPreset === 'today') return 'Today';
    if (selectedPreset === 'yesterday')
      return 'Yesterday';
    if (selectedPreset === 'this-week')
      return 'This week (from Sunday)';
    if (selectedPreset === 'this-month')
      return 'This month';
    if (selectedPreset === 'custom') {
      if (!value.start && !value.end)
        return 'Select date range';
      return `${value.start} to ${value.end}`;
    }

    const now = new Date();
    const startDate = value.start ? new Date(value.start) : null;
    const endDate = value.end ? new Date(value.end) : null;

    if (!startDate || !endDate)
      return 'Select date range';

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (
      !selectedPreset &&
      value.start &&
      value.start.includes('T') &&
      value.end &&
      value.end.includes('T')
    ) {
      return 'Last hour';
    }

    const startDateOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    );
    const endDateOnly = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
    );

    if (
      startDateOnly.getTime() === today.getTime() &&
      endDateOnly.getTime() === today.getTime()
    ) {
      return 'Today';
    }

    if (
      startDateOnly.getTime() === yesterday.getTime() &&
      endDateOnly.getTime() === yesterday.getTime()
    ) {
      return 'Yesterday';
    }

    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    sunday.setHours(0, 0, 0, 0);
    if (
      startDateOnly.getTime() === sunday.getTime() &&
      endDateOnly.getTime() === today.getTime()
    ) {
      return 'This week (from Sunday)';
    }

    const firstDayString = formatLocalDate(
      new Date(now.getFullYear(), now.getMonth(), 1),
    );
    const todayString = formatLocalDate(today);

    if (value.start === firstDayString && value.end === todayString) {
      return 'This month';
    }

    if (isRtl) {
      return `${value.end} to ${value.start}`;
    }
    return `${value.start} to ${value.end}`;
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);

    if (preset === 'all') {
      onChange({
        start: undefined,
        end: undefined,
        preset: 'all',
      });
      return;
    }

    switch (preset) {
      case 'last-hour': {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        onChange({
          start: formatLocalDate(oneHourAgo),
          end: formatLocalDate(now),
          preset: 'last-hour',
        });
        break;
      }
      case 'today': {
        const today = new Date();
        const todayStr = formatLocalDate(today);
        onChange({
          start: todayStr,
          end: todayStr,
          preset: 'today',
        });
        break;
      }
      case 'yesterday': {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatLocalDate(yesterday);
        onChange({
          start: yesterdayStr,
          end: yesterdayStr,
          preset: 'yesterday',
        });
        break;
      }
      case 'this-week': {
        const now = new Date();
        const sunday = new Date(now);
        sunday.setDate(now.getDate() - now.getDay());
        sunday.setHours(0, 0, 0, 0);
        const today = new Date();
        onChange({
          start: formatLocalDate(sunday),
          end: formatLocalDate(today),
          preset: 'this-week',
        });
        break;
      }
      case 'this-month': {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const today = new Date();
        onChange({
          start: formatLocalDate(firstDay),
          end: formatLocalDate(today),
          preset: 'this-month',
        });
        break;
      }
      case 'custom':
        onChange({
          start: undefined,
          end: undefined,
          preset: 'custom',
        });
        setShowCustomCalendar(true);
        setOpen(false);
        return;
      default:
        return;
    }
  };

  const handleCustomSelect = (range: DateRange | undefined) => {
    if (!range) return;
    setCalendarRange(range);

    if (range.from && range.to) {
      setSelectedPreset('custom');
      onChange({
        start: formatLocalDate(range.from),
        end: formatLocalDate(range.to),
        preset: 'custom',
      });
    }
  };

  return (
    <TooltipProvider>
      <div ref={containerRef} className="relative w-full" dir="auto">
        {disabled && disabledTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenu open={false} onOpenChange={() => {}}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={disabled}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4" />
                        <span className="truncate">{getDateRangeLabel()}</span>
                      </div>
                      <ChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </DropdownMenu>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{disabledTooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  ref={triggerRef}
                  variant="outline"
                  className="w-full justify-between"
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-4" />
                    <span className="truncate">{getDateRangeLabel()}</span>
                  </div>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRtl ? 'end' : 'start'}
                className={fullWidthDropdown ? '' : 'w-48'}
                style={
                  fullWidthDropdown && dropdownWidth
                    ? { width: `${dropdownWidth}px` }
                    : undefined
                }
              >
                {!hideAllOption && (
                  <DropdownMenuItem onClick={() => handlePresetSelect('all')}>
                    {'All'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => handlePresetSelect('last-hour')}
                >
                  {'Last hour'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePresetSelect('today')}>
                  {'Today'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePresetSelect('yesterday')}
                >
                  {'Yesterday'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePresetSelect('this-week')}
                >
                  {'This week (from Sunday)'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePresetSelect('this-month')}
                >
                  {'This month'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePresetSelect('custom')}>
                  {'Custom'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {showCustomCalendar && (
              <div
                ref={calendarRef}
                className={`absolute end-0 z-10 w-auto rounded border border-border bg-background p-1 shadow-lg ${
                  calendarPosition === 'top'
                    ? 'bottom-full mb-2'
                    : 'top-full mt-2'
                }`}
                style={{
                  ...(calendarMaxHeight !== undefined && {
                    maxHeight: `${calendarMaxHeight}px`,
                    overflowY: 'auto',
                  }),
                }}
              >
                <Calendar
                  mode="range"
                  selected={calendarRange}
                  onSelect={handleCustomSelect}
                  numberOfMonths={1}
                  defaultMonth={(() => {
                    const prevMonth = new Date();
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    return prevMonth;
                  })()}
                  className="mx-auto"
                  required={false}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);
                    return date > today;
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
};
