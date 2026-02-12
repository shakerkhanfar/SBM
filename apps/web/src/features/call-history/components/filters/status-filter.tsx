import React from 'react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export type ConversationStatusFilter =
  | 'COMPLETED'
  | 'PENDING'
  | 'FAILED'
  | 'IN_PROGRESS'
  | 'NO_ANSWER'
  | 'FORWARDED';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ALL_STATUS_VALUE = '__ALL__';

const STATUS_OPTIONS: Array<{
  value: ConversationStatusFilter;
  label: string;
}> = [
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'NO_ANSWER', label: 'No Answer' },
  { value: 'FORWARDED', label: 'Forwarded' },
];

export const StatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handleValueChange = (newValue: string) => {
    // If "All" is selected, clear the filter by passing empty string
    if (newValue === ALL_STATUS_VALUE) {
      onChange('');
    } else {
      onChange(newValue);
    }
  };

  // Use ALL_STATUS_VALUE when value is empty to show "All" as selected
  const selectValue = value || ALL_STATUS_VALUE;

  return (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={'Select status'}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_STATUS_VALUE} className="cursor-pointer">
          {'All'}
        </SelectItem>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
