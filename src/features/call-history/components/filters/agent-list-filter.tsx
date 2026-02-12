import React from 'react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useAgentsForDropdown } from '@/features/agents/hooks/use-agents-query';
import { useProjectStore } from '@/stores/project.store';

interface AgentListFilterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  disabledTooltip?: string;
}

const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const AgentListFilter: React.FC<AgentListFilterProps> = ({
  value,
  onChange,
  disabled = false,
  disabledTooltip,
}) => {
  const selectedProject = useProjectStore((state) => state.selectedProject);

  const { data: agents, isLoading } = useAgentsForDropdown(
    selectedProject?.value,
    { staleTime: 0 },
  );

  const AGENTS =
    agents?.map((agent) => ({
      value: agent.value,
      label:
        typeof agent.label === 'string'
          ? agent.label
          : String(agent.label || 'Unknown Agent'),
      type:
        typeof agent.type === 'string'
          ? agent.type
          : String(agent.type || 'Unknown Type'),
    })) || [];

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  // Handle empty state
  if (AGENTS.length === 0) {
    return (
      <TooltipProvider>
        <div dir="auto">
          <Select value={value} onValueChange={onChange} disabled={true}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={'No agents available'}
              />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                {'No agents available'}
              </div>
            </SelectContent>
          </Select>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div dir="auto">
        {disabled && disabledTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Select
                  value={value}
                  onValueChange={onChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={'Select an agent'}
                    >
                      {AGENTS.find((agent) => agent.value === value)?.label && (
                        <span className="truncate">
                          {truncateText(
                            AGENTS.find((agent) => agent.value === value)
                              ?.label || '',
                          )}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {AGENTS.map((agent) => (
                      <Tooltip key={agent.value}>
                        <TooltipTrigger asChild>
                          <SelectItem
                            value={agent.value}
                            className="cursor-pointer"
                          >
                            <span className="block max-w-[200px] truncate">
                              {truncateText(agent.label, 25)}
                            </span>
                          </SelectItem>
                        </TooltipTrigger>
                        {agent.label.length > 25 && (
                          <TooltipContent side="right" align="center">
                            <p className="max-w-[300px] break-words">
                              {agent.label}
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{disabledTooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={'Select an agent'}
              >
                {AGENTS.find((agent) => agent.value === value)?.label && (
                  <span className="truncate">
                    {truncateText(
                      AGENTS.find((agent) => agent.value === value)?.label ||
                        '',
                    )}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {AGENTS.map((agent) => (
                <Tooltip key={agent.value}>
                  <TooltipTrigger asChild>
                    <SelectItem value={agent.value} className="cursor-pointer">
                      <span className="block max-w-[200px] truncate">
                        {truncateText(agent.label, 25)}
                      </span>
                    </SelectItem>
                  </TooltipTrigger>
                  {agent.label.length > 25 && (
                    <TooltipContent side="right" align="center">
                      <p className="max-w-[300px] break-words">{agent.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </TooltipProvider>
  );
};
