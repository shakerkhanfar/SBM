import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface RelativeTimeCardProps {
  date: string | Date;
  className?: string;
  timezones?: string[];
}

export function RelativeTimeCard({ date, className }: RelativeTimeCardProps) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const relative = formatDistanceToNow(d, { addSuffix: true });
  const full = d.toLocaleString();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{relative}</span>
      </TooltipTrigger>
      <TooltipContent>{full}</TooltipContent>
    </Tooltip>
  );
}
